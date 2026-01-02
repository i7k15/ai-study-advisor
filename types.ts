
export enum StudyMode {
  ADVISOR = 'ADVISOR',
  GENERAL = 'GENERAL',
  TEACHING = 'TEACHING',
  QA = 'QA',
  SUMMARY = 'SUMMARY',
  GUIDE = 'GUIDE',
  SMART = 'SMART',
  FAST = 'FAST',
  GENERAL_DEFAULT = 'GENERAL_DEFAULT',
  UX_IMPROVED = 'UX_IMPROVED',
  UNIVERSITY = 'UNIVERSITY',
  NOTEBOOK_LM = 'NOTEBOOK_LM'
}

export type OnboardingStep = 'language' | 'login' | 'profiling' | 'app' | 'settings';

export type DetailLevel = 'short' | 'medium' | 'detailed';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface UserProfile {
  language: 'ar' | 'en';
  theme: ThemeMode;
  studyLevel?: string;
  major?: string;
  defaultStyle: StudyMode;
  detailLevel: DetailLevel;
  allowGeneralChat: boolean;
  strictSourcesOnly: boolean;
  saveHistory: boolean;
  name?: string;
}

export interface ModeConfig {
  id: StudyMode;
  title: string;
  description: string;
  systemPrompt: string;
}

export interface FilePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
  fileName: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  mode: StudyMode;
  files?: string[];
}
