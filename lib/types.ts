// この内容をコピペしてください
// lib/types.ts
export interface PatientInfo {
  visitType: string;
  department: string;
  otherDepartment?: string;
  lastName: string;
  firstName: string;
  gender: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
}

export interface InterviewAnswer {
  question: string;
  answer: string;
  timestamp: string;
}

export interface UrgencyAssessment {
  level: 'emergency' | 'urgent' | 'normal';
  reason: string;
  action: string;
  recommendedDepartments: Array<{
    name: string;
    reason: string;
  }>;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  confidence: number | null;
  warnings: string[];
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface Department {
  name: string;
  icon: string;
}

export interface AIAnalysisResult {
  summary: string;
  urgencyAssessment: UrgencyAssessment;
  diagnosis?: string;
}

export type ScreenType = 
  | 'patientInfo' 
  | 'interview' 
  | 'confirmation' 
  | 'completion' 
  | 'doctor';

export interface AppState {
  currentScreen: ScreenType;
  patientInfo: PatientInfo | null;
  interviewAnswers: InterviewAnswer[];
  aiAnalysis: AIAnalysisResult | null;
  isProcessing: boolean;
}

// API レスポンス型
export interface SummarizeResponse {
  summary: string;
}

export interface DiagnoseResponse {
  diagnosis: string;
}

export interface TranscribeResponse {
  transcript: string;
}

// フォームバリデーション型
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
