
import React from 'react';
import { WordEntry } from '../types';

interface HistoryViewProps {
  history: WordEntry[];
  streak: number;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, streak }) => {
  // Group history by date
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
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Summary Card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-blue-600 mb-1">{history.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Слов выучено</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-amber-500 mb-1">{streak}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Дней ударно</span>
        </div>
      </div>

      {/* Grouped History List */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
             <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
             </svg>
             <p className="font-medium">Ваш словарь пока пуст</p>
             <p className="text-sm">Откройте свое первое слово сегодня!</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 sticky top-16 bg-slate-50/80 backdrop-blur-sm py-2 px-1 z-10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {formatDate(date)}
              </h3>
              <div className="grid gap-3">
                {grouped[date].map((item, idx) => (
                  <div key={`${date}-${idx}`} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow group">
                    <div>
                      <div className="flex gap-2 items-center font-bold text-slate-900">
                         {item.article && (
                           <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                             item.article === 'der' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                             item.article === 'die' ? 'bg-red-50 border-red-100 text-red-600' :
                             'bg-green-50 border-green-100 text-green-600'
                           }`}>
                             {item.article}
                           </span>
                         )}
                         {item.german}
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">{item.russian}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                       </svg>
                    </div>
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
