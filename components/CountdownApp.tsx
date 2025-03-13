// components/CountdownApp.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { useAlarm } from '../hooks/useAlarm';
import { SetupScreen } from './SetupScreen';
import { CountdownScreen } from './CountdownScreen';

interface WakeLockSentinel {
  release: () => Promise<void>;
}

export default function CountdownApp() {
  // Stany aplikacji
  const [screen, setScreen] = useState('setup');
  const [totalTime, setTotalTime] = useState(0);
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [visualizationType, setVisualizationType] = useState<'grid' | 'line' | 'tank'>('grid');
  const [scaleType, setScaleType] = useState<'minutes' | 'seconds' | 'custom'>('minutes');
  const [segmentCount, setSegmentCount] = useState(100);
  const [customSegments, setCustomSegments] = useState('');
  const [clockStyle, setClockStyle] = useState<'simple' | 'full' | 'combined'>('simple');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [colorGradient, setColorGradient] = useState(false);
  const [showDividers, setShowDividers] = useState(true);
  const [squareSegments, setSquareSegments] = useState(true);
  const [flashSpeed, setFlashSpeed] = useState(500);

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
    },
    flashSpeed
  });

  // Referencje
  const lastTimerSettings = useRef({ minutes: 0, seconds: 0 });
  const countdownRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

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
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('Wake Lock aktywny');
        }
      } catch (err) {
        console.log('Wake Lock error:', err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock zwolniony');
        } catch (err) {
          console.error('Błąd zwalniania Wake Lock:', err);
        }
      }
    };

    if (isRunning) {
      requestWakeLock();
      
      // Obsługa zdarzeń widoczności strony
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
          requestWakeLock();
        }
      });
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', () => {});
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

  // Ustaw domyślne wartości przy pierwszym renderowaniu
  useEffect(() => {
    // Domyślne ustawienia aplikacji
    setVisualizationType('grid');
    setScaleType('minutes');
    setColorGradient(false);
    setShowDividers(true);
    setSquareSegments(true);
    
    // Domyślne ustawienia alarmu
    updateAlarmSettings({
      vibration: false,
      sound: false,
      flash: true,
      flashDuration: 5000,
      vibrationPattern: 'medium'
    });
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
      return '#10B981'; // green-500
    }
    
    // Oblicz postęp segmentu w zakresie od 0 do 1
    const segmentProgress = index / (activeSegments - 1 || 1);
    
    // Gradient od zielonego (hue: 120) przez żółty (hue: 60) do czerwonego (hue: 0)
    // Dopasowujemy odcienie tak, aby zmiana była bardziej naturalna
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
          showDividers={showDividers}
          setShowDividers={setShowDividers}
          squareSegments={squareSegments}
          setSquareSegments={setSquareSegments}
          flashSpeed={flashSpeed}
          setFlashSpeed={setFlashSpeed}
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