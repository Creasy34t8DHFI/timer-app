// components/LineVisualization.tsx
import React, { memo } from 'react';

interface LineVisualizationProps {
  timeLeft: number;
  totalTime: number;
  getSegmentCount: () => number;
  getSegmentColor: (index: number, activeSegments: number, totalSegments: number) => string;
  colorGradient: boolean;
}

export const LineVisualization: React.FC<LineVisualizationProps> = memo(
  ({ timeLeft, totalTime, getSegmentCount, getSegmentColor, colorGradient }) => {
    const totalSegments = getSegmentCount();
    // Poprawiony sposób liczenia aktywnych segmentów
    const activeSegments = Math.ceil(timeLeft / (totalTime / totalSegments));
    
    return (
      <div className="mb-4 space-y-2 w-full h-[50vh] flex flex-col justify-end">
        <div className="h-6 bg-gray-800 relative flex w-full">
          {[...Array(totalSegments)].map((_, index) => (
            <div
              key={index}
              className="flex-1 border-r border-black"
              style={{
                backgroundColor: colorGradient 
                  ? getSegmentColor(index, activeSegments, totalSegments) 
                  : (index < activeSegments ? '#10B981' : '#1F2937')
              }}
            />
          ))}
        </div>
        <div className="text-gray-400 text-center text-sm">
          {Math.round((timeLeft / totalTime) * 100)}%
        </div>
      </div>
    );
  }
);