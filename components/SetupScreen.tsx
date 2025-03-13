// components/SetupScreen.tsx
import React from 'react';
import { Clock } from 'lucide-react';
import { TimeSelector } from './TimeSelector';

interface SetupScreenProps {
  inputMinutes: string;
  setInputMinutes: (minutes: string) => void;
  inputSeconds: string;
  setInputSeconds: (seconds: string) => void;
  targetTime: string;
  setTargetTime: (time: string) => void;
  showTimeSelector: boolean;
  setShowTimeSelector: (show: boolean) => void;
  onStart: (e: React.MouseEvent) => void;
  onStartToTime: (e: React.MouseEvent) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  inputMinutes,
  setInputMinutes,
  inputSeconds,
  setInputSeconds,
  targetTime,
  setTargetTime,
  showTimeSelector,
  setShowTimeSelector,
  onStart,
  onStartToTime
}) => {
  return (
    <div className="h-screen bg-black p-6 flex flex-col">
      <h1 className="text-white text-2xl mb-8 text-center">Ustaw Timer</h1>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-gray-400">Czas odliczania:</p>
          <button
            onClick={() => setShowTimeSelector(true)}
            className="w-full p-4 rounded bg-gray-800 text-white text-lg flex items-center justify-between"
          >
            <span>{inputMinutes ? `${inputMinutes}:${inputSeconds.padStart(2, '0')}` : 'Wybierz czas'}</span>
            <Clock size={24} />
          </button>
          {showTimeSelector && (
            <TimeSelector 
              inputMinutes={inputMinutes}
              setInputMinutes={setInputMinutes}
              setInputSeconds={setInputSeconds}
              onClose={() => setShowTimeSelector(false)}
            />
          )}
          <button
            onClick={onStart}
            className="w-full p-4 bg-red-600 rounded text-white text-lg"
          >
            Start
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-400">Godzina docelowa:</p>
          <input
            type="time"
            className="w-full p-4 rounded bg-gray-800 text-white text-lg"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
          />
          <button
            onClick={onStartToTime}
            className="w-full p-4 bg-red-600 rounded text-white text-lg"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};