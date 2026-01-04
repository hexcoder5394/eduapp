import React from 'react';
import { Play, Pause, RotateCcw, Timer, Settings2 } from 'lucide-react';

const PomodoroTimer = ({ 
  timeLeft, 
  totalTime, 
  isActive, 
  onToggle, 
  onReset, 
  activeSessionTitle // Optional: Show what we are working on
}) => {
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Prevent division by zero
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <div className="h-full rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between relative overflow-hidden group">
      {isActive && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none"></div>}

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <h3 className="text-slate-400 text-sm font-medium flex items-center gap-2">
          <Timer size={16} /> {activeSessionTitle ? 'Focusing...' : 'Focus Timer'}
        </h3>
        {/* We removed edit button here for simplicity, control is via Modal now */}
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col justify-center items-center py-2 z-10">
        <div className="text-4xl font-mono font-bold text-white tracking-wider">
           {formatTime(timeLeft)}
        </div>
        
        {/* Show what we are working on */}
        {activeSessionTitle && (
          <p className="text-xs text-indigo-400 mt-1 font-medium truncate max-w-[150px]">
            {activeSessionTitle}
          </p>
        )}

        <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 z-10">
        <button 
          onClick={onToggle}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all text-sm ${
            isActive ? 'bg-slate-800 text-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {isActive ? <><Pause size={16}/> Pause</> : <><Play size={16}/> Resume</>}
        </button>
        <button onClick={onReset} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;