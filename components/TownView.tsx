
import React from 'react';

interface TownViewProps {
  score: number;
}

export const TownView: React.FC<TownViewProps> = ({ score }) => {
  // Define what appears at which score
  const milestones = [
    { level: 1, icon: '🌱', label: 'Трава' },
    { level: 3, icon: '🌳', label: 'Дерево' },
    { level: 5, icon: '🏠', label: 'Первый дом' },
    { level: 8, icon: '🚶', label: 'Житель' },
    { level: 12, icon: '🌻', label: 'Цветы' },
    { level: 15, icon: '🏡', label: 'Второй дом' },
    { level: 20, icon: '🐕', label: 'Пёсик' },
    { level: 25, icon: '🏪', label: 'Лавка' },
    { level: 30, icon: '⛲', label: 'Фонтан' },
    { level: 40, icon: '🏫', label: 'Школа' },
    { level: 50, icon: '🏰', label: 'Ратуша' },
    { level: 60, icon: '💃', label: 'Танцовщица' },
  ];

  const currentLevel = milestones.filter(m => score >= m.level).length;
  const nextMilestone = milestones.find(m => score < m.level);
  const progressToNext = nextMilestone 
    ? ((score - (milestones[currentLevel - 1]?.level || 0)) / (nextMilestone.level - (milestones[currentLevel - 1]?.level || 0))) * 100 
    : 100;

  // Generate a fixed but "random" looking layout based on level
  const renderObjects = () => {
    const objects = [];
    for (let i = 0; i < currentLevel; i++) {
      const m = milestones[i];
      // Deterministic positions based on index
      const top = `${(i * 137) % 80}%`;
      const left = `${(i * 251) % 80}%`;
      objects.push(
        <div 
          key={i} 
          className="absolute text-3xl animate-bounce-slow" 
          style={{ 
            top, 
            left, 
            animationDelay: `${i * 0.2}s`,
            transition: 'all 0.5s ease-out'
          }}
          title={m.label}
        >
          {m.icon}
        </div>
      );
    }
    return objects;
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Town Status Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Deutsch Dorf</h2>
            <p className="text-slate-400 text-sm">Ваш прогресс: {score} слов</p>
          </div>
          <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
             <span className="text-2xl font-bold">Lvl {currentLevel}</span>
          </div>
        </div>
        
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>До: {nextMilestone.label} {nextMilestone.icon}</span>
              <span>{score} / {nextMilestone.level}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${progressToNext}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Town Canvas */}
      <div className="flex-1 bg-emerald-50 rounded-[40px] border-4 border-white shadow-inner relative overflow-hidden min-h-[350px]">
        {/* Decorative Grid Patterns */}
        {/* FIX: Changed 'size' to 'backgroundSize' to resolve TypeScript property error */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Rendered Emojis */}
        {renderObjects()}
        
        {currentLevel === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 opacity-40">
            <span className="text-5xl mb-4">🏗️</span>
            <p className="text-emerald-800 font-medium">Здесь будет ваш город. Учите слова, чтобы начать строительство!</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.05); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
