import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

interface WakeLockSentinel {
  release: () => void;
}

export default function CountdownApp() {
  const [screen, setScreen] = useState('setup');
  const [totalTime, setTotalTime] = useState(0);
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [visualizationType, setVisualizationType] = useState('grid');
  const [scaleType, setScaleType] = useState('minutes');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { 
    isRunning, 
    remaining: timeLeft, 
    progress,
    startTimer,
    stopTimer,
    resetTimer 
  } = useCountdown();

  // Prevent screen from sleeping during countdown
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
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

  // Wibracja po zakończeniu
  useEffect(() => {
    if (timeLeft === 0 && screen === 'countdown' && !isRunning) {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [timeLeft, screen, isRunning]);

  const getTotalMinutes = () => Math.ceil(totalTime / 60);
  const getTotalSeconds = () => totalTime;
  const getElapsedFullMinutes = () => Math.floor((totalTime - timeLeft) / 60);
  const getElapsedSeconds = () => totalTime - timeLeft;
  const getCompletionPercentage = () => 
    totalTime === 0 ? 0 : Math.round(((totalTime - timeLeft) / totalTime) * 100);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleStart = () => {
    const mins = parseInt(inputMinutes) || 0;
    const secs = parseInt(inputSeconds) || 0;
    const totalSeconds = (mins * 60) + secs;
    if (totalSeconds > 0) {
      setTotalTime(totalSeconds);
      startTimer(totalSeconds);
      setScreen('countdown');
      // Zamknij klawiaturę na mobilnych
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const handleStartToTime = () => {
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

  const handleReset = () => {
    resetTimer();
    setTotalTime(0);
    setInputMinutes('');
    setInputSeconds('');
    setTargetTime('');
    setScreen('setup');
    setIsMenuOpen(false);
  };

  const getTotalSegments = () => {
    switch(scaleType) {
      case 'minutes':
        return getTotalMinutes();
      case 'seconds':
        return getTotalSeconds();
      case 'standard':
        return 100;
      default:
        return getTotalMinutes();
    }
  };

  const getActiveSegments = () => {
    const total = getTotalSegments();
    switch(scaleType) {
      case 'minutes':
        return total - getElapsedFullMinutes();
      case 'seconds':
        return total - getElapsedSeconds();
      case 'standard':
        return total - Math.floor((getCompletionPercentage() * total) / 100);
      default:
        return total - getElapsedFullMinutes();
    }
  };

  const calculateGridLayout = (totalItems: number) => {
    if (totalItems <= 10) return totalItems;
    if (totalItems <= 20) return 10;
    return Math.min(Math.ceil(Math.sqrt(totalItems)), 12);
  };

  const GridVisualization = () => {
    const totalSegments = getTotalSegments();
    const activeSegments = getActiveSegments();
    const cols = calculateGridLayout(totalSegments);
    
    return (
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '2px',
          height: '30vh',
        }} 
        className="w-full mb-4"
      >
        {[...Array(totalSegments)].map((_, index) => (
          <div
            key={index}
            className={`w-full ${
              index < activeSegments ? 'bg-green-500' : 'bg-gray-800'
            }`}
          />
        ))}
      </div>
    );
  };

  const LineVisualization = () => {
    const totalSegments = getTotalSegments();
    const activeSegments = getActiveSegments();
    
    return (
      <div className="mb-4 space-y-2 w-full">
        <div className="h-6 bg-gray-800 relative flex w-full">
          {[...Array(totalSegments)].map((_, index) => (
            <div
              key={index}
              className={`flex-1 border-r border-black ${
                index < activeSegments ? 'bg-green-500' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
        <div className="text-gray-400 text-center text-sm">
          {getCompletionPercentage()}%
        </div>
      </div>
    );
  };

  const SideMenu = () => (
    <div 
      className={`fixed top-0 right-0 h-full w-72 bg-gray-900 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6">
        <button 
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-6 right-6 text-gray-400 p-2 touch-manipulation"
        >
          <X size={24} />
        </button>
        
        <div className="space-y-6 mt-16">
          <div>
            <p className="text-gray-400 mb-3">Typ wizualizacji:</p>
            <button
              onClick={() => setVisualizationType('grid')}
              className={`block w-full text-left p-4 rounded touch-manipulation ${
                visualizationType === 'grid' ? 'bg-gray-700' : 'text-gray-400'
              }`}
            >
              Siatka
            </button>
            <button
              onClick={() => setVisualizationType('line')}
              className={`block w-full text-left p-4 rounded mt-2 touch-manipulation ${
                visualizationType === 'line' ? 'bg-gray-700' : 'text-gray-400'
              }`}
            >
              Oś czasu
            </button>
          </div>

          <div>
            <p className="text-gray-400 mb-3">Podziałka:</p>
            <button
              onClick={() => setScaleType('minutes')}
              className={`block w-full text-left p-4 rounded touch-manipulation ${
                scaleType === 'minutes' ? 'bg-gray-700' : 'text-gray-400'
              }`}
            >
              Minutowa
            </button>
            <button
              onClick={() => setScaleType('seconds')}
              className={`block w-full text-left p-4 rounded mt-2 touch-manipulation ${
                scaleType === 'seconds' ? 'bg-gray-700' : 'text-gray-400'
              }`}
            >
              Sekundowa
            </button>
            <button
              onClick={() => setScaleType('standard')}
              className={`block w-full text-left p-4 rounded mt-2 touch-manipulation ${
                scaleType === 'standard' ? 'bg-gray-700' : 'text-gray-400'
              }`}
            >
              Standardowa (100)
            </button>
          </div>
          
          <div className="pt-6 border-t border-gray-700">
            <button
              onClick={() => isRunning ? stopTimer() : startTimer(timeLeft)}
              className={`w-full p-4 rounded mb-2 touch-manipulation ${
                isRunning ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {isRunning ? 'Pauza' : 'Wznów'}
            </button>
            <button
              onClick={handleReset}
              className="w-full p-4 bg-gray-800 text-gray-400 rounded touch-manipulation"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SetupScreen = () => (
    <div className="min-h-screen bg-black p-6 flex flex-col">
      <h1 className="text-white text-2xl mb-8 text-center">Ustaw Timer</h1>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-gray-400">Czas odliczania:</p>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Min"
              className="flex-1 p-4 rounded bg-gray-800 text-white text-lg touch-manipulation"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
            />
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Sek"
              className="flex-1 p-4 rounded bg-gray-800 text-white text-lg touch-manipulation"
              value={inputSeconds}
              onChange={(e) => setInputSeconds(e.target.value)}
            />
          </div>
          <button
            onClick={handleStart}
            className="w-full p-4 bg-blue-600 rounded text-white text-lg touch-manipulation"
          >
            Start
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-400">Lub godzina docelowa:</p>
          <input
            type="time"
            className="w-full p-4 rounded bg-gray-800 text-white text-lg touch-manipulation"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
          />
          <button
            onClick={handleStartToTime}
            className="w-full p-4 bg-blue-600 rounded text-white text-lg touch-manipulation"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );

  const CountdownScreen = () => (
    <div className="min-h-screen bg-black p-4 flex flex-col">
      <button
        onClick={() => setIsMenuOpen(true)}
        className="absolute top-4 right-4 text-gray-600 p-2 touch-manipulation"
      >
        <Menu size={24} />
      </button>

      <SideMenu />

      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-600 text-7xl md:text-8xl font-mono">
          {formatTime()}
        </div>
      </div>

      {visualizationType === 'grid' && <GridVisualization />}
      {visualizationType === 'line' && <LineVisualization />}
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {screen === 'setup' ? <SetupScreen /> : <CountdownScreen />}
    </div>
  );
}