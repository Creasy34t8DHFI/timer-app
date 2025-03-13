// hooks/useAlarm.ts
import { useState, useEffect, useRef } from 'react';

export interface AlarmSettings {
  vibration: boolean;
  vibrationDuration: number;
  vibrationPattern: 'short' | 'medium' | 'long' | 'double' | 'sos';
  sound: boolean;
  soundFile: string | null;
  flash: boolean;
  flashDuration: number;
}

interface UseAlarmOptions {
  onFlashStateChange?: (isFlashing: boolean) => void;
  flashSpeed?: number;
}

export const useAlarm = (options: UseAlarmOptions = {}) => {
  const [settings, setSettings] = useState<AlarmSettings>({
    vibration: false,
    vibrationDuration: 1000,
    vibrationPattern: 'medium',
    sound: false,
    soundFile: null,
    flash: true,
    flashDuration: 5000
  });
  
  const [isFlashing, setIsFlashing] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const flashIntervalRef = useRef<number | null>(null);
  
  // Powiadamiaj o zmianie stanu migania
  useEffect(() => {
    options.onFlashStateChange?.(isFlashing);
  }, [isFlashing, options]);
  
  // Uzyskaj odpowiedni wzór wibracji na podstawie wybranego ustawienia
  const getVibrationPattern = () => {
    switch(settings.vibrationPattern) {
      case 'short':
        return [300];
      case 'medium':
        return [500];
      case 'long':
        return [1000];
      case 'double':
        return [300, 200, 300];
      case 'sos':
        return [200, 100, 200, 100, 200, 300, 500, 300, 500, 300, 200, 100, 200, 100, 200];
      default:
        return [settings.vibrationDuration];
    }
  };
  
  // Funkcja do wyzwalania alarmu wibracji
  const triggerVibration = () => {
    if (settings.vibration && 'vibrate' in navigator) {
      const pattern = getVibrationPattern();
      navigator.vibrate(pattern);
      
      // Powtórz wibrację kilka razy, aby była bardziej zauważalna
      let repeatCount = 0;
      const maxRepeats = 5;
      
      const vibrateInterval = setInterval(() => {
        if (repeatCount < maxRepeats) {
          navigator.vibrate(pattern);
          repeatCount++;
        } else {
          clearInterval(vibrateInterval);
        }
      }, 1500);
      
      return () => clearInterval(vibrateInterval);
    }
    return () => {};
  };
  
  // Funkcja do wyzwalania alarmu migania
  const triggerFlash = () => {
    if (settings.flash) {
      setIsFlashing(true);
      
      // Użyj podanej prędkości migania lub domyślnej wartości 500ms
      const flashSpeed = options.flashSpeed || 500;
      
      // Zatrzymaj poprzedni interwał, jeśli istnieje
      if (flashIntervalRef.current !== null) {
        clearInterval(flashIntervalRef.current);
      }
      
      // Utwórz nowy interwał migania
      flashIntervalRef.current = window.setInterval(() => {
        setIsFlashing(prev => !prev);
      }, flashSpeed) as unknown as number;
      
      // Zatrzymaj miganie po określonym czasie
      setTimeout(() => {
        if (flashIntervalRef.current !== null) {
          clearInterval(flashIntervalRef.current);
          flashIntervalRef.current = null;
        }
        setIsFlashing(false);
      }, settings.flashDuration);
      
      return () => {
        if (flashIntervalRef.current !== null) {
          clearInterval(flashIntervalRef.current);
          flashIntervalRef.current = null;
        }
        setIsFlashing(false);
      };
    }
    return () => {};
  };
  
  // Funkcja do wyzwalania alarmu dźwiękowego
  const triggerSound = () => {
    if (settings.sound && settings.soundFile) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.error("Błąd odtwarzania dźwięku:", e));
        }
      } else {
        const newAudio = new Audio(settings.soundFile);
        newAudio.loop = true;
        const playPromise = newAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.error("Błąd odtwarzania dźwięku:", e));
        }
        setAudio(newAudio);
        
        // Zatrzymaj dźwięk po określonym czasie
        setTimeout(() => {
          newAudio.pause();
          newAudio.currentTime = 0;
        }, settings.flashDuration);
      }
      
      return () => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      };
    }
    return () => {};
  };
  
  // Funkcja do wyzwalania wszystkich alarmów
  const triggerAlarm = () => {
    const stopVibration = triggerVibration();
    const stopFlash = triggerFlash();
    const stopSound = triggerSound();
    
    return () => {
      stopVibration();
      stopFlash();
      stopSound();
    };
  };
  
  // Funkcja do zmiany ustawień alarmu
  const updateSettings = (newSettings: Partial<AlarmSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  // Funkcja do obsługi zmiany pliku dźwiękowego
  const handleSoundFileChange = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      updateSettings({ soundFile: url, sound: true });
    }
  };
  
  // Posprzątaj zasoby przy odmontowywaniu
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      
      if (flashIntervalRef.current !== null) {
        clearInterval(flashIntervalRef.current);
        flashIntervalRef.current = null;
      }
      
      if (settings.soundFile && settings.soundFile.startsWith('blob:')) {
        URL.revokeObjectURL(settings.soundFile);
      }
      
      if ('vibrate' in navigator) {
        navigator.vibrate(0); // Zatrzymaj wszystkie wibracje
      }
    };
  }, [audio, settings.soundFile]);
  
  return {
    settings,
    isFlashing,
    updateSettings,
    handleSoundFileChange,
    triggerAlarm
  };
};