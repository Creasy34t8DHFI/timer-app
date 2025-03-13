// components/TimeSelector.tsx
import React from 'react';

const PREDEFINED_TIMES = [
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
  { label: '20 min', minutes: 20 },
  { label: '25 min', minutes: 25 },
  { label: '30 min', minutes: 30 },
];

interface TimeSelectorProps {
  inputMinutes: string;
  setInputMinutes: (minutes: string) => void;
  setInputSeconds: (seconds: string) => void;
  onClose: () => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  inputMinutes,
  setInputMinutes,
  setInputSeconds,
  onClose
}) => {
  const handleTimeSelect = (minutes: number) => {
    setInputMinutes(minutes.toString());
    setInputSeconds('0');
    onClose();
  };
  
  return (
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
              onClick={() => handleTimeSelect(minutes)}
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
              const [_, minutes] = e.target.value.split(':');
              setInputMinutes(minutes);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={onClose}
            className="p-3 bg-gray-700 rounded text-white"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};