import React, { useState, useEffect, useRef } from 'react';
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

const InterviewScreen: React.FC<InterviewScreenProps> = ({
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

  const {
    voiceState,
    transcript,
    startListening,
    stopListening,
    uploadAudioFile,
    resetTranscript,
    isSupported: isVoiceSupported
  } = useVoiceRecognition({
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        setCurrentAnswer(prev => prev + text + ' ');
        setInterimTranscript('');
      } else {
        setInterimTranscript(text);
      }
    },
    onError: (error) => {
      console.error('音声認識エラー:', error);
    }
  });

  // 質問変更時の初期化
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

  // 音声認識開始/停止
  const handleVoiceToggle = async () => {
    try {
      if (voiceState.isListening) {
        stopListening();
      } else {
        await startListening();
      }
    } catch (error) {
      console.error('音声認識の開始に失敗:', error);
    }
  };

  // 音声ファイルアップロード
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // 回答保存
  const saveCurrentAnswer = () => {
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
  };

  // 次の質問へ
  const handleNext = () => {
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
  };

  // 前の質問へ
  const handlePrevious = () => {
    saveCurrentAnswer();
    setCurrentQuestionIndex(prev => prev - 1);
  };

  // 回答履歴の表示
  const getAnswerHistory = () => {
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
  };

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
