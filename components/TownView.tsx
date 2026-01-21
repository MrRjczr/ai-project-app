
import React, { useMemo } from 'react';

interface TownViewProps {
  score: number;
}

interface TownObject {
  gridX: number;
  gridY: number;
  icon: string;
  label: string;
  level: number;
  type: 'building' | 'nature' | 'npc' | 'event';
}

type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export const TownView: React.FC<TownViewProps> = ({ score }) => {
  const TILE_SIZE = 60;

  // Определяем текущую дату для сезона и праздников
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  const season: Season = useMemo(() => {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }, [month]);

  const holiday = useMemo(() => {
    if (month === 11 || (month === 0 && day <= 15)) return 'newyear';
    if (month === 3) return 'easter'; // Упрощенно апрель
    if (month === 9 && day >= 25) return 'halloween';
    return null;
  }, [month, day]);

  // Стили сезона
  const seasonStyles = {
    winter: { bg: 'bg-blue-50', tile: 'bg-white', shadow: 'shadow-blue-200', particle: '❄️', particleClass: 'snow' },
    spring: { bg: 'bg-emerald-50', tile: 'bg-emerald-100/50', shadow: 'shadow-emerald-200', particle: '🌸', particleClass: 'petal' },
    summer: { bg: 'bg-amber-50', tile: 'bg-emerald-200/50', shadow: 'shadow-emerald-300', particle: '🦋', particleClass: 'butterfly' },
    autumn: { bg: 'bg-orange-50', tile: 'bg-orange-100/50', shadow: 'shadow-orange-200', particle: '🍂', particleClass: 'leaf' },
  }[season];

  const baseObjects: TownObject[] = [
    { gridX: 2, gridY: 2, icon: '🏠', label: 'Твой дом', level: 0, type: 'building' },
    { gridX: 1, gridY: 2, icon: season === 'winter' ? '⛄' : '🌳', label: 'Сад', level: 5, type: 'nature' },
    { gridX: 2, gridY: 1, icon: '🌲', label: 'Лес', level: 10, type: 'nature' },
    { gridX: 3, gridY: 2, icon: '🚶', label: 'Сосед', level: 15, type: 'npc' },
    { gridX: 2, gridY: 3, icon: '🏡', label: 'Дача', level: 25, type: 'building' },
    { gridX: 0, gridY: 2, icon: season === 'autumn' ? '🍄' : '🌻', label: 'Цветы', level: 30, type: 'nature' },
    { gridX: 1, gridY: 1, icon: '🏪', label: 'Лавка', level: 40, type: 'building' },
    { gridX: 3, gridY: 3, icon: '🐕', label: 'Пёс', level: 45, type: 'npc' },
    { gridX: 4, gridY: 2, icon: '⛲', label: 'Фонтан', level: 55, type: 'nature' },
    { gridX: 1, gridY: 3, icon: '🏫', label: 'Школа', level: 70, type: 'building' },
    { gridX: 3, gridY: 1, icon: '💃', label: 'Мэр', level: 85, type: 'npc' },
    { gridX: 0, gridY: 0, icon: '🏰', label: 'Замок', level: 110, type: 'building' },
    { gridX: 4, gridY: 4, icon: '⛪', label: 'Ратуша', level: 150, type: 'building' },
  ];

  // Добавляем праздничные объекты
  const eventObjects: TownObject[] = [];
  if (holiday === 'newyear') {
    eventObjects.push({ gridX: 2, gridY: 0, icon: '🎄', label: 'Ёлка', level: 0, type: 'event' });
    eventObjects.push({ gridX: 0, gridY: 3, icon: '🎅', label: 'Санта', level: 0, type: 'event' });
  } else if (holiday === 'easter') {
    eventObjects.push({ gridX: 1, gridY: 4, icon: '🐇', label: 'Кролик', level: 0, type: 'event' });
    eventObjects.push({ gridX: 3, gridY: 0, icon: '🥚', label: 'Яйцо', level: 0, type: 'event' });
  } else if (holiday === 'halloween') {
    eventObjects.push({ gridX: 2, gridY: 0, icon: '🎃', label: 'Тыква', level: 0, type: 'event' });
    eventObjects.push({ gridX: 4, gridY: 1, icon: '👻', label: 'Буу!', level: 0, type: 'event' });
  }

  const allObjects = [...baseObjects, ...eventObjects];

  const getIsoCoords = (gx: number, gy: number) => {
    const offsetX = 50; 
    const offsetY = 25;
    const x = (gx - gy) * (TILE_SIZE / 1.5);
    const y = (gx + gy) * (TILE_SIZE / 3);
    return { left: `calc(50% + ${x}px)`, top: `calc(${offsetY}% + ${y}px)` };
  };

  return (
    <div className={`flex flex-col h-full space-y-4 animate-in fade-in duration-700`}>
      {/* Статус */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[900] text-slate-900 dark:text-white leading-none">
            {season === 'winter' ? '❄️ Зимний' : season === 'spring' ? '🌸 Весенний' : season === 'summer' ? '☀️ Летний' : '🍂 Осенний'} город
          </h2>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-2 italic">
            {holiday === 'newyear' ? 'С Новым Годом! 🎅' : holiday === 'easter' ? 'Пасхальные гуляния 🐇' : holiday === 'halloween' ? 'Страшно весело! 🎃' : 'Пора учиться!'}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{score} <span className="text-sm text-slate-400">XP</span></span>
        </div>
      </div>

      {/* Поле */}
      <div className={`flex-1 ${seasonStyles.bg} dark:bg-slate-900 rounded-[3rem] border-4 border-white dark:border-slate-800 shadow-inner relative overflow-hidden flex items-center justify-center min-h-[450px]`}>
        
        {/* Частицы сезона */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className={`absolute text-xl opacity-40 ${seasonStyles.particleClass}`}
              style={{ 
                left: `${Math.random() * 100}%`, 
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            >
              {seasonStyles.particle}
            </div>
          ))}
        </div>

        {/* Изометрия */}
        <div className="relative w-full h-full transform scale-90">
          {/* Сетка */}
          {Array.from({ length: 5 }).map((_, gx) => 
            Array.from({ length: 5 }).map((_, gy) => {
              const { left, top } = getIsoCoords(gx, gy);
              const isOccupied = baseObjects.some(o => o.gridX === gx && o.gridY === gy && score >= o.level);
              
              return (
                <div 
                  key={`${gx}-${gy}`}
                  className={`absolute w-[80px] h-[40px] transition-all duration-700 rounded-[10px] ${isOccupied ? `${seasonStyles.tile} ${seasonStyles.shadow}` : 'bg-slate-200/20 dark:bg-slate-800/20'}`}
                  style={{ left, top, transform: 'translate(-50%, -50%)', zIndex: gx + gy }}
                >
                  <div className="absolute inset-0 border border-white/20 rounded-[10px]"></div>
                </div>
              );
            })
          )}

          {/* Объекты */}
          {allObjects.map((obj, i) => {
            const isUnlocked = score >= obj.level;
            if (!isUnlocked) return null;
            const { left, top } = getIsoCoords(obj.gridX, obj.gridY);
            
            return (
              <div 
                key={i}
                className="absolute transition-all duration-1000 flex flex-col items-center pointer-events-none"
                style={{ 
                  left, 
                  top: `calc(${top} - 15px)`, 
                  zIndex: obj.gridX + obj.gridY + 1,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-8 h-3 bg-black/10 rounded-full blur-sm absolute bottom-0 translate-y-1"></div>
                <div className={`text-5xl drop-shadow-2xl ${obj.type === 'npc' || obj.type === 'event' ? 'animate-bounce-slow' : 'hover:scale-110'}`}>
                  {obj.icon}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .snow, .petal, .leaf, .butterfly {
          position: absolute;
          top: -20px;
          animation: fall linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
