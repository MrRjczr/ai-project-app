export type TargetLanguage = 'de' | 'en' | 'es';
export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type Theme = 'light' | 'dark' | 'system';

export interface WordEntry {
  id: string;
  german: string; 
  russian: string;
  emoji: string; // Визуальная ассоциация
  article?: string;
  plural?: string;
  exampleGerman: string;
  exampleRussian: string;
  pronunciation: string;
  category: string;
  language: TargetLanguage;
  dateLearned?: string; 
  timesReviewed?: number; 
}

export interface UserSettings {
  targetLanguage: TargetLanguage;
  level: LanguageLevel;
  theme: Theme;
}

export interface UserProgress {
  history: WordEntry[];
  streak: number;
  score: number; 
  lastLearnedDate: string | null;
  settings: UserSettings;
}