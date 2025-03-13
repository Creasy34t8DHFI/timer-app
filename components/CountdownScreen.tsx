// components/CountdownScreen.tsx
import React, { forwardRef, useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { SideMenu } from './SideMenu';
import { ClockDisplay } from './ClockDisplay';
import { GridVisualization } from './GridVisualization';
import { LineVisualization } from './LineVisualization';
import { TankVisualization } from './TankVisualization';
import { AlarmSettings } from '../hooks/useAlarm';

interface CountdownScreenProps {
  timeLeft: number;
  totalTime: number;
  isFlashing: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  clockStyle: 'simple' | 'full' | 'combined';
  setClockStyle: (style: 'simple' | 'full' | 'combined') => void;
  visualizationType: 'grid' | 'line' | 'tank';
  setVisualizationType: (type: 'grid' | 'line' | 'tank') => void;
  scaleType: 'minutes' | 'seconds' | 'custom';
  setScaleType: (type: 'minutes' | 'seconds' | 'custom') => void;
  getSegmentCount: () => number;
  segmentCount: number;
  setSegmentCount: (count: number) => void;
  customSegments: string;
  setCustomSegments: (value: string) => void;
  colorGradient: boolean;
  setColorGradient: (enabled: boolean) => void;
  showDividers: boolean;
  setShowDividers: (enabled: boolean) => void;
  squareSegments: boolean;
  setSquareSegments: (enabled: boolean) => void;
  fullScreen: boolean;
  setFullScreen: (enabled: boolean) => void;
  flashSpeed: number;
  setFlashSpeed: (speed: number) => void;
  getSegmentColor: (index: number, activeSegments: number, totalSegments: number) => string;
  alarmSettings: AlarmSettings;
  onAlarmSettingsChange: (settings: Partial<AlarmSettings>) => void;
  onSoundFileChange: (file: File | null) => void;
  onRepeatLastTimer: (e: React.MouseEvent) => void;
  onReset: (e: React.MouseEvent) => void;
}

export const CountdownScreen = forwardRef<HTMLDivElement, CountdownScreenProps>(
  ({
    timeLeft,
    totalTime,
    isFlashing,
    isMenuOpen,
    setIsMenuOpen,
    clockStyle,
    setClockStyle,
    visualizationType,
    setVisualizationType,
    scaleType,
    setScaleType,
    getSegmentCount,
    segmentCount,
    setSegmentCount,
    customSegments,
    setCustomSegments,
    colorGradient,
    setColorGradient,
    showDividers,
    setShowDividers,
    squareSegments,
    setSquareSegments,
    fullScreen,
    setFullScreen,
    flashSpeed,
    setFlashSpeed,
    getSegmentColor,
    alarmSettings,
    onAlarmSettingsChange,
    onSoundFileChange,
    onRepeatLastTimer,
    onReset
  }, ref) => {
  
  // Stan do obsługi tymczasowego wyświetlania zegara w trybie pełnoekranowym
  const [showTempClock, setShowTempClock] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  
  // Obsługa podwójnego tapnięcia dla wyjścia z trybu pełnoekranowego
  const handleScreenTap = () => {
    if (fullScreen) {
      const currentTime = new Date().getTime();
      const tapDiff = currentTime - lastTapTime;
      
      if (tapDiff < 300) {
        // Podwójne tapnięcie - wyjdź z trybu pełnoekranowego
        setFullScreen(false);
      } else {
        // Pojedyncze tapnięcie - pokaż zegar tymczasowo
        setShowTempClock(true);
        // Ukryj zegar po 2 sekundach
        setTimeout(() => {
          setShowTempClock(false);
        }, 2000);
      }
      
      setLastTapTime(currentTime);
    }
  };
  
  // Obsługa klawiszy (Escape) do wyjścia z trybu pełnoekranowego
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullScreen) {
        setFullScreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullScreen, setFullScreen]);
  
  return (
    <div 
      ref={ref}
      className={`h-screen flex flex-col ${isFlashing ? 'bg-white' : 'bg-black'} overflow-hidden`}
      onClick={handleScreenTap}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(true);
        }}
        className="absolute top-4 right-4 text-gray-600 p-2 z-40"
      >
        <Menu size={24} />
      </button>

      <SideMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        clockStyle={clockStyle}
        setClockStyle={setClockStyle}
        visualizationType={visualizationType}
        setVisualizationType={setVisualizationType}
        scaleType={scaleType}
        setScaleType={setScaleType}
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
        fullScreen={fullScreen}
        setFullScreen={setFullScreen}
        flashSpeed={flashSpeed}
        setFlashSpeed={setFlashSpeed}
        alarmSettings={alarmSettings}
        onAlarmSettingsChange={onAlarmSettingsChange}
        onSoundFileChange={onSoundFileChange}
        onRepeatLastTimer={onRepeatLastTimer}
        onReset={onReset}
      />

      <div className="flex-1 flex flex-col items-center">
        {/* Pokaż zegar, jeśli nie jesteśmy w trybie pełnoekranowym lub tymczasowo pokazujemy zegar */}
        {(!fullScreen || showTempClock) && (
          <div className={`pt-10 pb-4 ${showTempClock ? 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-70 p-6 rounded-lg' : ''}`}>
            <ClockDisplay 
              timeLeft={timeLeft} 
              clockStyle={clockStyle} 
            />
          </div>
        )}

        <div className={`${fullScreen ? 'w-full h-full' : 'flex-1 w-full'}`}>
          {visualizationType === 'grid' && (
            <GridVisualization 
              timeLeft={timeLeft} 
              totalTime={totalTime} 
              getSegmentCount={getSegmentCount} 
              getSegmentColor={getSegmentColor}
              colorGradient={colorGradient}
              showDividers={showDividers}
              squareSegments={squareSegments}
              fullScreen={fullScreen}
            />
          )}
          {visualizationType === 'line' && (
            <LineVisualization 
              timeLeft={timeLeft} 
              totalTime={totalTime} 
              getSegmentCount={getSegmentCount} 
              getSegmentColor={getSegmentColor}
              colorGradient={colorGradient}
              showDividers={showDividers}
              fullScreen={fullScreen}
            />
          )}
          {visualizationType === 'tank' && (
            <TankVisualization 
              progress={timeLeft / totalTime} 
              segments={getSegmentCount()}
              colorGradient={colorGradient}
              showDividers={showDividers}
              fullScreen={fullScreen}
            />
          )}
        </div>
      </div>
    </div>
  );
});