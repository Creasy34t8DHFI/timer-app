// hooks/useCountdown.ts
import { useEffect, useRef, useState } from 'react';

interface CountdownState {
  isRunning: boolean;
  remaining: number;
  progress: number;
}

export const useCountdown = () => {
  const [state, setState] = useState<CountdownState>({
    isRunning: false,
    remaining: 0,
    progress: 0
  });
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof Window !== 'undefined') {
      workerRef.current = new Worker('/timer.worker.js');

      workerRef.current.onmessage = (e) => {
        const { type, payload } = e.data;
        
        switch (type) {
          case 'TICK':
            setState(prev => ({
              ...prev,
              remaining: payload.remaining,
              progress: payload.progress
            }));
            break;
          case 'FINISHED':
            setState(prev => ({
              ...prev,
              isRunning: false,
              remaining: 0,
              progress: 1
            }));
            // Tu możemy wywołać callback z alarmu
            break;
        }
      };
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const startTimer = (duration: number, useTarget = false, targetTime?: number) => {
    if (!workerRef.current) return;
    
    setState(prev => ({ ...prev, isRunning: true }));
    workerRef.current.postMessage({
      type: 'START',
      payload: {
        duration,
        useTarget,
        targetTime: targetTime || null
      }
    });
  };

  const stopTimer = () => {
    if (!workerRef.current) return;
    
    setState(prev => ({ ...prev, isRunning: false }));
    workerRef.current.postMessage({ type: 'STOP' });
  };

  const resetTimer = () => {
    if (!workerRef.current) return;
    
    setState({
      isRunning: false,
      remaining: 0,
      progress: 0
    });
    workerRef.current.postMessage({ type: 'RESET' });
  };

  return {
    ...state,
    startTimer,
    stopTimer,
    resetTimer
  };
};