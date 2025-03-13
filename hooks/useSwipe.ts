// hooks/useSwipe.ts
import { useEffect, RefObject } from 'react';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export const useSwipe = (
  elementRef: RefObject<HTMLElement | null>,
  options: SwipeOptions = {}
) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const threshold = options.threshold || 50; // Minimalna odległość przesunięcia w pikselach
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Sprawdź, czy przesunięcie było głównie w poziomie czy w pionie
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Przesunięcie poziome
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0) {
            // Przesunięcie w lewo
            options.onSwipeLeft?.();
          } else {
            // Przesunięcie w prawo
            options.onSwipeRight?.();
          }
        }
      } else {
        // Przesunięcie pionowe
        if (Math.abs(diffY) > threshold) {
          if (diffY > 0) {
            // Przesunięcie w górę
            options.onSwipeUp?.();
          } else {
            // Przesunięcie w dół
            options.onSwipeDown?.();
          }
        }
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, options]);
};