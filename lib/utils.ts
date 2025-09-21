// lib/utils.ts
import { PatientInfo, InterviewAnswer, UrgencyAssessment, FormValidationResult, ValidationError } from './types';

/**
 * AI症状要約フォーマット関数
 * 改行を適切に挿入して読みやすくする
 */
export const formatAISummary = (summary: string): string => {
  return summary
    .replace(/症状[:：]/g, '\n症状：')
    .replace(/期間[:：]/g, '\n期間：')
    .replace(/程度[:：]/g, '\n程度：')
    .replace(/関連情報[:：]/g, '\n関連情報：')
    .replace(/推奨検査[:：]/g, '\n推奨検査：')
    .replace(/対応[:：]/g, '\n対応：')
    .replace(/\n+/g, '\n')
    .trim();
};

/**
 * 年齢計算関数
 */
export const calculateAge = (birthYear: number, birthMonth: number, birthDay: number): number => {
  const today = new Date();
  const birth = new Date(birthYear, birthMonth - 1, birthDay);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * 緊急度判定関数
 * キーワードベースで緊急度を判定
 */
export const assessUrgency = (answers: InterviewAnswer[], patientInfo: PatientInfo): UrgencyAssessment => {
  const emergencyKeywords = [
    '激痛', '意識', '呼吸', '胸痛', '動悸', '失神', '吐血', '下血', 
    '高熱', '39度', '40度', '麻痺', 'けいれん', '痙攣'
  ];
  
  const urgentKeywords = [
    '痛み', '発熱', '38度', '嘔吐', '下痢', '腫れ', '出血', 
    '息切れ', 'めまい', '頭痛', '腹痛'
  ];

  const allAnswersText = answers.map(a => a.answer).join(' ').toLowerCase();
  
  // 緊急キーワードチェック
  const hasEmergencyKeywords = emergencyKeywords.some(keyword => 
    allAnswersText.includes(keyword)
  );
  
  if (hasEmergencyKeywords) {
    return {
      level: 'emergency',
      reason: '重篤な症状の可能性があります',
      action: '直ちに救急外来を受診してください',
      recommendedDepartments: [
        { name: '救急科', reason: '緊急対応が必要' },
        { name: patientInfo.department, reason: '専門的診断が必要' }
      ]
    };
  }
  
  // 要注意キーワードチェック
  const hasUrgentKeywords = urgentKeywords.some(keyword => 
    allAnswersText.includes(keyword)
  );
  
  if (hasUrgentKeywords) {
    return {
      level: 'urgent',
      reason: '症状の経過観察が必要です',
      action: '早めに医療機関を受診してください',
      recommendedDepartments: [
        { name: patientInfo.department, reason: '専門的診断が推奨' },
        { name: '内科', reason: '一般的な診断が可能' }
      ]
    };
  }
  
  // 通常レベル
  return {
    level: 'normal',
    reason: '一般的な症状と考えられます',
    action: '適切な時期に医療機関を受診してください',
    recommendedDepartments: [
      { name: patientInfo.department, reason: '専門的相談が適切' }
    ]
  };
};

/**
 * 患者情報バリデーション関数
 */
export const validatePatientInfo = (patientInfo: Partial<PatientInfo>): FormValidationResult => {
  const errors: ValidationError[] = [];

  if (!patientInfo.visitType) {
    errors.push({ field: 'visitType', message: '診療区分を選択してください' });
  }

  if (!patientInfo.department) {
    errors.push({ field: 'department', message: '診療科を選択してください' });
  }

  if (patientInfo.department === 'その他' && !patientInfo.otherDepartment?.trim()) {
    errors.push({ field: 'otherDepartment', message: 'その他の診療科を入力してください' });
  }

  if (!patientInfo.lastName?.trim()) {
    errors.push({ field: 'lastName', message: '姓を入力してください' });
  }

  if (!patientInfo.firstName?.trim()) {
    errors.push({ field: 'firstName', message: '名を入力してください' });
  }

  if (!patientInfo.gender) {
    errors.push({ field: 'gender', message: '性別を選択してください' });
  }

  if (!patientInfo.birthYear) {
    errors.push({ field: 'birthYear', message: '生年を選択してください' });
  }

  if (!patientInfo.birthMonth) {
    errors.push({ field: 'birthMonth', message: '生月を選択してください' });
  }

  if (!patientInfo.birthDay) {
    errors.push({ field: 'birthDay', message: '生日を選択してください' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * タイムスタンプ生成関数
 */
export const generateTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * ファイルサイズ検証関数
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * 音声ファイル形式検証関数
 */
export const validateAudioFormat = (file: File, supportedFormats: string[]): boolean => {
  return supportedFormats.includes(file.type);
};

/**
 * テキストの文字数制限チェック
 */
export const validateTextLength = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength;
};

/**
 * 空白文字のみかチェック
 */
export const isEmptyOrWhitespace = (text: string): boolean => {
  return !text || !text.trim();
};

/**
 * クラス名を結合するユーティリティ（修正版）
 */
export const cn = (...classes: (string | string[] | undefined | null | false)[]): string => {
  return classes
    .flat() // 配列をフラット化
    .filter(Boolean) // falsy値を除外
    .join(' '); // スペースで結合
};

/**
 * 安全な JSON パース
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

/**
 * デバウンス関数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 音声品質評価関数
 */
export const evaluateVoiceQuality = (confidence: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (confidence >= 0.9) return 'excellent';
  if (confidence >= 0.7) return 'good';
  if (confidence >= 0.5) return 'fair';
  return 'poor';
};

/**
 * エラーメッセージの標準化
 */
export const standardizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '予期しないエラーが発生しました';
};
