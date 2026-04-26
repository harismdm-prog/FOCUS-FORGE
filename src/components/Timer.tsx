import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Bell, AlertCircle, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/api';
import { useTimer } from '../contexts/TimerContext';

interface TimerProps {
  user: any;
  onSessionComplete: (session: any) => void;
}

const TimerCircle = ({ minutes, seconds, progress, mode }: any) => (
  <div className="relative w-80 h-80 flex items-center justify-center">
    <svg className="w-full h-full -rotate-90 transform">
      <circle
        cx="160"
        cy="160"
        r="140"
        stroke="currentColor"
        strokeWidth="8"
        fill="transparent"
        className="text-white/[0.05]"
      />
      <motion.circle
        cx="160"
        cy="160"
        r="140"
        stroke="currentColor"
        strokeWidth="8"
        fill="transparent"
        strokeDasharray="880"
        animate={{ strokeDashoffset: 880 - (880 * progress) / 100 }}
        transition={{ duration: 0.5, ease: "linear" }}
        className={cn(
          "transition-colors duration-500",
          mode === 'focus' ? "text-accent-purple" : "text-accent-blue"
        )}
        style={{ strokeLinecap: 'round' }}
      />
    </svg>

    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <motion.span 
        key={minutes + seconds}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-8xl font-bold text-text-main tabular-nums tracking-tighter"
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </motion.span>
      <span className="text-text-dim font-medium uppercase tracking-widest text-xs mt-2">
        {mode === 'focus' ? 'Deep Work' : 'Rest Time'}
      </span>
    </div>
  </div>
);

export default function TimerComponent({ user }: TimerProps) {
  const {
    minutes,
    seconds,
    isActive,
    mode,
    progress,
    toggleTimer,
    resetTimer,
    setMode,
    setCustomDuration,
    customDuration,
    distractions,
    cycle
  } = useTimer();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
      document.exitFullscreen().catch(e => console.error(e));
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const testSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.error("Audio play failed:", e));
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-bg-dark flex flex-col items-center justify-center p-10">
        <button 
          onClick={toggleFullscreen}
          className="absolute top-10 right-10 p-4 rounded-full bg-white/5 text-text-dim hover:bg-white/10 transition-all"
        >
          <X size={24} />
        </button>
        <div className="scale-125 origin-center">
          <TimerCircle 
            minutes={minutes} 
            seconds={seconds} 
            progress={progress} 
            mode={mode} 
          />
        </div>
        <div className="mt-20 flex items-center gap-8">
          <button onClick={resetTimer} className="p-4 rounded-full bg-white/5 text-text-dim hover:bg-white/10"><RotateCcw size={24} /></button>
          <button onClick={toggleTimer} className="w-24 h-24 rounded-full bg-accent-purple flex items-center justify-center shadow-2xl shadow-accent-purple/40">
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-1" fill="currentColor" />}
          </button>
          <button onClick={testSound} className="p-4 rounded-full bg-white/5 text-text-dim hover:bg-white/10"><Bell size={24} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-10">
      {distractions > 0 && isActive && mode === 'focus' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <AlertCircle size={16} />
          Distraction detected! Stay focused. ({distractions})
        </motion.div>
      )}

      {/* Timer Card */}
      <div className="glass rounded-[32px] p-12 flex flex-col items-center justify-center relative shadow-2xl">
        {/* Mode Switcher */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mb-12">
          <button
            onClick={() => { setMode('focus'); resetTimer(); }}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium",
              mode === 'focus' ? "bg-accent-purple text-white shadow-lg shadow-accent-purple/20" : "text-text-dim hover:text-text-main"
            )}
          >
            <Brain size={18} />
            Focus
          </button>
          <button
            onClick={() => { setMode('break'); resetTimer(); }}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium",
              mode === 'break' ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/20" : "text-text-dim hover:text-text-main"
            )}
          >
            <Coffee size={18} />
            Break
          </button>
        </div>

        {/* Timer Circle */}
        <div className="relative group">
          <TimerCircle 
            minutes={minutes} 
            seconds={seconds} 
            progress={progress} 
            mode={mode} 
          />
          <button 
            onClick={toggleFullscreen}
            className="absolute top-0 right-0 p-3 rounded-full bg-white/5 text-text-dim opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 hover:text-text-main"
            title="Fullscreen Study Mode"
          >
            <Maximize2 size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-12">
          <button
            onClick={resetTimer}
            className="btn btn-ghost !px-6"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={toggleTimer}
            className="btn btn-primary min-w-[200px]"
          >
            {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
            {isActive ? 'Pause Session' : 'Start Session'}
          </button>

          <button
            onClick={testSound}
            className="btn btn-ghost !px-6"
          >
            <Bell size={20} />
          </button>
        </div>

        <p className="mt-8 text-sm text-text-dim">
          Focus cycle {((cycle - 1) % 4) + 1} of 4 &bull; Next break: {cycle % 4 === 0 ? 15 : (user?.settings?.breakDuration || 5)} min
        </p>
      </div>

      {/* Quick Settings */}
      <div className="flex gap-3">
        {[15, 25, 45, 60].map((dur) => (
          <button
            key={dur}
            onClick={() => { setCustomDuration(dur); resetTimer(); }}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
              customDuration === dur 
                ? "bg-accent-purple/10 text-accent-purple border-accent-purple/30" 
                : "bg-white/5 text-text-dim border-white/5 hover:bg-white/10 hover:text-text-main"
            )}
          >
            {dur}m
          </button>
        ))}
      </div>
    </div>
  );
}
