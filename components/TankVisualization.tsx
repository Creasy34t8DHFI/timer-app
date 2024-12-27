// components/TankVisualization.tsx
import React from 'react';

interface TankVisualizationProps {
  progress: number;
  segments: number;
}

export const TankVisualization: React.FC<TankVisualizationProps> = ({ progress, segments }) => {
  return (
    <div className="w-full h-[75vh] bg-green-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full flex flex-col">
        {[...Array(segments)].map((_, index) => {
          const segmentProgress = index / segments;
          const isInactive = segmentProgress < progress;
          
          return (
            <div
              key={index}
              className={`w-full flex-1 border-b border-black transition-colors duration-200 ${
                isInactive ? 'bg-gray-800' : 'bg-green-500'
              }`}
              style={{
                height: `${100/segments}%`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};