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

// Interfejs dla pozycji segmentu w siatce
interface SegmentPosition {
  index: number;
  gridColumnStart: number;
  gridRow: number;
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
    const isSegmentActive = (index: number) => {
      return index < activeSegments;
    };
    
    // Tworzymy tablicę segmentów, wypełniając wiersze od góry do dołu
    const segments = useMemo(() => {
      // Obliczamy, czy pierwszy wiersz będzie niepełny
      const firstRowElements = totalSegments % cols || cols;
      const firstRowSegments = Array(firstRowElements).fill(0).map((_, i) => i);
      
      // Tworzymy pozostałe segmenty, które zostaną wypełnione wiersz po wierszu
      const remainingSegments = Array(totalSegments - firstRowElements)
        .fill(0)
        .map((_, i) => i + firstRowElements);
      
      return { firstRowSegments, remainingSegments };
    }, [totalSegments, cols]);
    
    // Oblicz wysokość kontenera
    const getContainerStyle = () => {
      const containerStyle: React.CSSProperties = {
        display: 'grid',
        gap: showDividers ? '1px' : '0px',
        width: '100%',
        height: fullScreen ? 'calc(100vh - 40px)' : '75vh',
      };
      
      if (squareSegments) {
        // Dla kwadratowych segmentów
        containerStyle.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        // Oblicz liczbę wierszy potrzebnych do wyświetlenia wszystkich segmentów
        const neededRows = Math.ceil(totalSegments / cols);
        
        // Definiujemy wiersze - pierwszy może być niepełny
        const firstRowFr = segments.firstRowSegments.length / cols;
        const rowsTemplate = `${firstRowFr}fr`;
        
        if (neededRows > 1) {
          containerStyle.gridTemplateRows = `${rowsTemplate} repeat(${neededRows - 1}, 1fr)`;
        } else {
          containerStyle.gridTemplateRows = rowsTemplate;
        }
        
        // Ważne: dodajemy dodatkową właściwość, aby segmenty były kwadratowe
        containerStyle.aspectRatio = `${cols}/${neededRows}`;
        containerStyle.margin = '0 auto';
      } else {
        // Dla elastycznych segmentów
        containerStyle.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      }
      
      return containerStyle;
    };
    
    // Generujemy układ siatki
    const gridLayout = useMemo(() => {
      const layout: SegmentPosition[] = [];
      
      // Pierwszy wiersz (może być niepełny)
      segments.firstRowSegments.forEach((index) => {
        layout.push({
          index,
          gridColumnStart: index % cols + 1,
          gridRow: 1
        });
      });
      
      // Pozostałe wiersze (pełne)
      segments.remainingSegments.forEach((index, i) => {
        const row = Math.floor(i / cols) + 2; // +2 bo pierwszy wiersz już zajęty
        const col = (i % cols) + 1;
        
        layout.push({
          index,
          gridColumnStart: col,
          gridRow: row
        });
      });
      
      return layout;
    }, [segments, cols]);
    
    return (
      <div style={getContainerStyle()} className="mb-4">
        {gridLayout.map(({ index, gridColumnStart, gridRow }) => (
          <div
            key={index}
            style={{
              backgroundColor: isSegmentActive(index) ? currentColor : inactiveColor,
              gridColumnStart,
              gridRow,
              transition: 'background-color 0.3s ease'
            }}
            className={showDividers ? 'border border-black' : ''}
          />
        ))}
      </div>
    );
  }
);