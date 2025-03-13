// components/GridVisualization.tsx
import React, { memo } from 'react';

interface GridVisualizationProps {
  timeLeft: number;
  totalTime: number;
  getSegmentCount: () => number;
  getSegmentColor: (index: number, activeSegments: number, totalSegments: number) => string;
  colorGradient: boolean;
}

export const GridVisualization: React.FC<GridVisualizationProps> = memo(
  ({ timeLeft, totalTime, getSegmentCount, getSegmentColor, colorGradient }) => {
    const totalSegments = getSegmentCount();
    const cols = totalSegments <= 10 ? totalSegments : 
                totalSegments <= 20 ? 10 : 
                Math.min(Math.ceil(Math.sqrt(totalSegments)), 12);
    
    // Poprawiony sposób liczenia aktywnych segmentów
    const activeSegments = Math.ceil(timeLeft / (totalTime / totalSegments));
    
    return (
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '2px',
          height: '50vh',
        }} 
        className="w-full mb-4"
      >
        {[...Array(totalSegments)].map((unused, index) => (
          <div
            key={index}
            style={{
              backgroundColor: colorGradient 
                ? getSegmentColor(index, activeSegments, totalSegments) 
                : (index < activeSegments ? '#10B981' : '#1F2937')
            }}
          />
        ))}
      </div>
    );
  }
);