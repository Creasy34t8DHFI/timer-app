// components/CountdownScreen.tsx
import React, { forwardRef } from 'react';
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
    flashSpeed,
    setFlashSpeed,
    getSegmentColor,
    alarmSettings,
    onAlarmSettingsChange,
    onSoundFileChange,
    onRepeatLastTimer,
    onReset
  }, ref) => {
  
  return (
    <div 
      ref={ref}
      className={`h-screen bg-black p-4 flex flex-col ${isFlashing ? 'bg-white' : 'bg-black'}`}
    >
      <button
        onClick={() => setIsMenuOpen(true)}
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
        flashSpeed={flashSpeed}
        setFlashSpeed={setFlashSpeed}
        alarmSettings={alarmSettings}
        onAlarmSettingsChange={onAlarmSettingsChange}
        onSoundFileChange={onSoundFileChange}
        onRepeatLastTimer={onRepeatLastTimer}
        onReset={onReset}
      />

      <div className="flex-1 flex flex-col items-center">
        <div className="pt-10 pb-4">
          <ClockDisplay 
            timeLeft={timeLeft} 
            clockStyle={clockStyle} 
          />
        </div>

        <div className="flex-1 w-full">
          {visualizationType === 'grid' && (
            <GridVisualization 
              timeLeft={timeLeft} 
              totalTime={totalTime} 
              getSegmentCount={getSegmentCount} 
              getSegmentColor={getSegmentColor}
              colorGradient={colorGradient}
              showDividers={showDividers}
              squareSegments={squareSegments}
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
            />
          )}
          {visualizationType === 'tank' && (
            <TankVisualization 
              progress={timeLeft / totalTime} 
              segments={getSegmentCount()}
              colorGradient={colorGradient}
              showDividers={showDividers}
            />
          )}
        </div>
      </div>
    </div>
  );
});