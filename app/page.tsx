'use client';

import { useState, useCallback } from 'react';
import { PatientInfo, InterviewAnswer, AIAnalysisResult, ScreenType } from '@/lib/types';

// 画面コンポーネントのインポート
import PatientInfoScreen from '@/components/screens/PatientInfoScreen';
import InterviewScreen from '@/components/screens/InterviewScreen';
import ConfirmationScreen from '@/components/screens/ConfirmationScreen';
import CompletionScreen from '@/components/screens/CompletionScreen';
import DoctorScreen from '@/components/screens/DoctorScreen';

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
            answers={interviewAnswers}
            aiAnalysis={aiAnalysis}
            onComplete={handleConfirmationComplete}
            onEdit={handleEditAnswers}
            onReset={handleReset}
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
          <DoctorScreen
            patientInfo={patientInfo!}
            answers={interviewAnswers}
            aiAnalysis={aiAnalysis}
            onBack={() => setCurrentScreen('completion')}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        );

      default:
        return (
          <PatientInfoScreen
            onComplete={handlePatientInfoComplete}
            isProcessing={isProcessing}
          />
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
