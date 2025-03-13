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
    
    // Tworzymy tablicę segmentów z pozycjami w siatce
    const gridPositions = useMemo(() => {
      const positions: {row: number, col: number, globalIndex: number}[] = [];
      let globalIndex = 0;
      
      // Pierwszy wiersz może być niepełny
      const firstRowElements = totalSegments % cols || cols;
      const firstRowOffset = cols - firstRowElements; // Offset dla wyrównania do prawej
      
      // Pierwszy wiersz
      for (let col = 0; col < firstRowElements; col++) {
        positions.push({
          row: 0,
          col: firstRowOffset + col,
          globalIndex: globalIndex++
        });
      }
      
      // Pozostałe wiersze
      const remainingElements = totalSegments - firstRowElements;
      const fullRows = Math.ceil(remainingElements / cols);
      
      for (let row = 1; row <= fullRows; row++) {
        for (let col = 0; col < cols; col++) {
          if (globalIndex < totalSegments) {
            positions.push({
              row,
              col,
              globalIndex: globalIndex++
            });
          }
        }
      }
      
      return positions;
    }, [totalSegments, cols]);
    
    // Oblicz wysokość kontenera
    const getContainerStyle = () => {
      const containerStyle: React.CSSProperties = {
        display: 'grid',
        gap: showDividers ? '1px' : '0px',
        width: '100%',
        height: fullScreen ? 'calc(100vh - 40px)' : '75vh',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      };
      
      if (squareSegments) {
        // Definiujemy wiersze
        const neededRows = Math.ceil(totalSegments / cols);
        containerStyle.gridTemplateRows = `repeat(${neededRows}, 1fr)`;
        
        // Ważne: dodajemy dodatkową właściwość, aby segmenty były kwadratowe
        containerStyle.aspectRatio = `${cols}/${neededRows}`;
        containerStyle.margin = '0 auto';
      }
      
      return containerStyle;
    };
    
    // Funkcja do określania, czy segment jest aktywny
    const isSegmentActive = (position: {row: number, col: number, globalIndex: number}) => {
      // Segmenty wygasają od góry do dołu, a w obrębie wiersza od lewej do prawej
      // Porządek obliczamy na podstawie pozycji (row, col)
      
      // Dla jasności obliczamy "wartość porządkową" dla każdej pozycji (mniejsza wartość = wygasa wcześniej)
      // Pierwszy wiersz (row=0) ma wartości od 0 do (firstRowElements - 1)
      // Drugi wiersz (row=1) ma wartości od firstRowElements do (firstRowElements + cols - 1)
      // itd.
      
      const orderValue = position.row * cols + position.col;
      
      // Teraz porównujemy wartość porządkową z liczbą nieaktywnych segmentów
      // Im większa wartość orderValue, tym później segment powinien wygasnąć
      const inactiveSegments = totalSegments - activeSegments;
      
      return orderValue >= inactiveSegments;
    };
    
    return (
      <div style={getContainerStyle()} className="mb-4">
        {gridPositions.map((position) => (
          <div
            key={position.globalIndex}
            style={{
              backgroundColor: isSegmentActive(position) ? currentColor : inactiveColor,
              gridColumnStart: position.col + 1, // +1 bo grid zaczyna się od 1
              gridRow: position.row + 1, // +1 bo grid zaczyna się od 1
              transition: 'background-color 0.3s ease'
            }}
            className={showDividers ? 'border border-black' : ''}
          />
        ))}
      </div>
    );
  }
);