import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PatientInfo, InterviewAnswer } from '@/lib/types';
import { questions } from '@/lib/constants';
import { generateTimestamp } from '@/lib/utils';
import { useVoiceRecognition } from '@/components/hooks/useVoiceRecognition';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent, CardSection } from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

interface InterviewScreenProps {
  patientInfo: PatientInfo;
  initialAnswers: InterviewAnswer[];
  onComplete: (answers: InterviewAnswer[]) => void;
  onBack: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = React.memo(({
  patientInfo,
  initialAnswers,
  onComplete,
  onBack,
  isProcessing,
  setIsProcessing
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>(initialAnswers);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 音声認識のコールバックをメモ化
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setCurrentAnswer(prev => prev + text + ' ');
      setInterimTranscript('');
    } else {
      setInterimTranscript(text);
    }
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    console.error('音声認識エラー:', error);
  }, []);

  const {
    voiceState,
    transcript,
    startListening,
    stopListening,
    uploadAudioFile,
    resetTranscript,
    isSupported: isVoiceSupported
  } = useVoiceRecognition({
    onTranscript: handleTranscript,
    onError: handleVoiceError
  });

  // 質問変更時の初期化（最適化版）
  useEffect(() => {
    const existingAnswer = answers.find((_, index) => index === currentQuestionIndex);
    if (existingAnswer) {
      setCurrentAnswer(existingAnswer.answer);
    } else {
      setCurrentAnswer('');
    }
    setInterimTranscript('');
    resetTranscript();
  }, [currentQuestionIndex, answers, resetTranscript]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canGoNext = currentAnswer.trim().length > 0;
  const canGoPrev = currentQuestionIndex > 0;

  // 音声認識開始/停止（メモ化）
  const handleVoiceToggle = useCallback(async () => {
    try {
      if (voiceState.isListening) {
        stopListening();
      } else {
        await startListening();
      }
    } catch (error) {
      console.error('音声認識の開始に失敗:', error);
    }
  }, [voiceState.isListening, startListening, stopListening]);

  // 音声ファイルアップロード（メモ化）
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const transcriptText = await uploadAudioFile(file);
      setCurrentAnswer(prev => prev + transcriptText + ' ');
    } catch (error) {
      console.error('音声ファイルの処理に失敗:', error);
    } finally {
      setIsProcessing(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploadAudioFile, setIsProcessing]);

  // 回答保存（メモ化）
  const saveCurrentAnswer = useCallback(() => {
    if (!currentAnswer.trim()) return;

    const answerData: InterviewAnswer = {
      question: currentQuestion,
      answer: currentAnswer.trim(),
      timestamp: generateTimestamp()
    };

    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answerData;
      return newAnswers;
    });
  }, [currentAnswer, currentQuestion, currentQuestionIndex]);

  // 次の質問へ（メモ化）
  const handleNext = useCallback(() => {
    saveCurrentAnswer();
    
    if (isLastQuestion) {
      // 問診完了
      const finalAnswers = [...answers];
      finalAnswers[currentQuestionIndex] = {
        question: currentQuestion,
        answer: currentAnswer.trim(),
        timestamp: generateTimestamp()
      };
      onComplete(finalAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [saveCurrentAnswer, isLastQuestion, answers, currentQuestionIndex, currentQuestion, currentAnswer, onComplete]);

  // 前の質問へ（メモ化）
  const handlePrevious = useCallback(() => {
    saveCurrentAnswer();
    setCurrentQuestionIndex(prev => prev - 1);
  }, [saveCurrentAnswer]);

  // 回答履歴の表示（メモ化）
  const getAnswerHistory = useCallback(() => {
    return answers
      .filter((_, index) => index < currentQuestionIndex)
      .map((answer, index) => (
        <div key={index} className="mb-2 p-2 bg-green-50 border-l-4 border-green-500 rounded">
          <div className="text-sm font-medium text-green-800 mb-1">
            質問{index + 1}: {answer.question}
          </div>
          <div className="text-sm text-green-700">
            回答: {answer.answer}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {answer.timestamp}
          </div>
        </div>
      ));
  }, [answers, currentQuestionIndex]);

  return (
    <div className="max-w-4xl mx-auto">
      <Card padding="none">
        {/* ヘッダー */}
        <CardHeader backgroundColor="blue" icon="💬">
          {patientInfo.department} 音声問診
        </CardHeader>

        <CardContent>
          {/* プログレスバー */}
          <div className="mb-6">
            <ProgressBar
              current={currentQuestionIndex + 1}
              total={questions.length}
              label="進捗状況"
              showPercentage={true}
              showFraction={true}
            />
          </div>

          {/* 質問表示 */}
          <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">💬</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  質問 {currentQuestionIndex + 1}/{questions.length}
                </h3>
                <p className="text-gray-700">{currentQuestion}</p>
              </div>
            </div>
          </div>

          {/* 回答入力エリア */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🗣️ あなたの回答
            </label>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="こちらに症状や気になることを入力してください。音声入力も利用できます。"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              autoComplete="off"
            />
            
            {/* 音声認識の中間結果表示（分離） */}
            {interimTranscript && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-600 mb-1">音声認識中:</p>
                <p className="text-sm text-blue-800">{interimTranscript}</p>
              </div>
            )}
          </div>

          {/* 音声機能ボタン */}
          <div className="space-y-3 mb-6 md:space-y-0 md:space-x-3 md:flex">
            {/* 音声認識ボタン */}
            <Button
              variant={voiceState.isListening ? 'danger' : 'success'}
              fullWidth={true}
              className="md:w-auto md:flex-1"
              onClick={handleVoiceToggle}
              disabled={!isVoiceSupported || isProcessing}
              icon="🎤"
            >
              {voiceState.isListening ? '音声認識中... クリックで停止' : '音声入力'}
            </Button>

            {/* 音声ファイルボタン */}
            <div className="md:flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <Button
                variant="info"
                fullWidth={true}
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                isLoading={isProcessing}
                icon="📁"
              >
                音声ファイル
              </Button>
            </div>
          </div>

          {/* 音声状態とワーニング表示 */}
          {voiceState.warnings.length > 0 && (
            <div className="mb-4">
              {voiceState.warnings.map((warning, index) => (
                <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-2">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">{warning}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 音声品質表示 */}
          {voiceState.confidence !== null && (
            <div className="mb-4 text-sm text-gray-600">
              音声品質: 
              <span className={`ml-2 font-medium ${
                voiceState.quality === 'excellent' ? 'text-green-600' :
                voiceState.quality === 'good' ? 'text-blue-600' :
                voiceState.quality === 'fair' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {voiceState.quality === 'excellent' ? '優秀' :
                 voiceState.quality === 'good' ? '良好' :
                 voiceState.quality === 'fair' ? '普通' : '要改善'}
              </span>
              （信頼度: {Math.round(voiceState.confidence * 100)}%）
            </div>
          )}

          {/* 回答履歴 */}
          {answers.length > 0 && (
            <CardSection
              title="これまでの回答履歴"
              icon="📝"
              backgroundColor="green"
              borderLeft={true}
              collapsible={true}
              defaultExpanded={false}
            >
              <div className="max-h-40 overflow-y-auto">
                {getAnswerHistory()}
              </div>
            </CardSection>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex space-x-3 pt-6">
            <Button
              variant="secondary"
              onClick={onBack}
              disabled={isProcessing}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              患者情報に戻る
            </Button>

            <div className="flex-1 flex space-x-3">
              <Button
                variant="secondary"
                onClick={handlePrevious}
                disabled={!canGoPrev || isProcessing}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                前の質問
              </Button>

              <Button
                variant={isLastQuestion ? 'success' : 'primary'}
                onClick={handleNext}
                disabled={!canGoNext || isProcessing}
                className="flex-1"
                icon={
                  isLastQuestion ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )
                }
              >
                {isLastQuestion ? '問診完了' : '次の質問'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

InterviewScreen.displayName = 'InterviewScreen';

export default InterviewScreen;
