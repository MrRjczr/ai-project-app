import React, { useState } from 'react';
import { WordEntry } from '../types';
import { speakWord } from '../services/geminiService';

interface WordCardProps {
  word: WordEntry;
  isLocked: boolean;
  onReveal?: () => void;
  isReviewMode?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({ word, isLocked, onReveal, isReviewMode }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) return;
    setIsSpeaking(true);
    await speakWord(word.german, word.language);
    setIsSpeaking(false);
  };

  const articleColors: Record<string, string> = {
    'der': 'text-blue-600',
    'die': 'text-rose-500',
    'das': 'text-emerald-600',
    'el': 'text-blue-600',
    'la': 'text-rose-500',
  };

  if (isLocked) {
    return (
      <button 
        onClick={onReveal}
        className="w-full py-12 bg-white dark:bg-slate-800/50 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-700 group active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-slate-900 dark:text-slate-400 font-black uppercase tracking-widest text-[10px]">Открыть слово</p>
      </button>
    );
  }

  return (
    <div className={`w-full bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl border flex flex-col animate-in fade-in zoom-in duration-500 relative group transition-all ${isReviewMode ? 'ring-4 ring-blue-500/20 border-blue-100 dark:border-blue-900/50' : 'shadow-slate-200/50 dark:shadow-none border-slate-50 dark:border-slate-700'}`}>
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-[0.2em]">{word.category}</span>
           {isReviewMode && <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Review x2 XP</span>}
        </div>
        <button 
          onClick={handleSpeak}
          disabled={isSpeaking}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSpeaking ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-slate-50 dark:bg-slate-700 text-slate-300 dark:text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col text-left">
        <div className="flex items-center gap-4 mb-1">
          <div className="text-4xl">{word.emoji}</div>
          <div className="text-3xl flex items-center gap-3 font-[900] tracking-tight text-slate-900 dark:text-white">
            {word.article && <span className={`${articleColors[word.article.toLowerCase()] || 'text-slate-400'} opacity-80 italic text-sm`}>{word.article}</span>}
            <span>{word.german}</span>
          </div>
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-sm mb-6 font-medium italic pl-14">[{word.pronunciation}]</div>
        
        <div className="text-4xl font-black text-slate-800 dark:text-slate-200 mb-8 leading-tight">
          {word.russian}
        </div>
        
        <div className="mt-auto space-y-3">
            <div className="w-10 h-1 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-tight group-hover:text-blue-600 transition-colors">{word.exampleGerman}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{word.exampleRussian}</p>
        </div>
      </div>
    </div>
  );
};