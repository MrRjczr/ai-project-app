
export type TargetLanguage = 'de' | 'en' | 'es';
export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface WordEntry {
  id: string;
  german: string; // This will hold the target word regardless of language for backward compatibility in state
  russian: string;
  article?: string;
  plural?: string;
  exampleGerman: string; // Target language example
  exampleRussian: string;
  pronunciation: string;
  category: string;
  dateLearned?: string; 
  language?: TargetLanguage;
}

export interface DailyState {
  date: string;
  words: WordEntry[];
  revealedCount: number;
}

export interface UserProgress {
  history: WordEntry[];
  dailyState: DailyState | null;
  streak: number;
  lastActiveDate: string | null;
  totalWordsLearned: number;
  settings: {
    targetLanguage: TargetLanguage;
    level: LanguageLevel;
  };
}
