// components/ClockDisplay.tsx
import React, { memo } from 'react';

interface ClockDisplayProps {
  timeLeft: number;
  clockStyle: 'simple' | 'full' | 'combined';
}

export const ClockDisplay: React.FC<ClockDisplayProps> = memo(({ timeLeft, clockStyle }) => {
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
  
  if (clockStyle === 'simple') {
    return (
      <div className="text-red-600 text-7xl md:text-8xl font-mono mb-8">
        {formatTimeSimple()}
      </div>
    );
  }
  
  if (clockStyle === 'full') {
    return (
      <div className="text-red-600 text-7xl md:text-8xl font-mono mb-8">
        {formatTimeFull()}
      </div>
    );
  }
  
  // Combined style
  return (
    <div className="space-y-2 mb-8">
      <div className="text-red-600 text-7xl md:text-8xl font-mono">
        {formatTimeSimple()}
      </div>
      <div className="text-red-600 text-4xl md:text-5xl font-mono text-center">
        {formatTimeFull()}
      </div>
    </div>
  );
});