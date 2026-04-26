import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { saveSession } from '../lib/api';

interface TimerContextType {
  minutes: number;
  seconds: number;
  isActive: boolean;
  mode: 'focus' | 'break';
  progress: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: 'focus' | 'break') => void;
  setCustomDuration: (duration: number) => void;
  customDuration: number;
  distractions: number;
  cycle: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode; user: any; onSessionComplete: (result: any) => void }> = ({ children, user, onSessionComplete }) => {
  const [mode, setMode] = useState<'focus' | 'break'>(() => {
    const saved = localStorage.getItem('timer_mode');
    return (saved as 'focus' | 'break') || 'focus';
  });
  
  const [customDuration, setCustomDuration] = useState(() => {
    const saved = localStorage.getItem('timer_custom_duration');
    return saved ? parseInt(saved) : (user?.settings?.focusDuration || 25);
  });

  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem('timer_is_active');
    return saved === 'true';
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem('timer_time_left');
    const savedTimestamp = localStorage.getItem('timer_timestamp');
    const isActiveSaved = localStorage.getItem('timer_is_active') === 'true';

    if (savedTime && savedTimestamp && isActiveSaved) {
      const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      const remaining = Math.max(0, parseInt(savedTime) - elapsed);
      return remaining;
    }
    
    return savedTime ? parseInt(savedTime) : (mode === 'focus' ? customDuration * 60 : (user?.settings?.breakDuration || 5) * 60);
  });

  const [distractions, setDistractions] = useState(0);
  const [cycle, setCycle] = useState(() => {
    const saved = localStorage.getItem('timer_cycle');
    return saved ? parseInt(saved) : 1;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync with user settings when they change (if not active)
  useEffect(() => {
    if (!isActive) {
      const focusDur = user?.settings?.focusDuration || 25;
      setCustomDuration(focusDur);
      
      const time = mode === 'focus' 
        ? focusDur * 60 
        : (mode === 'break' ? (cycle % 4 === 0 ? 15 : (user?.settings?.breakDuration || 5)) * 60 : 5 * 60);
      
      setTimeLeft(time);
    }
  }, [user?.settings?.focusDuration, user?.settings?.breakDuration, mode, isActive, cycle]);

  useEffect(() => {
    localStorage.setItem('timer_mode', mode);
    localStorage.setItem('timer_custom_duration', customDuration.toString());
    localStorage.setItem('timer_is_active', isActive.toString());
    localStorage.setItem('timer_time_left', timeLeft.toString());
    localStorage.setItem('timer_timestamp', Date.now().toString());
    localStorage.setItem('timer_cycle', cycle.toString());
  }, [mode, customDuration, isActive, timeLeft, cycle]);

  const playSound = useCallback(() => {
    if (user?.settings?.soundNotifications !== false) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      }
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [user?.settings?.soundNotifications]);

  const handleComplete = useCallback(async () => {
    playSound();
    
    if (mode === 'focus') {
      const result = await saveSession(user.id, customDuration * 60, true);
      onSessionComplete(result);
      
      if (user?.settings?.browserNotifications !== false && Notification.permission === 'granted') {
        new Notification('Focus Session Complete!', {
          body: cycle % 4 === 0 ? 'Time for a long break!' : 'Time for a short break.',
          icon: '/favicon.ico'
        });
      }
      
      const nextMode = 'break';
      const isLongBreak = cycle % 4 === 0;
      const nextTime = (isLongBreak ? 15 : (user?.settings?.breakDuration || 5)) * 60;
      
      setMode(nextMode);
      setTimeLeft(nextTime);
      setIsActive(user?.settings?.autoStartBreaks || false);
    } else {
      const nextMode = 'focus';
      const nextTime = customDuration * 60;
      setCycle(prev => prev + 1);
      setMode(nextMode);
      setTimeLeft(nextTime);
      setIsActive(user?.settings?.autoStartFocus || false);
    }
  }, [mode, user.id, user?.settings, customDuration, onSessionComplete, playSound, cycle]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleComplete]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isActive && mode === 'focus') {
        setDistractions(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    const focusDur = customDuration || user?.settings?.focusDuration || 25;
    const time = mode === 'focus' 
      ? focusDur * 60 
      : (cycle % 4 === 0 ? 15 : (user?.settings?.breakDuration || 5)) * 60;
    setTimeLeft(time);
  }, [mode, customDuration, user?.settings, cycle]);

  const changeMode = (newMode: 'focus' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    const focusDur = customDuration || user?.settings?.focusDuration || 25;
    const time = newMode === 'focus' 
      ? focusDur * 60 
      : (cycle % 4 === 0 ? 15 : (user?.settings?.breakDuration || 5)) * 60;
    setTimeLeft(time);
  };

  const changeDuration = (duration: number) => {
    setCustomDuration(duration);
    if (mode === 'focus') {
      setIsActive(false);
      setTimeLeft(duration * 60);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = mode === 'focus' ? customDuration * 60 : (user?.settings?.breakDuration || 5) * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <TimerContext.Provider value={{
      minutes,
      seconds,
      isActive,
      mode,
      progress,
      toggleTimer,
      resetTimer,
      setMode: changeMode,
      setCustomDuration: changeDuration,
      customDuration,
      distractions,
      cycle
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
