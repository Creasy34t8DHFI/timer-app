// components/GridVisualization.tsx
import React, { memo } from 'react';

interface GridVisualizationProps {
  timeLeft: number;
  totalTime: number;
  getSegmentCount: () => number;
  getSegmentColor: (index: number, activeSegments: number, totalSegments: number) => string;
  colorGradient: boolean;
  showDividers: boolean;
  squareSegments: boolean;
}

export const GridVisualization: React.FC<GridVisualizationProps> = memo(
  ({ timeLeft, totalTime, getSegmentCount, getSegmentColor, colorGradient, showDividers, squareSegments }) => {
    const totalSegments = getSegmentCount();
    
    // Oblicz ile kolumn będzie miała siatka
    const cols = totalSegments <= 10 ? totalSegments : 
                totalSegments <= 20 ? 10 : 
                Math.min(Math.ceil(Math.sqrt(totalSegments)), 12);
    
    // Oblicz liczbę aktywnych segmentów
    const segmentDuration = totalTime / totalSegments;
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
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: showDividers ? '2px' : '0px',
          height: '70vh',
          width: '100%',
          aspectRatio: squareSegments ? `${cols}/${Math.ceil(totalSegments/cols)}` : 'auto',
          margin: '0 auto'
        }} 
        className="mb-4"
      >
        {[...Array(totalSegments)].map((unused, index) => {
          // Odwracamy indeks, aby segmenty gasły od góry do dołu
          const reversedIndex = totalSegments - index - 1;
          
          return (
            <div
              key={reversedIndex}
              style={{
                backgroundColor: calculateSegmentColor(reversedIndex),
                opacity: calculateOpacity(reversedIndex),
                transition: 'opacity 0.5s ease-out',
                aspectRatio: squareSegments ? '1/1' : 'auto',
              }}
              className={showDividers ? 'border border-black' : ''}
            />
          );
        })}
      </div>
    );
  }
);