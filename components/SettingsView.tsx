import React from 'react';
import { UserProgress, TargetLanguage, LanguageLevel, Theme } from '../types';

interface SettingsViewProps {
  progress: UserProgress | null;
  onUpdate: (p: UserProgress | null) => void;
  storageKey: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ progress, onUpdate, storageKey }) => {
  if (!progress) return null;

  const setLanguage = (lang: TargetLanguage) => {
    onUpdate({ ...progress, settings: { ...progress.settings, targetLanguage: lang } });
  };

  const setLevel = (level: LanguageLevel) => {
    onUpdate({ ...progress, settings: { ...progress.settings, level } });
  };

  const setTheme = (theme: Theme) => {
    onUpdate({ ...progress, settings: { ...progress.settings, theme } });
  };

  const handleReset = () => {
    if (confirm('Удалить весь прогресс?')) {
      localStorage.removeItem(storageKey);
      window.location.reload();
    }
  };

  const languages = [
    { id: 'en' as TargetLanguage, name: 'American', flag: '🇺🇸' },
    { id: 'de' as TargetLanguage, name: 'German', flag: '🇩🇪' },
    { id: 'es' as TargetLanguage, name: 'Spanish', flag: '🇪🇸' },
  ];

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'] as LanguageLevel[];
  const themes = [
    { id: 'light', icon: '☀️', name: 'Светлая' },
    { id: 'dark', icon: '🌙', name: 'Темная' },
    { id: 'system', icon: '🖥️', name: 'Системная' },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">Профиль обучения</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Целевой язык</label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    progress.settings.targetLanguage === lang.id 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                    : 'border-slate-50 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-[9px] font-black uppercase">{lang.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Уровень</label>
            <div className="flex flex-wrap gap-2">
              {levels.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    progress.settings.level === lvl 
                    ? 'bg-slate-900 dark:bg-blue-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Внешний вид</h3>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                progress.settings.theme === t.id 
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                : 'border-slate-50 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-400'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[9px] font-black uppercase">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleReset} className="w-full p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl text-rose-700 dark:text-rose-400 font-bold">Сбросить прогресс</button>
    </div>
  );
};