// components/TankVisualization.tsx
import React, { memo } from 'react';

interface TankVisualizationProps {
  progress: number;
  segments: number;
  colorGradient?: boolean;
  showDividers?: boolean;
  fullScreen?: boolean;
}

export const TankVisualization: React.FC<TankVisualizationProps> = memo(
  ({ progress, segments, colorGradient = false, showDividers = true, fullScreen = false }) => {
    // Gradient kolorów dla zbiornika
    const getColor = () => {
      if (!colorGradient) return '#10B981'; // zielony (green-500)
      
      // Oblicz kolor na podstawie procentu wypełnienia
      // Od zielonego przez żółty do czerwonego
      const timeProgress = 1 - progress;
      let h, s, l;
      
      if (timeProgress < 0.6) {
        // Zielony -> Żółto-zielony
        h = 120 - (timeProgress / 0.6) * 60;
        s = 70;
        l = 45;
      } else if (timeProgress < 0.8) {
        // Żółto-zielony -> Żółty
        h = 60 - ((timeProgress - 0.6) / 0.2) * 30;
        s = 80;
        l = 50;
      } else {
        // Żółty -> Czerwony
        h = 30 - ((timeProgress - 0.8) / 0.2) * 30;
        s = 90;
        l = 45;
      }
      
      return `hsl(${h}, ${s}%, ${l}%)`;
    };
    
    const containerHeight = fullScreen ? 'calc(100vh - 40px)' : '75vh';
    
    return (
      <div className="w-full bg-gray-800 relative overflow-hidden" style={{ height: containerHeight }}>
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