import { useState, useRef, useCallback, useEffect } from 'react';
import { VoiceState } from '@/lib/types';
import { voiceSettings, apiEndpoints } from '@/lib/constants';
import { evaluateVoiceQuality, standardizeErrorMessage } from '@/lib/utils';

interface UseVoiceRecognitionOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseVoiceRecognitionReturn {
  voiceState: VoiceState;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  uploadAudioFile: (file: File) => Promise<string>;
  resetTranscript: () => void;
  isSupported: boolean;
}

// 型定義の修正
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly confidence: number;
  readonly transcript: string;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const useVoiceRecognition = (
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn => {
  const {
    onTranscript,
    onError,
    language = voiceSettings.speechRecognition.language,
    continuous = voiceSettings.speechRecognition.continuous,
    interimResults = voiceSettings.speechRecognition.interimResults
  } = options;

  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    confidence: null,
    warnings: [],
    quality: 'poor'
  });

  const [transcript, setTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // ブラウザサポート確認（クライアントサイドでのみ実行）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      setIsSupported(supported);
    }
  }, []);

  // 音声認識の初期化
  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();

    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setVoiceState(prev => ({
        ...prev,
        isListening: true,
        warnings: []
      }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;
        const confidence = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += transcriptPart;
          
          // 信頼度の評価
          if (confidence !== undefined) {
            const quality = evaluateVoiceQuality(confidence);
            setVoiceState(prev => ({
              ...prev,
              confidence,
              quality,
              warnings: quality === 'poor' 
                ? ['音声の品質が低いです。もう一度お試しください。']
                : []
            }));
          }
        } else {
          interimTranscript += transcriptPart;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        onTranscript?.(finalTranscript, true);
      } else if (interimTranscript) {
        onTranscript?.(interimTranscript, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = '';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = '音声が検出されませんでした。もう一度お試しください。';
          break;
        case 'audio-capture':
          errorMessage = 'マイクにアクセスできません。マイクの許可を確認してください。';
          break;
        case 'not-allowed':
          errorMessage = 'マイクの使用が許可されていません。ブラウザの設定を確認してください。';
          break;
        case 'network':
          errorMessage = 'ネットワークエラーが発生しました。';
          break;
        default:
          errorMessage = `音声認識エラー: ${event.error}`;
      }

      setVoiceState(prev => ({
        ...prev,
        isListening: false,
        warnings: [errorMessage]
      }));

      onError?.(errorMessage);
    };

    recognition.onend = () => {
      setVoiceState(prev => ({
        ...prev,
        isListening: false
      }));
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported, language, continuous, interimResults, onTranscript, onError]);

  // 音声認識開始
  const startListening = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      const error = 'お使いのブラウザは音声認識に対応していません。';
      onError?.(error);
      throw new Error(error);
    }

    if (!recognitionRef.current) {
      const error = '音声認識の初期化に失敗しました。';
      onError?.(error);
      throw new Error(error);
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      const errorMessage = standardizeErrorMessage(error);
      setVoiceState(prev => ({
        ...prev,
        warnings: [errorMessage]
      }));
      onError?.(errorMessage);
      throw error;
    }
  }, [isSupported, onError]);

  // 音声認識停止
  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  }, [voiceState.isListening]);

  // 音声ファイルアップロード（簡易版 - APIキー設定後に有効化）
  const uploadAudioFile = useCallback(async (file: File): Promise<string> => {
    setVoiceState(prev => ({
      ...prev,
      isProcessing: true,
      warnings: []
    }));

    try {
      // ファイルサイズチェック
      if (file.size > voiceSettings.maxFileSize) {
        throw new Error(`ファイルサイズが上限（${voiceSettings.maxFileSize / 1024 / 1024}MB）を超えています。`);
      }

      // ファイル形式チェック
      if (!voiceSettings.supportedFormats.includes(file.type)) {
        throw new Error('サポートされていないファイル形式です。');
      }

      // 一時的なモック応答（APIキー設定後に実際のAPI呼び出しに変更）
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機でAPI呼び出しをシミュレート
      
      const mockTranscript = `[音声ファイル: ${file.name}からの転写結果] テスト用の転写テキストです。実際のAPI連携後に正しい転写結果が表示されます。`;
      
      setTranscript(prev => prev + mockTranscript);
      onTranscript?.(mockTranscript, true);

      return mockTranscript;
    } catch (error) {
      const errorMessage = standardizeErrorMessage(error);
      setVoiceState(prev => ({
        ...prev,
        warnings: [errorMessage]
      }));
      onError?.(errorMessage);
      throw error;
    } finally {
      setVoiceState(prev => ({
        ...prev,
        isProcessing: false
      }));
    }
  }, [onTranscript, onError]);

  // 転写テキストリセット
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setVoiceState(prev => ({
      ...prev,
      confidence: null,
      warnings: [],
      quality: 'poor'
    }));
  }, []);

  return {
    voiceState,
    transcript,
    startListening,
    stopListening,
    uploadAudioFile,
    resetTranscript,
    isSupported
  };
};
