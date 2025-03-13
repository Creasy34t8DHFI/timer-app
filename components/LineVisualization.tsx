// components/LineVisualization.tsx
import React, { memo } from 'react';

interface LineVisualizationProps {
  timeLeft: number;
  totalTime: number;
  getSegmentCount: () => number;
  getSegmentColor: (index: number, activeSegments: number, totalSegments: number) => string;
  colorGradient: boolean;
  showDividers: boolean;
}

export const LineVisualization: React.FC<LineVisualizationProps> = memo(
  ({ timeLeft, totalTime, getSegmentCount, getSegmentColor, colorGradient, showDividers }) => {
    const totalSegments = getSegmentCount();
    
    // Oblicz czas trwania jednego segmentu
    const segmentDuration = totalTime / totalSegments;
    
    // Oblicz liczbę aktywnych segmentów
    const activeSegments = Math.ceil(timeLeft / segmentDuration);
    
    // Oblicz progres dla płynnego wygaszania segmentów
    const currentSegmentProgress = 1 - ((timeLeft % segmentDuration) / segmentDuration);
    
    // Określ podstawowy kolor zielony dla segmentów (kolor z Tailwind green-500)
    const baseGreenColor = '#10B981';
    const inactiveColor = '#1F2937'; // bg-gray-800
    
    // Funkcja do obliczania koloru segmentu
    const calculateSegmentColor = (index: number) => {
      // Jeśli segment jest nieaktywny (już wygaszony)
      if (index >= activeSegments) {
        return inactiveColor;
      }
      
      // Jeśli gradient jest włączony, użyj funkcji getSegmentColor dla aktywnych segmentów
      if (colorGradient) {
        return getSegmentColor(activeSegments - index - 1, activeSegments, totalSegments);
      }
      
      // Domyślnie użyj zielonego koloru dla aktywnych segmentów
      return baseGreenColor;
    };
    
    // Funkcja do obliczania opacity dla płynnego wygaszania
    const calculateOpacity = (index: number) => {
      if (index < activeSegments - 1) {
        return 1; // Pełna nieprzezroczystość dla w pełni aktywnych segmentów
      }
      
      if (index === activeSegments - 1) {
        return 1 - currentSegmentProgress; // Płynne wygaszanie dla aktualnie gasnącego segmentu
      }
      
      return 0; // Pełna przezroczystość dla wygaszonych segmentów
    };
    
    return (
      <div className="mb-4 w-full h-[70vh] flex flex-col items-center justify-center">
        <div className="h-20 bg-gray-800 relative flex w-full">
          {[...Array(totalSegments)].map((_, index) => {
            // Odwracamy indeks, aby segmenty gasły od lewej do prawej
            const reversedIndex = totalSegments - index - 1;
            
            return (
              <div
                key={reversedIndex}
                className={showDividers ? "flex-1 border-r border-black" : "flex-1"}
                style={{
                  backgroundColor: calculateSegmentColor(reversedIndex),
                  opacity: calculateOpacity(reversedIndex),
                  transition: 'opacity 0.5s ease-out'
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