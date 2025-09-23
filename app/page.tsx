'use client';

import { useState, useCallback } from 'react';
import { PatientInfo, InterviewAnswer, AIAnalysisResult, ScreenType } from '@/lib/types';

// 画面コンポーネントのインポート
import PatientInfoScreen from '@/components/screens/PatientInfoScreen';
import InterviewScreen from '@/components/screens/InterviewScreen';
import ConfirmationScreen from '@/components/screens/ConfirmationScreen';
import CompletionScreen from '@/components/screens/CompletionScreen';
// import DoctorScreen from '@/components/screens/DoctorScreen';

export default function Home() {
  // アプリケーション状態管理
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('patientInfo');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [interviewAnswers, setInterviewAnswers] = useState<InterviewAnswer[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 画面遷移ハンドラー
  const handleScreenChange = useCallback((screen: ScreenType) => {
    setCurrentScreen(screen);
  }, []);

  // 患者情報完了ハンドラー
  const handlePatientInfoComplete = useCallback((info: PatientInfo) => {
    setPatientInfo(info);
    setCurrentScreen('interview');
  }, []);

  // 問診完了ハンドラー
  const handleInterviewComplete = useCallback((answers: InterviewAnswer[]) => {
    setInterviewAnswers(answers);
    setCurrentScreen('confirmation');
  }, []);

  // 確認完了ハンドラー
  const handleConfirmationComplete = useCallback((analysis: AIAnalysisResult) => {
    setAiAnalysis(analysis);
    setCurrentScreen('completion');
  }, []);

  // データリセットハンドラー
  const handleReset = useCallback(() => {
    setPatientInfo(null);
    setInterviewAnswers([]);
    setAiAnalysis(null);
    setIsProcessing(false);
    setCurrentScreen('patientInfo');
  }, []);

  // 問診データ修正ハンドラー
  const handleEditAnswers = useCallback(() => {
    setCurrentScreen('interview');
  }, []);

  // 医師画面遷移ハンドラー
  const handleViewDoctorScreen = useCallback(() => {
    setCurrentScreen('doctor');
  }, []);

  // 画面レンダリング
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'patientInfo':
        return (
          <PatientInfoScreen
            onComplete={handlePatientInfoComplete}
            isProcessing={isProcessing}
          />
        );

      case 'interview':
        return (
          <InterviewScreen
            patientInfo={patientInfo!}
            initialAnswers={interviewAnswers}
            onComplete={handleInterviewComplete}
            onBack={() => setCurrentScreen('patientInfo')}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        );

      case 'confirmation':
        return (
          <ConfirmationScreen
            patientInfo={patientInfo!}
            interviewAnswers={interviewAnswers}
            onComplete={handleConfirmationComplete}
            onEditAnswers={handleEditAnswers}
            onBack={() => setCurrentScreen('interview')}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        );

      case 'completion':
        return (
          <CompletionScreen
            onViewDoctorScreen={handleViewDoctorScreen}
            onReset={handleReset}
          />
        );

      case 'doctor':
        return (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                医師管理画面
              </h1>
              <p className="text-gray-600 mb-4">
                準備中...
              </p>
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                最初に戻る
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                画面作成中...
              </h1>
              <button
                onClick={handleReset}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                最初に戻る
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {renderCurrentScreen()}
      </div>
    </div>
  );
}
