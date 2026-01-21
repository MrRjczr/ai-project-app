
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { WordCard } from './components/WordCard';
import { HistoryView } from './components/HistoryView';
import { TownView } from './components/TownView';
import { SettingsView } from './components/SettingsView';
import { fetchDailyWords, speakWord } from './services/geminiService';
import { UserProgress, DailyState, WordEntry, TargetLanguage, LanguageLevel } from './types';

const STORAGE_KEY = 'deutsch_daily_progress_v7';

const App: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'town' | 'history' | 'settings'>('daily');

  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  // Update App Badge (The little number on the icon)
  const updateBadge = (count: number) => {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        (navigator as any).setAppBadge(count).catch(() => {});
      } else {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const today = new Date().toISOString().split('T')[0];
      
      if (saved) {
        const parsed: UserProgress = JSON.parse(saved);
        if (!parsed.settings) {
          parsed.settings = { targetLanguage: 'de', level: 'A1' };
        }
        if (parsed.dailyState?.date !== today) {
          setProgress({ ...parsed, dailyState: null });
          updateBadge(3); // 3 words to learn today
        } else {
          setProgress(parsed);
          updateBadge(3 - (parsed.dailyState?.revealedCount || 0));
        }
      } else {
        const initial = {
          history: [],
          dailyState: null,
          streak: 0,
          lastActiveDate: null,
          totalWordsLearned: 0,
          settings: { targetLanguage: 'de', level: 'A1' }
        };
        setProgress(initial);
        updateBadge(3);
      }
    } catch (e) {
      setError("Error loading data.");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  }, []);

  useEffect(() => {
    if (progress) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      const remaining = 3 - (progress.dailyState?.revealedCount || 0);
      updateBadge(remaining);
    }
  }, [progress]);

  const handleReveal = useCallback(async () => {
    if (!progress) return;
    vibrate(20);
    setError(null);
    const today = new Date().toISOString().split('T')[0];
    
    if (!progress.dailyState) {
      setIsLoading(true);
      try {
        const words = await fetchDailyWords(progress.settings.targetLanguage, progress.settings.level);
        if (!words || words.length === 0) throw new Error();
        
        const taggedWords = words.map(w => ({ ...w, dateLearned: today }));
        const newState: DailyState = { date: today, words: taggedWords, revealedCount: 1 };
        
        let newStreak = progress.streak || 0;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (progress.lastActiveDate === yesterdayStr) {
          newStreak += 1;
        } else if (progress.lastActiveDate !== today) {
          newStreak = 1;
        }

        setProgress(prev => prev ? ({
          ...prev,
          dailyState: newState,
          history: [...prev.history, taggedWords[0]],
          streak: newStreak,
          lastActiveDate: today,
          totalWordsLearned: (prev.totalWordsLearned || 0) + 1
        }) : null);
        
        speakWord(taggedWords[0].german, progress.settings.targetLanguage);
        vibrate([30, 50, 30]);
      } catch (err) {
        setError("Ошибка сети при получении новых слов");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (progress.dailyState.revealedCount < 3) {
        const nextIndex = progress.dailyState.revealedCount;
        const taggedWord = { ...progress.dailyState.words[nextIndex], dateLearned: today };
        
        setProgress(prev => prev ? ({
          ...prev,
          history: [...prev.history, taggedWord],
          totalWordsLearned: (prev.totalWordsLearned || 0) + 1,
          dailyState: {
            ...prev.dailyState!,
            revealedCount: prev.dailyState!.revealedCount + 1
          }
        }) : null);
        
        speakWord(taggedWord.german, progress.settings.targetLanguage);
        vibrate(15);
      }
    }
  }, [progress]);

  const switchTab = (tab: any) => {
    vibrate(5);
    setActiveTab(tab);
  };

  if (isLoading && !progress?.dailyState) {
    return (
      <div className="h-full w-full bg-white flex flex-col items-center justify-center p-12 text-center animate-pulse">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-200 flex items-center justify-center text-3xl mb-6">🌎</div>
        <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Daily Polyglot</h2>
        <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.3em] font-bold">Загрузка...</p>
      </div>
    );
  }

  const getAppTitle = () => {
    if (!progress) return 'Уроки';
    const names = { de: 'Deutsch', en: 'English', es: 'Español' };
    return activeTab === 'daily' ? names[progress.settings.targetLanguage] : activeTab === 'town' ? 'Город' : activeTab === 'history' ? 'Архив' : 'Опции';
  };

  return (
    <Layout title={getAppTitle()}>
      {activeTab === 'daily' && (
        <div className="space-y-6 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end px-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-xl">🔥</div>
               <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase leading-none">Ударный режим</div>
                  <div className="text-xl font-black text-slate-900">{progress?.streak || 0} дн.</div>
               </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase leading-none">Уровень: {progress?.settings.level}</div>
              <div className="text-2xl font-black text-blue-600">{progress?.dailyState?.revealedCount || 0}<span className="text-slate-200">/3</span></div>
            </div>
          </div>

          <div className="grid gap-5">
            {Array.from({ length: 3 }).map((_, idx) => {
              const isRevealed = idx < (progress?.dailyState?.revealedCount || 0);
              const isNext = idx === (progress?.dailyState?.revealedCount || 0);
              const word = progress?.dailyState?.words[idx];
              if (isRevealed && word) return <WordCard key={idx} word={word} isLocked={false} />;
              if (isNext) return <WordCard key={idx} word={null as any} isLocked={true} onReveal={handleReveal} />;
              return (
                <div key={idx} className="w-full h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center opacity-20 border-2 border-dashed border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">След.</span>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-[2rem] text-center text-[11px] font-black uppercase border border-rose-100">
              {error}
            </div>
          )}
        </div>
      )}
      {activeTab === 'town' && <TownView score={progress?.totalWordsLearned || 0} />}
      {activeTab === 'history' && <HistoryView history={progress?.history || []} streak={progress?.streak || 0} />}
      {activeTab === 'settings' && <SettingsView progress={progress} onUpdate={setProgress} storageKey={STORAGE_KEY} />}
      
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-3xl border-t border-slate-100 px-6 py-4 safe-area-bottom flex justify-between items-center z-40 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)]">
        <button onClick={() => switchTab('daily')} className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeTab === 'daily' ? 'text-blue-600' : 'text-slate-300'}`}>
          <div className={`p-2 rounded-2xl transition-all ${activeTab === 'daily' ? 'bg-blue-50' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'daily' ? 2.5 : 2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Уроки</span>
        </button>
        <button onClick={() => switchTab('town')} className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeTab === 'town' ? 'text-emerald-600' : 'text-slate-300'}`}>
          <div className={`p-2 rounded-2xl transition-all ${activeTab === 'town' ? 'bg-emerald-50' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'town' ? 2.5 : 2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Город</span>
        </button>
        <button onClick={() => switchTab('history')} className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-300'}`}>
          <div className={`p-2 rounded-2xl transition-all ${activeTab === 'history' ? 'bg-blue-50' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'history' ? 2.5 : 2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg>
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Словарь</span>
        </button>
        <button onClick={() => switchTab('settings')} className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeTab === 'settings' ? 'text-slate-900' : 'text-slate-300'}`}>
          <div className={`p-2 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-slate-100' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'settings' ? 2.5 : 2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Опции</span>
        </button>
      </nav>
    </Layout>
  );
};

export default App;
