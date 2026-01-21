
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-white overflow-hidden relative">
      <header className="flex-none bg-white/90 backdrop-blur-xl px-8 pt-[calc(3rem+env(safe-area-inset-top))] pb-5 border-b border-slate-50 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{title}</h1>
        <div className="w-10 h-10 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center text-[10px] font-black text-white">
          DE
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-40 no-scrollbar scrolling-touch">
        {children}
      </main>
    </div>
  );
};
