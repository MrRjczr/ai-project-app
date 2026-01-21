import React from 'react';
import { WordEntry } from '../types';

interface HistoryViewProps {
  history: WordEntry[];
  streak: number;
  score: number;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, streak, score }) => {
  const grouped = history.reduce((acc, word) => {
    const date = word.dateLearned || 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(word);
    return acc;
  }, {} as Record<string, WordEntry[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateStr: string) => {
    if (dateStr === 'Unknown') return 'Ранее';
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Сегодня';
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-blue-600 mb-0.5">{history.length}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Слов</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-emerald-500 mb-0.5">{score}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">XP Опыт</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-amber-500 mb-0.5">{streak}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Дни</span>
        </div>
      </div>

      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
             <p className="font-medium">Ваш словарь пока пуст</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 sticky top-16 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm py-2 px-1 z-10 flex items-center gap-2 uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {formatDate(date)}
              </h3>
              <div className="grid gap-3">
                {grouped[date].map((item, idx) => (
                  <div key={`${date}-${idx}`} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm group">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{item.emoji}</div>
                      <div>
                        <div className="flex gap-2 items-center font-black text-slate-900 dark:text-slate-200">
                          {item.article && (
                            <span className="text-[9px] font-black text-blue-500 uppercase">{item.article}</span>
                          )}
                          {item.german}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-500 mt-0.5 font-medium">{item.russian}</div>
                      </div>
                    </div>
                    {item.timesReviewed && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg flex items-center gap-1">
                         <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-black">x{item.timesReviewed}</span>
                         <span className="text-[8px] text-emerald-500/50">⚡</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};