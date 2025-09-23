import { useState, useCallback } from 'react';
import { PatientInfo, InterviewAnswer, AIAnalysisResult, UrgencyAssessment } from '@/lib/types';
import { apiEndpoints, medicalDisclaimers } from '@/lib/constants';
import { assessUrgency, standardizeErrorMessage } from '@/lib/utils';

interface UseAISummaryOptions {
  onSuccess?: (result: AIAnalysisResult) => void;
  onError?: (error: string) => void;
}

interface UseAISummaryReturn {
  isGenerating: boolean;
  aiAnalysis: AIAnalysisResult | null;
  generateSummary: (patientInfo: PatientInfo, answers: InterviewAnswer[]) => Promise<AIAnalysisResult>;
  resetAnalysis: () => void;
  error: string | null;
}

export const useAISummary = (
  options: UseAISummaryOptions = {}
): UseAISummaryReturn => {
  const { onSuccess, onError } = options;

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // フォールバック要約生成（API失敗時）- メモ化
  const generateFallbackSummary = useCallback((answers: InterviewAnswer[]): string => {
    const mainSymptoms = answers[0]?.answer || '症状の詳細が不明';
    const painLevel = answers[1]?.answer || '痛みの程度が不明';
    const otherSymptoms = answers[2]?.answer || 'その他の症状なし';
    const medications = answers[3]?.answer || '服用薬なし';
    const allergies = answers[4]?.answer || 'アレルギーなし';

    return `【${medicalDisclaimers.aiReference}】

主な症状：
${mainSymptoms}

痛み・違和感の程度：
${painLevel}

その他の症状：
${otherSymptoms}

現在の服用薬：
${medications}

アレルギー情報：
${allergies}

※ この要約は患者様の回答内容をもとに自動生成されました。
※ ${medicalDisclaimers.main}
※ ${medicalDisclaimers.doctorDecision}`;
  }, []);

  // AI要約生成関数（メモ化で安定化）
  const generateSummary = useCallback(async (
    patientInfo: PatientInfo,
    answers: InterviewAnswer[]
  ): Promise<AIAnalysisResult> => {
    setIsGenerating(true);
    setError(null);

    try {
      // 患者回答をまとめる
      const combinedAnswers = answers.map((answer, index) => 
        `質問${index + 1}: ${answer.question}\n回答: ${answer.answer}`
      ).join('\n\n');

      // AI要約API呼び出し
      const summaryResponse = await fetch(apiEndpoints.summarize, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientInfo: {
            age: new Date().getFullYear() - patientInfo.birthYear,
            gender: patientInfo.gender,
            department: patientInfo.department,
            visitType: patientInfo.visitType
          },
          answers: combinedAnswers,
          timestamp: new Date().toISOString()
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error(`API Error: ${summaryResponse.status} ${summaryResponse.statusText}`);
      }

      const summaryData = await summaryResponse.json();
      
      // 緊急度判定（AI + ルールベース）
      const urgencyAssessment = assessUrgency(answers, patientInfo);
      
      // AIによる診断支援（オプション）
      let diagnosis = '';
      try {
        const diagnoseResponse = await fetch(apiEndpoints.diagnose, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: summaryData.summary,
            patientInfo,
            urgencyLevel: urgencyAssessment.level
          }),
        });

        if (diagnoseResponse.ok) {
          const diagnoseData = await diagnoseResponse.json();
          diagnosis = diagnoseData.diagnosis;
        }
      } catch (diagnoseError) {
        // 診断APIエラーは無視（要約は成功しているため）
        console.warn('診断API呼び出しに失敗:', diagnoseError);
      }

      const result: AIAnalysisResult = {
        summary: summaryData.summary || generateFallbackSummary(answers),
        urgencyAssessment,
        diagnosis: diagnosis || undefined
      };

      setAiAnalysis(result);
      onSuccess?.(result);
      return result;

    } catch (error) {
      const errorMessage = standardizeErrorMessage(error);
      
      // フォールバック：API失敗時も基本的な分析結果を提供
      const fallbackResult: AIAnalysisResult = {
        summary: generateFallbackSummary(answers),
        urgencyAssessment: assessUrgency(answers, patientInfo),
        diagnosis: undefined
      };

      setAiAnalysis(fallbackResult);
      setError(`${medicalDisclaimers.aiReference} API接続に問題が発生しましたが、基本的な分析を提供します。`);
      onError?.(errorMessage);
      
      return fallbackResult;
    } finally {
      setIsGenerating(false);
    }
  }, [onSuccess, onError, generateFallbackSummary]);

  // 分析結果リセット
  const resetAnalysis = useCallback(() => {
    setAiAnalysis(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    isGenerating,
    aiAnalysis,
    generateSummary,
    resetAnalysis,
    error
  };
};
