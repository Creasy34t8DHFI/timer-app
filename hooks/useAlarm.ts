// hooks/useAlarm.ts
import { useState, useEffect } from 'react';

export interface AlarmSettings {
  vibration: boolean;
  vibrationDuration: number;
  sound: boolean;
  soundFile: string | null;
  flash: boolean;
  flashDuration: number;
}

interface UseAlarmOptions {
  onFlashStateChange?: (isFlashing: boolean) => void;
}

export const useAlarm = (options: UseAlarmOptions = {}) => {
  const [settings, setSettings] = useState<AlarmSettings>({
    vibration: true,
    vibrationDuration: 1000,
    sound: false,
    soundFile: null,
    flash: false,
    flashDuration: 3000
  });
  
  const [isFlashing, setIsFlashing] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  // Powiadamiaj o zmianie stanu migania
  useEffect(() => {
    options.onFlashStateChange?.(isFlashing);
  }, [isFlashing, options]);
  
  // Funkcja do wyzwalania alarmu
  const triggerAlarm = () => {
    if (settings.vibration && 'vibrate' in navigator) {
      navigator.vibrate([settings.vibrationDuration]);
    }
    
    if (settings.flash) {
      setIsFlashing(true);
      const flashInterval = setInterval(() => {
        setIsFlashing(prev => !prev);
      }, 1000);
      
      setTimeout(() => {
        clearInterval(flashInterval);
        setIsFlashing(false);
      }, settings.flashDuration);
    }
    
    if (settings.sound && settings.soundFile) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        const newAudio = new Audio(settings.soundFile);
        setAudio(newAudio);
        newAudio.play().catch(console.error);
      }
    }
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
      
      if (settings.soundFile && settings.soundFile.startsWith('blob:')) {
        URL.revokeObjectURL(settings.soundFile);
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