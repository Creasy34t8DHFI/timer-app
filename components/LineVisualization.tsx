// components/LineVisualization.tsx
import React, { memo } from 'react';

interface LineVisualizationProps {
  timeLeft: number;
  totalTime: number;
  getSegmentCount: () => number;
  getSegmentColor: (index: number, activeSegments: number, totalSegments: number) => string;
  colorGradient: boolean;
  showDividers: boolean;
  fullScreen: boolean;
}

export const LineVisualization: React.FC<LineVisualizationProps> = memo(
  ({ timeLeft, totalTime, getSegmentCount, getSegmentColor, colorGradient, showDividers, fullScreen }) => {
    const totalSegments = getSegmentCount();
    
    // Oblicz czas na segment i aktywne segmenty
    const segmentDuration = totalTime / totalSegments;
    const activeSegments = Math.ceil(timeLeft / segmentDuration);
    
    // Oblicz kolor dla wszystkich aktywnych segmentów (gradient zależy od czasu)
    const timeProgress = 1 - (timeLeft / totalTime);
    
    // Określ podstawowy kolor zielony dla segmentów (kolor z Tailwind green-500)
    const baseGreenColor = '#10B981';
    const inactiveColor = '#1F2937'; // bg-gray-800
    
    // Oblicz kolor na podstawie pozostałego czasu (nie na podstawie indeksu segmentu)
    let currentColor = baseGreenColor;
    
    if (colorGradient) {
      // Od zielonego (początek) do czerwonego (koniec)
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
      
      currentColor = `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    // Wysokość komponentu w zależności od trybu pełnoekranowego
    const containerHeight = fullScreen ? '100vh' : '70vh';
    
    return (
      <div className={`mb-4 w-full flex flex-col items-center justify-center`} style={{ height: containerHeight }}>
        <div className="h-20 bg-gray-800 relative flex w-full">
          {[...Array(totalSegments)].map((_, index) => {
            // Używamy odwróconego indeksu, aby segmenty gasły od lewej do prawej
            const isActive = index < activeSegments;
            
            return (
              <div
                key={index}
                className={showDividers ? "flex-1 border-r border-black" : "flex-1"}
                style={{
                  backgroundColor: isActive ? currentColor : inactiveColor,
                  transition: 'background-color 0.3s ease'
                }}
              />
            );
          })}
        </div>
        <div className="text-gray-400 text-center text-sm mt-2">
          {Math.round((timeLeft / totalTime) * 100)}%
        </div>
      </div>
    );
  }
);