// components/TankVisualization.tsx
import React from 'react';

interface TankVisualizationProps {
  progress: number;
  segments: number;
}

export const TankVisualization: React.FC<TankVisualizationProps> = ({ progress, segments }) => {
  const activeSegments = Math.ceil((1 - progress) * segments);
  
  return (
    <div className="w-full h-[50vh] bg-gray-800 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full bg-green-500" style={{
        height: `${(activeSegments / segments) * 100}%`,
        transition: 'height 0.2s ease-out'
      }} />
      <div className="absolute top-0 left-0 w-full h-full flex flex-col">
        {[...Array(segments)].map((_, index) => (
          <div
            key={index}
            className="w-full flex-1 border-b border-black"
            style={{
              height: `${100/segments}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};