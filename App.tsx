
import React, { useState, useEffect, useMemo } from 'react';
import { WordEntry, UserProgress, Theme } from './types';
import { fetchDailyWords } from './services/geminiService';
import { Layout } from './components/Layout';
import { WordCard } from './components/WordCard';
import { HistoryView } from './components/HistoryView';
import { TownView } from './components/TownView';
import { SettingsView } from './components/SettingsView';

const STORAGE_KEY = 'polyglot_user_progress_v3';

const INITIAL_PROGRESS: UserProgress = {
  history: [],
  streak: 0,
  score: 0,
  lastLearnedDate: null,
  settings: {
    targetLanguage: 'en',
    level: 'A1',
    theme: 'system'
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'history' | 'town' | 'settings'>('learn');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [dailyWords, setDailyWords] = useState<WordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  
  // Режим повторения (Тест)
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewData, setReviewData] = useState<{
    target: WordEntry;
    options: string[];
    selectedIndex: number | null;
    isCorrect: boolean | null;
  } | null>(null);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.score === undefined) parsed.score = parsed.history.length * 5;
      setProgress(parsed);
    } else {
      setProgress(INITIAL_PROGRESS);
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (progress) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  // Handle Theme
  useEffect(() => {
    if (!progress) return;
    const theme = progress.settings.theme;
    const root = window.document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress?.settings.theme]);

  // Fetch words for Learn mode
  useEffect(() => {
    if (!progress || isReviewMode) return;
    const today = new Date().toISOString().split('T')[0];
    const todayWords = progress.history.filter(w => w.dateLearned === today && !w.timesReviewed);
    
    if (todayWords.length >= 3) {
      setDailyWords(todayWords.slice(0, 3));
      setRevealedCount(3);
    } else if (activeTab === 'learn' && dailyWords.length === 0 && !isLoading) {
      handleFetchNewWords();
    }
  }, [progress?.settings.targetLanguage, progress?.settings.level, activeTab, isReviewMode]);

  const handleFetchNewWords = async () => {
    if (!progress) return;
    setIsLoading(true);
    try {
      const words = await fetchDailyWords(progress.settings.targetLanguage, progress.settings.level);
      setDailyWords(words);
      setRevealedCount(0);
    } catch (error) {
      console.error("Failed to load daily words", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealWord = (index: number) => {
    if (!progress || revealedCount !== index) return;
    const today = new Date().toISOString().split('T')[0];
    const newWord = { ...dailyWords[index], dateLearned: today };
    const newHistory = [...progress.history, newWord];
    
    let newStreak = progress.streak;
    if (progress.lastLearnedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (progress.lastLearnedDate === yesterdayStr || progress.lastLearnedDate === null) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    setProgress({
      ...progress,
      history: newHistory,
      lastLearnedDate: today,
      score: progress.score + 5,
      streak: index === 2 ? newStreak : progress.streak
    });
    setRevealedCount(prev => prev + 1);
  };

  const startReview = () => {
    if (!progress || progress.history.length === 0) return;
    
    // Выбираем целевое слово
    const today = new Date().toISOString().split('T')[0];
    const potential = progress.history.filter(w => w.dateLearned !== today);
    const pool = potential.length > 0 ? potential : progress.history;
    const target = pool[Math.floor(Math.random() * pool.length)];

    // Собираем варианты ответа
    let options = [target.russian];
    const otherWords = progress.history.filter(w => w.id !== target.id);
    
    // Берем до 3 случайных неправильных ответов из истории
    const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
    shuffledOthers.slice(0, 3).forEach(w => options.push(w.russian));

    // Если вариантов мало, добавим заглушки
    while (options.length < 4) {
      options.push("...");
    }

    // Перемешиваем варианты
    options.sort(() => 0.5 - Math.random());

    setReviewData({
      target,
      options,
      selectedIndex: null,
      isCorrect: null
    });
    setIsReviewMode(true);
  };

  const handleOptionSelect = (index: number) => {
    if (!reviewData || reviewData.selectedIndex !== null) return;

    const isCorrect = reviewData.options[index] === reviewData.target.russian;
    setReviewData({ ...reviewData, selectedIndex: index, isCorrect });

    if (isCorrect && progress) {
      const newHistory = progress.history.map(w => 
        w.id === reviewData.target.id 
          ? { ...w, timesReviewed: (w.timesReviewed || 0) + 1 } 
          : w
      );
      setProgress({
        ...progress,
        history: newHistory,
        score: progress.score + 10
      });
    }
  };

  const nextReview = () => {
    startReview();
  };

  const navItems = [
    { id: 'learn', icon: '📖', label: 'Учить' },
    { id: 'history', icon: '📝', label: 'Словарь' },
    { id: 'town', icon: '🏡', label: 'Город' },
    { id: 'settings', icon: '⚙️', label: 'Настройки' },
  ] as const;

  if (!progress) return null;

  return (
    <Layout 
      title={isReviewMode ? 'Тест' : navItems.find(i => i.id === activeTab)?.label || 'Учить'} 
      lang={progress.settings.targetLanguage}
    >
      <div className="pb-32">
        {activeTab === 'learn' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {!isReviewMode ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Прогресс сегодня</p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i <= revealedCount ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-800'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Опыт</p>
                       <p className="font-black text-emerald-500">+{progress.score}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Стрик</p>
                      <p className="font-black text-blue-600">{progress.streak} дн.</p>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-100 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Генерирую...</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {dailyWords.map((word, idx) => (
                      <WordCard key={idx} word={word} isLocked={idx > revealedCount} onReveal={() => handleRevealWord(idx)} />
                    ))}
                  </div>
                )}
                
                {revealedCount === 3 && (
                  <div className="space-y-4 animate-in zoom-in duration-700">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 text-center">
                      <span className="text-5xl mb-4 block">🏆</span>
                      <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400 mb-1">Дневная цель достигнута!</h3>
                      <p className="text-emerald-700 dark:text-emerald-500 text-sm font-medium mb-6">Получено +15 очков города.</p>
                    </div>
                    
                    <button 
                      onClick={startReview}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[2rem] shadow-xl shadow-blue-200 dark:shadow-none font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <span>⚡ Супер-повторение</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">+10 XP</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="animate-in slide-in-from-bottom duration-500 space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{reviewData?.target.german}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Выберите правильный перевод</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {reviewData?.options.map((option, idx) => {
                    let btnClass = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300";
                    
                    if (reviewData.selectedIndex !== null) {
                      if (option === reviewData.target.russian) {
                        btnClass = "bg-emerald-500 border-emerald-500 text-white scale-[1.02] shadow-lg shadow-emerald-200 dark:shadow-none";
                      } else if (idx === reviewData.selectedIndex) {
                        btnClass = "bg-rose-500 border-rose-500 text-white opacity-80";
                      } else {
                        btnClass = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={reviewData.selectedIndex !== null}
                        className={`w-full p-6 rounded-3xl border-2 font-bold text-lg transition-all active:scale-95 flex items-center justify-center text-center ${btnClass}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {reviewData?.selectedIndex !== null && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <button 
                      onClick={nextReview}
                      className="w-full bg-slate-900 dark:bg-blue-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all"
                    >
                      Следующее слово
                    </button>
                    <button 
                      onClick={() => setIsReviewMode(false)}
                      className="w-full text-slate-400 font-bold uppercase tracking-widest text-xs py-2"
                    >
                      Закончить тренировку
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === 'history' && <HistoryView history={progress.history} streak={progress.streak} score={progress.score} />}
        {activeTab === 'town' && <TownView score={progress.score} />}
        {activeTab === 'settings' && <SettingsView progress={progress} onUpdate={setProgress} storageKey={STORAGE_KEY} />}
      </div>

      {!isReviewMode && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 flex justify-between items-center z-50 max-w-md mx-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'scale-110' : 'opacity-40 grayscale dark:opacity-20'}`}>
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </Layout>
  );
};

export default App;
