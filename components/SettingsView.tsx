
import React from 'react';
import { UserProgress, TargetLanguage, LanguageLevel } from '../types';

interface SettingsViewProps {
  progress: UserProgress | null;
  onUpdate: (p: UserProgress | null) => void;
  storageKey: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ progress, onUpdate, storageKey }) => {
  const handleReset = () => {
    if (confirm('Вы уверены? Весь прогресс и история будут удалены безвозвратно.')) {
      localStorage.removeItem(storageKey);
      window.location.reload();
    }
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Ваш браузер не поддерживает уведомления.');
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('Deutsch Daily', {
        body: 'Напоминания включены! Мы будем присылать вам новые слова.',
        icon: 'https://cdn-icons-png.flaticon.com/512/197/197571.png'
      });
    }
  };

  const handleExport = () => {
    if (!progress) return;
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polyglot-daily-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setLanguage = (lang: TargetLanguage) => {
    if (!progress) return;
    onUpdate({
      ...progress,
      settings: { ...progress.settings, targetLanguage: lang }
    });
  };

  const setLevel = (level: LanguageLevel) => {
    if (!progress) return;
    onUpdate({
      ...progress,
      settings: { ...progress.settings, level }
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.history && Array.isArray(imported.history)) {
          onUpdate(imported);
          alert('Прогресс успешно импортирован!');
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        alert('Ошибка при импорте. Файл поврежден или имеет неверный формат.');
      }
    };
    reader.readAsText(file);
  };

  const languages = [
    { id: 'de' as TargetLanguage, name: 'Немецкий', flag: '🇩🇪' },
    { id: 'en' as TargetLanguage, name: 'Английский', flag: '🇬🇧' },
    { id: 'es' as TargetLanguage, name: 'Испанский', flag: '🇪🇸' },
  ];

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'] as LanguageLevel[];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Learning Profile */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg>
          Профиль обучения
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Целевой язык</label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    progress?.settings.targetLanguage === lang.id 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-50 bg-slate-50 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-[9px] font-black uppercase">{lang.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Сложность слов</label>
            <div className="flex flex-wrap gap-2">
              {levels.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    progress?.settings.level === lvl 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Push Notifications Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200">
         <h3 className="text-lg font-black mb-2 flex items-center gap-2">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
           Уведомления
         </h3>
         <p className="text-blue-100 text-xs mb-6 font-medium leading-relaxed">
           Включите пуши, чтобы получать слова на экран блокировки каждый день.
         </p>
         <button 
           onClick={requestNotifications}
           className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-50 transition-colors active:scale-95"
         >
           Включить напоминания
         </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
           <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
           Управление данными
        </h3>
        
        <div className="space-y-3">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               </div>
               <span className="font-bold text-slate-700">Экспорт</span>
            </div>
          </button>

          <label className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
               </div>
               <span className="font-bold text-slate-700">Импорт</span>
            </div>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-between p-4 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </div>
               <span className="font-bold text-rose-700">Сброс</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-8 text-center opacity-40">
         <h4 className="font-black text-slate-900 mb-1 tracking-tighter uppercase">Daily Polyglot</h4>
         <p className="text-[10px] font-black uppercase tracking-[0.3em]">AI Learning Companion</p>
      </div>
    </div>
  );
};
