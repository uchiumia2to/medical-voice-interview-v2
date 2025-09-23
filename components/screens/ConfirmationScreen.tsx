import React, { useState, useEffect } from 'react';
import { PatientInfo, InterviewAnswer, AIAnalysisResult } from '@/lib/types';
import { medicalDisclaimers, urgencyLevels } from '@/lib/constants';
import { useAISummary } from '@/components/hooks/useAISummary';
import { calculateAge, formatAISummary } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent, CardSection } from '@/components/ui/Card';

interface ConfirmationScreenProps {
  patientInfo: PatientInfo;
  interviewAnswers: InterviewAnswer[];
  onComplete: (analysis: AIAnalysisResult) => void;
  onEditAnswers: () => void;
  onBack: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  patientInfo,
  interviewAnswers,
  onComplete,
  onEditAnswers,
  onBack,
  isProcessing,
  setIsProcessing
}) => {
  const [analysisGenerated, setAnalysisGenerated] = useState(false);

  const {
    isGenerating,
    aiAnalysis,
    generateSummary,
    resetAnalysis,
    error: aiError
  } = useAISummary({
    onSuccess: (result) => {
      setAnalysisGenerated(true);
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('AI分析エラー:', error);
      setIsProcessing(false);
    }
  });

  // コンポーネント初期化時にAI分析を開始
  useEffect(() => {
    if (!analysisGenerated && !isGenerating && interviewAnswers.length > 0) {
      setIsProcessing(true);
      generateSummary(patientInfo, interviewAnswers);
    }
  }, [patientInfo, interviewAnswers, generateSummary, analysisGenerated, isGenerating, setIsProcessing]);

  // 緊急度表示の取得
  const getUrgencyDisplay = (level: 'emergency' | 'urgent' | 'normal') => {
    const urgency = urgencyLevels[level];
    return (
      <div className={`p-4 rounded-lg border-l-4 ${
        level === 'emergency' ? 'bg-red-50 border-red-500' :
        level === 'urgent' ? 'bg-orange-50 border-orange-500' :
        'bg-green-50 border-green-500'
      }`}>
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{urgency.icon}</span>
          <span className={`font-bold ${
            level === 'emergency' ? 'text-red-800' :
            level === 'urgent' ? 'text-orange-800' :
            'text-green-800'
          }`}>
            {urgency.label}
          </span>
        </div>
      </div>
    );
  };

  const patientAge = calculateAge(patientInfo.birthYear, patientInfo.birthMonth, patientInfo.birthDay);

  return (
    <div className="max-w-4xl mx-auto">
      <Card padding="none">
        {/* ヘッダー */}
        <CardHeader backgroundColor="green" icon="✅">
          問診内容の確認
        </CardHeader>

        <CardContent>
          {/* AI分析生成中の表示 */}
          {(isGenerating || isProcessing) && (
            <div className="mb-6 p-6 bg-blue-50 rounded-lg text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-medium text-blue-800">AI分析中...</span>
              </div>
              <p className="text-blue-600">
                症状の分析と要約を生成しています。しばらくお待ちください。
              </p>
            </div>
          )}

          {/* 患者基本情報 */}
          <CardSection
            title="患者基本情報"
            icon="👤"
            backgroundColor="blue"
            borderLeft={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">お名前:</span>
                <span className="ml-2">{patientInfo.lastName} {patientInfo.firstName} 様</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">年齢・性別:</span>
                <span className="ml-2">{patientAge}歳・{patientInfo.gender}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">診療科:</span>
                <span className="ml-2">{patientInfo.department}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">診療区分:</span>
                <span className="ml-2">{patientInfo.visitType}</span>
              </div>
            </div>
          </CardSection>

          {/* AI症状要約 */}
          {aiAnalysis && (
            <CardSection
              title="AI症状要約"
              icon="🤖"
              backgroundColor="purple"
              borderLeft={true}
            >
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="whitespace-pre-wrap text-gray-800">
                  {formatAISummary(aiAnalysis.summary)}
                </div>
              </div>
              
              {/* AI診断支援（もしあれば） */}
              {aiAnalysis.diagnosis && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">💡 AI診断支援</h4>
                  <p className="text-indigo-700">{aiAnalysis.diagnosis}</p>
                </div>
              )}
            </CardSection>
          )}

          {/* 緊急度判定 */}
          {aiAnalysis?.urgencyAssessment && (
            <CardSection
              title="緊急度判定"
              icon="⚡"
              backgroundColor="orange"
              borderLeft={true}
            >
              {getUrgencyDisplay(aiAnalysis.urgencyAssessment.level)}
              
              <div className="mt-4 space-y-3">
                <div>
                  <span className="font-medium text-gray-700">判定理由:</span>
                  <p className="text-gray-800 mt-1">{aiAnalysis.urgencyAssessment.reason}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">推奨対応:</span>
                  <p className="text-gray-800 mt-1">{aiAnalysis.urgencyAssessment.action}</p>
                </div>
                
                {aiAnalysis.urgencyAssessment.recommendedDepartments.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">推奨診療科:</span>
                    <div className="mt-2 space-y-1">
                      {aiAnalysis.urgencyAssessment.recommendedDepartments.map((dept, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="font-medium text-blue-600">{dept.name}</span>
                          <span className="text-gray-600">- {dept.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardSection>
          )}

          {/* 患者回答内容 */}
          <CardSection
            title="あなたの回答内容"
            icon="📝"
            backgroundColor="green"
            borderLeft={true}
            collapsible={true}
            defaultExpanded={true}
          >
            <div className="space-y-4">
              {interviewAnswers.map((answer, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-800 mb-2">
                    質問{index + 1}: {answer.question}
                  </div>
                  <div className="text-gray-800 mb-2 break-words">
                    {answer.answer}
                  </div>
                  <div className="text-xs text-green-600">
                    回答時刻: {answer.timestamp}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-green-200">
              <Button
                variant="info"
                onClick={onEditAnswers}
                disabled={isProcessing || isGenerating}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                回答を修正する
              </Button>
            </div>
          </CardSection>

          {/* 医療安全免責事項 */}
          <CardSection
            title="重要な注意事項"
            icon="⚠️"
            backgroundColor="red"
            borderLeft={true}
          >
            <div className="space-y-3 text-gray-800">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="font-medium text-red-800 mb-2">🏥 {medicalDisclaimers.main}</p>
                <p className="text-red-700">{medicalDisclaimers.doctorDecision}</p>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-medium text-yellow-800 mb-2">🚨 {medicalDisclaimers.emergencyCall}</p>
                <p className="text-yellow-700">{medicalDisclaimers.emergencyAction}</p>
              </div>
              
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <p className="text-gray-700">{medicalDisclaimers.aiLimitation}</p>
              </div>
            </div>
          </CardSection>

          {/* エラー表示 */}
          {aiError && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{aiError}</p>
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={onBack}
              disabled={isProcessing || isGenerating}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              問診に戻る
            </Button>

            <Button
              variant="success"
              onClick={() => aiAnalysis && onComplete(aiAnalysis)}
              disabled={!aiAnalysis || isProcessing || isGenerating}
              isLoading={isProcessing || isGenerating}
              className="flex-1"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              {isProcessing || isGenerating ? 'AI分析中...' : '問診を完了する'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationScreen;
