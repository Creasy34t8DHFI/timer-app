// components/CountdownApp.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Clock } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { TankVisualization } from './TankVisualization';

interface WakeLockSentinel {
  release: () => void;
}

interface AlarmSettings {
  vibration: boolean;
  vibrationDuration: number;
  sound: boolean;
  soundFile: string | null;
  flash: boolean;
  flashDuration: number;
}

const PREDEFINED_TIMES = [
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
  { label: '20 min', minutes: 20 },
  { label: '25 min', minutes: 25 },
  { label: '30 min', minutes: 30 },
];

const SEGMENT_OPTIONS = [50, 100, 150];

export default function CountdownApp() {
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
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings>({
    vibration: true,
    vibrationDuration: 1000,
    sound: false,
    soundFile: null,
    flash: false,
    flashDuration: 3000
  });

  const { 
    isRunning, 
    remaining: timeLeft, 
    progress,
    startTimer,
    stopTimer,
    resetTimer 
  } = useCountdown();

  const lastTimerSettings = React.useRef({ minutes: 0, seconds: 0 });

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

  useEffect(() => {
    if (timeLeft === 0 && screen === 'countdown' && !isRunning) {
      if (alarmSettings.vibration && 'vibrate' in navigator) {
        navigator.vibrate([alarmSettings.vibrationDuration]);
      }
      if (alarmSettings.flash) {
        // Obsługa lampy błyskowej
      }
      if (alarmSettings.sound && alarmSettings.soundFile) {
        const audio = new Audio(alarmSettings.soundFile);
        audio.play().catch(console.error);
      }
    }
  }, [timeLeft, screen, isRunning, alarmSettings]);

  const getTotalMinutes = () => Math.ceil(totalTime / 60);
  const getTotalSeconds = () => totalTime;
  const getElapsedFullMinutes = () => Math.floor((totalTime - timeLeft) / 60);
  const getElapsedSeconds = () => totalTime - timeLeft;

  const formatTimeSimple = () => {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const formatTimeFull = () => {
    const hours = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const getSegmentCount = () => {
    switch(scaleType) {
      case 'minutes':
        return getTotalMinutes();
      case 'seconds':
        return getTotalSeconds();
      default:
        return segmentCount;
    }
  };

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    e.stopPropagation();
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
    e.stopPropagation();
    const { minutes, seconds } = lastTimerSettings.current;
    const totalSeconds = (minutes * 60) + seconds;
    if (totalSeconds > 0) {
      setTotalTime(totalSeconds);
      startTimer(totalSeconds);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetTimer();
    setTotalTime(0);
    setInputMinutes('');
    setInputSeconds('');
    setTargetTime('');
    setScreen('setup');
    setIsMenuOpen(false);
  };

  const handleSoundFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAlarmSettings(prev => ({ ...prev, soundFile: url, sound: true }));
    }
  };

  const updateSegments = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 500) {
      setSegmentCount(num);
      setCustomSegments(value);
    }
  };

  const GridVisualization = () => {
    const totalSegments = getSegmentCount();
    const cols = totalSegments <= 10 ? totalSegments : 
                totalSegments <= 20 ? 10 : 
                Math.min(Math.ceil(Math.sqrt(totalSegments)), 12);
    
    return (
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '2px',
          height: '60vh',
        }} 
        className="w-full mb-4"
      >
        {[...Array(totalSegments)].map((_, index) => (
          <div
            key={index}
            className={`w-full ${
              index < Math.floor((1 - progress) * totalSegments) ? 'bg-green-500' : 'bg-gray-800'
            }`}
          />
        ))}
      </div>
    );
  };

  const LineVisualization = () => {
    const totalSegments = getSegmentCount();
    
    return (
      <div className="mb-4 space-y-2 w-full h-[60vh] flex flex-col justify-end">
        <div className="h-6 bg-gray-800 relative flex w-full">
          {[...Array(totalSegments)].map((_, index) => (
            <div
              key={index}
              className={`flex-1 border-r border-black ${
                index < Math.floor((1 - progress) * totalSegments) ? 'bg-green-500' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
        <div className="text-gray-400 text-center text-sm">
          {Math.round(progress * 100)}%
        </div>
      </div>
    );
  };
const SideMenu = () => (
    <div 
      className={`fixed top-0 right-0 h-full w-72 bg-gray-900 transform transition-transform duration-300 z-50 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6 overflow-y-auto h-full">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(false);
          }}
          className="absolute top-6 right-6 text-gray-400 p-2 touch-manipulation"
        >
          <X size={24} />
        </button>
        
        <div className="space-y-6 mt-16">
          {/* Sekcja Wygląd */}
          <div>
            <h3 className="text-gray-400 font-medium mb-4">Wygląd</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 mb-2">Styl zegara:</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setClockStyle('simple');
                  }}
                  className={`block w-full text-left p-3 rounded ${
                    clockStyle === 'simple' ? 'bg-gray-700' : 'text-gray-400'
                  }`}
                >
                  Prosty (mm:ss)
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setClockStyle('full');
                  }}
                  className={`block w-full text-left p-3 rounded mt-2 ${
                    clockStyle === 'full' ? 'bg-gray-700' : 'text-gray-400'
                  }`}
                >
                  Pełny (hh:mm:ss)
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setClockStyle('combined');
                  }}
                  className={`block w-full text-left p-3 rounded mt-2 ${
                    clockStyle === 'combined' ? 'bg-gray-700' : 'text-gray-400'
                  }`}
                >
                  Połączony
                </button>
              </div>

              <div>
                <p className="text-gray-400 mb-2">Wizualizacja:</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisualizationType('grid');
                  }}
                  className={`block w-full text-left p-3 rounded ${
                    visualizationType === 'grid' ? 'bg-gray-700' : 'text-gray-400'
                  }`}
                >
                  Siatka
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisualizationType('line');
                  }}
                  className={`block w-full text-left p-3 rounded mt-2 ${
                    visualizationType === 'line' ? 'bg-gray-700' : 'text-gray-400'
                  }`}
                >
                  Oś czasu
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisualizationType('tank');
                  }}
                  className={`block w-full text-left p-3 rounded mt-2 ${
                    visualizationType === 'tank' ? 'bg-gray-700' : 'text-gray-400'
                  }`}
                >
                  Zbiornik
                </button>
              </div>

              <div>
                <p className="text-gray-400 mb-2">Podziałka:</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setScaleType('minutes');
                  }}
                  className={`block w-full text-left p-3 rounded ${
                    scaleType === 'minutes' ? 'bg-gray-700' : 'text-gray-400'
                  }`}
                >
                  Jeden segment = minuta
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setScaleType('seconds');
                  }}
                  className={`block w-full text-left p-3 rounded mt-2 ${
                    scaleType === 'seconds' ? 'bg-gray-700' : 'text-gray-400'
                  }`}
                >
                  Jeden segment = sekunda
                </button>
                {SEGMENT_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={(e) => {
                      e.stopPropagation();
                      setScaleType('custom');
                      setSegmentCount(option);
                    }}
                    className={`block w-full text-left p-3 rounded mt-2 ${
                      scaleType === 'custom' && segmentCount === option ? 'bg-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {option} segmentów
                  </button>
                ))}
                <div className="mt-2 relative">
                  <input
                    type="number"
                    placeholder="Własna wartość"
                    className="w-full p-3 rounded bg-gray-800 text-white"
                    value={customSegments}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateSegments(e.target.value);
                      setScaleType('custom');
                    }}
                    onFocus={(e) => e.stopPropagation()}
                    min="1"
                    max="500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sekcja Alarmy */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-gray-400 font-medium mb-4">Alarmy</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alarmSettings.vibration}
                    onChange={(e) => {
                      e.stopPropagation();
                      setAlarmSettings(prev => ({
                        ...prev,
                        vibration: e.target.checked
                      }));
                    }}
                    className="rounded bg-gray-800"
                  />
                  <span className="text-gray-400">Wibracje</span>
                </label>
                {alarmSettings.vibration && (
                  <input
                    type="number"
                    placeholder="Czas wibracji (ms)"
                    className="mt-2 w-full p-3 rounded bg-gray-800 text-white"
                    value={alarmSettings.vibrationDuration}
                    onChange={(e) => {
                      e.stopPropagation();
                      setAlarmSettings(prev => ({
                        ...prev,
                        vibrationDuration: parseInt(e.target.value) || 1000
                      }));
                    }}
                    onFocus={(e) => e.stopPropagation()}
                  />
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alarmSettings.sound}
                    onChange={(e) => {
                      e.stopPropagation();
                      setAlarmSettings(prev => ({
                        ...prev,
                        sound: e.target.checked
                      }));
                    }}
                    className="rounded bg-gray-800"
                  />
                  <span className="text-gray-400">Dźwięk</span>
                </label>
                {alarmSettings.sound && (
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleSoundFileChange}
                    className="mt-2 w-full p-3 rounded bg-gray-800 text-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={alarmSettings.flash}
                    onChange={(e) => {
                      e.stopPropagation();
                      setAlarmSettings(prev => ({
                        ...prev,
                        flash: e.target.checked
                      }));
                    }}
                    className="rounded bg-gray-800"
                  />
                  <span className="text-gray-400">Lampa błyskowa</span>
                </label>
                {alarmSettings.flash && (
                  <input
                    type="number"
                    placeholder="Czas błysku (ms)"
                    className="mt-2 w-full p-3 rounded bg-gray-800 text-white"
                    value={alarmSettings.flashDuration}
                    onChange={(e) => {
                      e.stopPropagation();
                      setAlarmSettings(prev => ({
                        ...prev,
                        flashDuration: parseInt(e.target.value) || 3000
                      }));
                    }}
                    onFocus={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sekcja Akcje */}
          <div className="border-t border-gray-700 pt-6">
            <button
              onClick={handleRepeatLastTimer}
              className="w-full p-4 bg-gray-800 text-gray-400 rounded mb-2 touch-manipulation"
            >
              Powtórz ostatni timer
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
const TimeSelector = () => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-white text-lg mb-4">Wybierz czas</h3>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PREDEFINED_TIMES.map(({ label, minutes }) => (
            <button
              key={label}
              onClick={(e) => {
                e.stopPropagation();
                setInputMinutes(minutes.toString());
                setInputSeconds('0');
                setShowTimeSelector(false);
              }}
              className="p-3 bg-gray-800 rounded text-white"
            >
              {label}
            </button>
          ))}
        </div>
        
        <div className="flex">
          <input
            type="time"
            className="flex-1 p-3 rounded bg-gray-800 text-white mr-2"
            value={`00:${inputMinutes.padStart(2, '0')}`}
            onChange={(e) => {
              e.stopPropagation();
              const [_, minutes] = e.target.value.split(':');
              setInputMinutes(minutes);
            }}
            onFocus={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTimeSelector(false);
            }}
            className="p-3 bg-gray-700 rounded text-white"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  const SetupScreen = () => (
    <div 
      className="min-h-screen bg-black p-6 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <h1 className="text-white text-2xl mb-8 text-center">Ustaw Timer</h1>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-gray-400">Czas odliczania:</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTimeSelector(true);
            }}
            className="w-full p-4 rounded bg-gray-800 text-white text-lg flex items-center justify-between touch-manipulation"
          >
            <span>{inputMinutes ? `${inputMinutes}:${inputSeconds.padStart(2, '0')}` : 'Wybierz czas'}</span>
            <Clock size={24} />
          </button>
          {showTimeSelector && <TimeSelector />}
          <button
            onClick={handleStart}
            className="w-full p-4 bg-red-600 rounded text-white text-lg touch-manipulation"
          >
            Start
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-400">Godzina docelowa:</p>
          <input
            type="time"
            className="w-full p-4 rounded bg-gray-800 text-white text-lg touch-manipulation"
            value={targetTime}
            onChange={(e) => {
              e.stopPropagation();
              setTargetTime(e.target.value);
            }}
            onFocus={(e) => e.stopPropagation()}
          />
          <button
            onClick={handleStartToTime}
            className="w-full p-4 bg-red-600 rounded text-white text-lg touch-manipulation"
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
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(true);
        }}
        className="absolute top-4 right-4 text-gray-600 p-2 touch-manipulation z-40"
      >
        <Menu size={24} />
      </button>

      <SideMenu />

      <div className="flex-1 flex flex-col items-center justify-start pt-16">
        {clockStyle === 'simple' && (
          <div className="text-red-600 text-7xl md:text-8xl font-mono mb-8">
            {formatTimeSimple()}
          </div>
        )}
        {clockStyle === 'full' && (
          <div className="text-red-600 text-7xl md:text-8xl font-mono mb-8">
            {formatTimeFull()}
          </div>
        )}
        {clockStyle === 'combined' && (
          <div className="space-y-2 mb-8">
            <div className="text-red-600 text-7xl md:text-8xl font-mono">
              {formatTimeSimple()}
            </div>
            <div className="text-red-600 text-4xl md:text-5xl font-mono text-center">
              {formatTimeFull()}
            </div>
          </div>
        )}

        {visualizationType === 'grid' && <GridVisualization />}
        {visualizationType === 'line' && <LineVisualization />}
        {visualizationType === 'tank' && (
          <TankVisualization progress={progress} segments={getSegmentCount()} />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {screen === 'setup' ? <SetupScreen /> : <CountdownScreen />}
    </div>
  );
}