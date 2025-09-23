// lib/constants.ts
import { Department } from './types';

// 診療科データ
export const departments: Department[] = [
  { name: '内科', icon: '🩺' },
  { name: '小児科', icon: '👶' },
  { name: '皮膚科', icon: '🌿' },
  { name: '精神科', icon: '🧠' },
  { name: '外科', icon: '🔪' },
  { name: '整形外科', icon: '🦴' },
  { name: '産婦人科', icon: '👶' },
  { name: '眼科', icon: '👁️' },
  { name: '耳鼻咽喉科', icon: '👂' },
  { name: '泌尿器科', icon: '🫘' },
  { name: '脳神経外科', icon: '🧠' },
  { name: '形成外科', icon: '✂️' },
  { name: 'リハビリテーション科', icon: '🏃' },
  { name: '歯科', icon: '🦷' },
  { name: '美容皮膚科', icon: '✨' },
  { name: '美容歯科', icon: '😊' },
  { name: 'その他', icon: '❓' }
];

// 質問セット
export const questions: string[] = [
  'どのような症状でお困りですか？いつ頃からの症状かも教えてください。',
  '痛みや違和感の程度はいかがですか？',
  '他に気になる症状はありますか？',
  '現在服用されているお薬はありますか？',
  'アレルギーをお持ちですか？'
];

// 診療区分
export const visitTypes: string[] = [
  '初診',
  '再診',
  '診療券再発行'
];

// 性別選択肢
export const genderOptions: string[] = [
  '男性',
  '女性'
];

// 年選択肢（現在年から100年前まで）
export const generateYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= currentYear - 100; year--) {
    years.push(year);
  }
  return years;
};

// 月選択肢
export const monthOptions: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

// 日選択肢
export const getDayOptions = (year: number, month: number): number[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

// カラーパレット定数
export const colors = {
  primary: {
    blue: 'bg-blue-600',
    blueHover: 'hover:bg-blue-700',
    blueLight: 'bg-blue-50'
  },
  functional: {
    success: 'bg-green-600',
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
    info: 'bg-orange-50',
    ai: 'bg-purple-50'
  },
  neutral: {
    background: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-300'
  }
};

// 緊急度レベル定義
export const urgencyLevels = {
  emergency: {
    level: 'emergency' as const,
    color: 'bg-red-50',
    icon: '🚨',
    label: '緊急'
  },
  urgent: {
    level: 'urgent' as const,
    color: 'bg-orange-50',
    icon: '⚠️',
    label: '要注意'
  },
  normal: {
    level: 'normal' as const,
    color: 'bg-green-50',
    icon: '✅',
    label: '通常'
  }
};

// 医療安全免責事項
export const medicalDisclaimers = {
  aiReference: '※参考情報',
  main: 'このAI分析は参考情報であり、医療診断ではありません',
  doctorDecision: '最終的な診断・治療方針は医師が決定します',
  emergencyAction: '症状が悪化した場合は速やかに医療機関を受診してください',
  emergencyCall: '緊急時は119番通報または救急外来を受診してください',
  aiLimitation: 'AI分析の精度には限界があり、医師の判断と異なる場合があります'
};

// API エンドポイント
export const apiEndpoints = {
  summarize: '/api/summarize',
  diagnose: '/api/diagnose',
  transcribe: '/api/transcribe'
};

// 音声設定（型エラー修正版）
export const voiceSettings = {
  maxFileSize: 25 * 1024 * 1024, // 25MB
  supportedFormats: ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm'] as string[], // 型修正
  speechRecognition: {
    language: 'ja-JP',
    continuous: true,
    interimResults: true
  }
};

// 画面別最大幅設定
export const screenMaxWidths = {
  patientInfo: 'max-w-md',
  interview: 'max-w-4xl',
  confirmation: 'max-w-4xl',
  completion: 'max-w-md',
  doctor: 'max-w-6xl'
};
