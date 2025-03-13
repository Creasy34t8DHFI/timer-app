// components/TankVisualization.tsx
import React, { memo } from 'react';

interface TankVisualizationProps {
  progress: number;
  segments: number;
  colorGradient?: boolean;
  showDividers?: boolean;
}

export const TankVisualization: React.FC<TankVisualizationProps> = memo(
  ({ progress, segments, colorGradient = false, showDividers = true }) => {
    // Gradient kolorów dla zbiornika
    const getColor = () => {
      if (!colorGradient) return '#10B981'; // zielony (green-500)
      
      // Oblicz kolor na podstawie procentu wypełnienia
      // Od zielonego przez żółty do czerwonego
      const hue = progress * 120; // 0 - czerwony, 120 - zielony
      return `hsl(${hue}, 70%, 45%)`;
    };
    
    return (
      <div className="w-full h-[70vh] bg-gray-800 relative overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 w-full" 
          style={{
            height: `${progress * 100}%`,
            backgroundColor: getColor(),
            transition: 'height 0.2s ease-out, background-color 0.5s ease'
          }} 
        />
        {showDividers && (
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
        )}
      </div>
    );
  }
);