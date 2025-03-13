// components/CountdownApp.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { useSwipe } from '../hooks/useSwipe';
import { useAlarm } from '../hooks/useAlarm';
import { SetupScreen } from './SetupScreen';
import { CountdownScreen } from './CountdownScreen';

interface WakeLockSentinel {
  release: () => void;
}

const VISUALIZATION_TYPES = ['grid', 'line', 'tank'] as const;
type VisualizationType = typeof VISUALIZATION_TYPES[number];

export default function CountdownApp() {
  // Stany aplikacji
  const [screen, setScreen] = useState('setup');
  const [totalTime, setTotalTime] = useState(0);
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('grid');
  const [scaleType, setScaleType] = useState<'minutes' | 'seconds' | 'custom'>('minutes');
  const [segmentCount, setSegmentCount] = useState(100);
  const [customSegments, setCustomSegments] = useState('');
  const [clockStyle, setClockStyle] = useState<'simple' | 'full' | 'combined'>('simple');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [colorGradient, setColorGradient] = useState(true);

  // Hooki
  const { 
    isRunning, 
    remaining: timeLeft, 
    progress,
    startTimer,
    stopTimer,
    resetTimer 
  } = useCountdown();
  
  const { 
    settings: alarmSettings, 
    isFlashing, 
    updateSettings: updateAlarmSettings,
    handleSoundFileChange,
    triggerAlarm 
  } = useAlarm({
    onFlashStateChange: (flashing) => {
      // Umożliwia aktualizację stanu flashing w CountdownScreen
    }
  });

  // Referencje
  const lastTimerSettings = useRef({ minutes: 0, seconds: 0 });
  const countdownRef = useRef<HTMLDivElement>(null);

  // Zmień typ wizualizacji po geście przesunięcia
  const changeVisualizationType = (direction: 'left' | 'right') => {
    const currentIndex = VISUALIZATION_TYPES.indexOf(visualizationType);
    let newIndex;
    
    if (direction === 'left') {
      newIndex = (currentIndex + 1) % VISUALIZATION_TYPES.length;
    } else {
      newIndex = (currentIndex - 1 + VISUALIZATION_TYPES.length) % VISUALIZATION_TYPES.length;
    }
    
    setVisualizationType(VISUALIZATION_TYPES[newIndex]);
  };

  // Użyj hooka useSwipe do obsługi gestów przesuwania
  useSwipe(countdownRef, {
    onSwipeLeft: () => {
      if (screen === 'countdown' && !isMenuOpen) {
        changeVisualizationType('left');
      }
    },
    onSwipeRight: () => {
      if (screen === 'countdown' && !isMenuOpen) {
        changeVisualizationType('right');
      }
    }
  });

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Utrzymanie włączonego ekranu podczas odliczania
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    if (isRunning) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [isRunning]);

  // Wyzwolenie alarmu po zakończeniu odliczania
  useEffect(() => {
    if (timeLeft === 0 && screen === 'countdown' && !isRunning) {
      triggerAlarm();
    }
  }, [timeLeft, screen, isRunning, triggerAlarm]);

  // Rejestracja service workera dla trybu offline
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }
  }, []);

  // Funkcje pomocnicze
  const getTotalMinutes = () => Math.ceil(totalTime / 60);
  const getTotalSeconds = () => totalTime;
  
  const getSegmentCount = useCallback(() => {
    switch(scaleType) {
      case 'minutes':
        return getTotalMinutes();
      case 'seconds':
        return getTotalSeconds();
      default:
        return segmentCount;
    }
  }, [scaleType, segmentCount, totalTime]);

  // Funkcja do generowania kolorów gradientu od zielonego przez żółty do czerwonego
  const getSegmentColor = useCallback((index: number, activeSegments: number, totalSegments: number) => {
    if (!colorGradient) {
      return index < activeSegments ? 'bg-green-500' : 'bg-gray-800';
    }
    
    if (index >= activeSegments) {
      return 'bg-gray-800';
    }
    
    // Oblicz postęp segmentu w zakresie od 0 do 1
    const segmentProgress = index / activeSegments;
    
    // Gradient od zielonego (hue: 120) przez żółty (hue: 60) do czerwonego (hue: 0)
    // Dopasowujemy odcienie tak, aby zmiana była bardziej naturalna
    // Zielony (0-0.6), Żółty (0.6-0.8), Pomarańczowy/Czerwony (0.8-1.0)
    let h, s, l;
    
    if (segmentProgress < 0.6) {
      // Zielony -> Żółto-zielony
      h = 120 - (segmentProgress / 0.6) * 60;
      s = 70;
      l = 45;
    } else if (segmentProgress < 0.8) {
      // Żółto-zielony -> Żółty
      h = 60 - ((segmentProgress - 0.6) / 0.2) * 30;
      s = 80;
      l = 50;
    } else {
      // Żółty -> Czerwony
      h = 30 - ((segmentProgress - 0.8) / 0.2) * 30;
      s = 90;
      l = 45;
    }
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  }, [colorGradient]);

  // Obsługa zdarzeń
  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const mins = parseInt(inputMinutes) || 0;
    const secs = parseInt(inputSeconds) || 0;
    const totalSeconds = (mins * 60) + secs;
    if (totalSeconds > 0) {
      lastTimerSettings.current = { minutes: mins, seconds: secs };
      setTotalTime(totalSeconds);
      startTimer(totalSeconds);
      setScreen('countdown');
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const handleStartToTime = (e: React.MouseEvent) => {
    e.preventDefault();
    if (targetTime) {
      const [hours, minutes] = targetTime.split(':');
      const target = new Date();
      target.setHours(parseInt(hours), parseInt(minutes), 0);
      
      if (target < new Date()) {
        target.setDate(target.getDate() + 1);
      }
      
      const diffSeconds = Math.floor((target.getTime() - new Date().getTime()) / 1000);
      if (diffSeconds > 0) {
        setTotalTime(diffSeconds);
        startTimer(diffSeconds, true, target.getTime());
        setScreen('countdown');
      }
    }
  };

  const handleRepeatLastTimer = (e: React.MouseEvent) => {
    e.preventDefault();
    const { minutes, seconds } = lastTimerSettings.current;
    const totalSeconds = (minutes * 60) + seconds;
    if (totalSeconds > 0) {
      setTotalTime(totalSeconds);
      startTimer(totalSeconds);
      setIsMenuOpen(false);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    resetTimer();
    setTotalTime(0);
    setInputMinutes('');
    setInputSeconds('');
    setTargetTime('');
    setScreen('setup');
    setIsMenuOpen(false);
  };

  // Renderowanie odpowiedniego ekranu
  return (
    <div className="h-screen bg-black">
      {screen === 'setup' ? (
        <SetupScreen 
          inputMinutes={inputMinutes}
          setInputMinutes={setInputMinutes}
          inputSeconds={inputSeconds}
          setInputSeconds={setInputSeconds}
          targetTime={targetTime}
          setTargetTime={setTargetTime}
          showTimeSelector={showTimeSelector}
          setShowTimeSelector={setShowTimeSelector}
          onStart={handleStart}
          onStartToTime={handleStartToTime}
        />
      ) : (
        <CountdownScreen 
          ref={countdownRef}
          timeLeft={timeLeft}
          totalTime={totalTime}
          isFlashing={isFlashing}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          clockStyle={clockStyle}
          setClockStyle={setClockStyle}
          visualizationType={visualizationType}
          setVisualizationType={setVisualizationType}
          scaleType={scaleType}
          setScaleType={setScaleType}
          getSegmentCount={getSegmentCount}
          segmentCount={segmentCount}
          setSegmentCount={setSegmentCount}
          customSegments={customSegments}
          setCustomSegments={setCustomSegments}
          colorGradient={colorGradient}
          setColorGradient={setColorGradient}
          getSegmentColor={getSegmentColor}
          alarmSettings={alarmSettings}
          onAlarmSettingsChange={updateAlarmSettings}
          onSoundFileChange={handleSoundFileChange}
          onRepeatLastTimer={handleRepeatLastTimer}
          onReset={handleReset}
        />
      )}
    </div>
  );
}