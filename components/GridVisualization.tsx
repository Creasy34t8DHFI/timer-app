// components/GridVisualization.tsx
import React, { memo, useMemo } from 'react';

interface GridVisualizationProps {
  timeLeft: number;
  totalTime: number;
  getSegmentCount: () => number;
  getSegmentColor: (index: number, activeSegments: number, totalSegments: number) => string;
  colorGradient: boolean;
  showDividers: boolean;
  squareSegments: boolean;
  fullScreen: boolean;
}

export const GridVisualization: React.FC<GridVisualizationProps> = memo(
  ({ timeLeft, totalTime, getSegmentCount, getSegmentColor, colorGradient, showDividers, squareSegments, fullScreen }) => {
    // Określ podstawowy kolor zielony dla segmentów (kolor z Tailwind green-500)
    const baseGreenColor = '#10B981';
    const inactiveColor = '#1F2937'; // bg-gray-800
    
    // Oblicz liczbę segmentów i dodatkowe parametry układu
    const totalSegments = getSegmentCount();
    
    // Oblicz liczbę kolumn i wierszy
    const calculateLayout = () => {
      // Dla małej liczby segmentów staramy się zrobić kwadratową siatkę
      if (totalSegments <= 9) {
        return { cols: 3, rows: Math.ceil(totalSegments / 3) };
      }
      
      if (totalSegments <= 16) {
        return { cols: 4, rows: Math.ceil(totalSegments / 4) };
      }
      
      if (totalSegments <= 25) {
        return { cols: 5, rows: Math.ceil(totalSegments / 5) };
      }
      
      if (totalSegments <= 36) {
        return { cols: 6, rows: Math.ceil(totalSegments / 6) };
      }
      
      if (totalSegments <= 64) {
        return { cols: 8, rows: Math.ceil(totalSegments / 8) };
      }
      
      // Dla większej liczby segmentów, używamy proporcji ekranu
      const screenRatio = window.innerWidth / window.innerHeight;
      const estimatedCols = Math.ceil(Math.sqrt(totalSegments * screenRatio));
      
      return {
        cols: estimatedCols,
        rows: Math.ceil(totalSegments / estimatedCols)
      };
    };
    
    const { cols, rows } = useMemo(calculateLayout, [totalSegments]);
    
    // Oblicz czas na segment i aktywne segmenty
    const segmentDuration = totalTime / totalSegments;
    const activeSegments = Math.ceil(timeLeft / segmentDuration);
    
    // Oblicz kolor dla wszystkich aktywnych segmentów (gradient zależy od czasu)
    const timeProgress = 1 - (timeLeft / totalTime);
    let currentColor = baseGreenColor;
    
    if (colorGradient) {
      // Oblicz kolor na podstawie pozostałego czasu (nie na podstawie indeksu segmentu)
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
    
    // Funkcja do określania, czy segment jest aktywny
    const isSegmentActive = (position: number) => {
      return position < activeSegments;
    };
    
    // Tworzymy tablicę segmentów, wypełniając wiersze od dołu
    const segmentPositions = useMemo(() => {
      const positions = [];
      
      // Całkowita liczba wierszy
      const totalRows = rows;
      
      // Dla każdego wiersza (zaczynając od dołu)
      for (let row = totalRows - 1; row >= 0; row--) {
        // Liczba segmentów w wierszu (ostatni wiersz może być niepełny)
        const segmentsInRow = row === 0 
          ? totalSegments - (totalRows - 1) * cols 
          : cols;
        
        // Dla każdej kolumny w wierszu
        for (let col = 0; col < segmentsInRow; col++) {
          positions.push({
            row,
            col,
            position: (totalRows - 1 - row) * cols + col
          });
        }
      }
      
      return positions;
    }, [cols, rows, totalSegments]);
    
    // Oblicz wysokość kontenera
    const getContainerStyle = () => {
      const containerStyle: React.CSSProperties = {
        display: 'grid',
        gap: showDividers ? '2px' : '0px',
        width: '100%',
        height: fullScreen ? '100vh' : '70vh'
      };
      
      if (squareSegments) {
        // Dla kwadratowych segmentów, upewnij się, że cały grid mieści się na ekranie
        containerStyle.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        containerStyle.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
        containerStyle.aspectRatio = `${cols}/${rows}`;
        containerStyle.margin = '0 auto';
      } else {
        // Dla elastycznych segmentów, rozciągnij na całą dostępną przestrzeń
        containerStyle.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      }
      
      return containerStyle;
    };
    
    return (
      <div style={getContainerStyle()} className="mb-4">
        {segmentPositions.map(({ position }) => (
          <div
            key={position}
            style={{
              backgroundColor: isSegmentActive(position) ? currentColor : inactiveColor,
              aspectRatio: squareSegments ? '1/1' : 'auto',
              opacity: 1, // Usuwamy płynne wygaszanie - segmenty mają być albo włączone, albo wyłączone
              transition: 'background-color 0.3s ease'
            }}
            className={showDividers ? 'border border-black' : ''}
          />
        ))}
      </div>
    );
  }
);