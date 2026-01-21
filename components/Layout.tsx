import React from 'react';
import { TargetLanguage } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  lang?: TargetLanguage;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, lang }) => {
  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-white dark:bg-slate-900 overflow-hidden relative transition-colors duration-300">
      <header className="flex-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-8 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{title}</h1>
        <div className="w-10 h-10 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center text-[10px] font-black text-white uppercase">
          {lang || '??'}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-40 no-scrollbar scrolling-touch">
        {children}
      </main>
    </div>
  );
};