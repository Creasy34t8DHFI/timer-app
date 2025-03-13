// components/SideMenu.tsx
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AlarmSettings as AlarmSettingsComponent } from './AlarmSettings';
import { AlarmSettings } from '../hooks/useAlarm';

const SEGMENT_OPTIONS = [50, 100, 150];

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  clockStyle: 'simple' | 'full' | 'combined';
  setClockStyle: (style: 'simple' | 'full' | 'combined') => void;
  visualizationType: 'grid' | 'line' | 'tank';
  setVisualizationType: (type: 'grid' | 'line' | 'tank') => void;
  scaleType: 'minutes' | 'seconds' | 'custom';
  setScaleType: (type: 'minutes' | 'seconds' | 'custom') => void;
  segmentCount: number;
  setSegmentCount: (count: number) => void;
  customSegments: string;
  setCustomSegments: (value: string) => void;
  colorGradient: boolean;
  setColorGradient: (enabled: boolean) => void;
  alarmSettings: AlarmSettings;
  onAlarmSettingsChange: (settings: Partial<AlarmSettings>) => void;
  onSoundFileChange: (file: File | null) => void;
  onRepeatLastTimer: (e: React.MouseEvent) => void;
  onReset: (e: React.MouseEvent) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  clockStyle,
  setClockStyle,
  visualizationType,
  setVisualizationType,
  scaleType,
  setScaleType,
  segmentCount,
  setSegmentCount,
  customSegments,
  setCustomSegments,
  colorGradient,
  setColorGradient,
  alarmSettings,
  onAlarmSettingsChange,
  onSoundFileChange,
  onRepeatLastTimer,
  onReset
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Zatrzymanie propagacji zdarzeń w menu
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Obsługa zmiany liczby segmentów
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value || '0');
      if (numValue <= 500) {
        setCustomSegments(value);
        if (numValue > 0) {
          setSegmentCount(numValue);
          setScaleType('custom');
        }
      }
    }
  };

  return (
    <div 
      ref={menuRef}
      className={`fixed top-0 right-0 h-full w-72 bg-gray-900 transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      onClick={handleMenuClick}
    >
      <div className="h-full overflow-y-auto">
        <div className="p-6 pb-24">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 p-2"
          >
            <X size={24} />
          </button>
          
          <div className="space-y-6 mt-16">
            {/* Sekcja Wygląd */}
            <div>
              <h3 className="text-gray-400 font-medium mb-4">Wygląd</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 mb-2">Styl zegara:</p>
                  <button
                    onClick={() => setClockStyle('simple')}
                    className={`block w-full text-left p-3 rounded ${
                      clockStyle === 'simple' ? 'bg-gray-700' : 'text-gray-400'
                    }`}
                  >
                    Prosty (mm:ss)
                  </button>
                  <button
                    onClick={() => setClockStyle('full')}
                    className={`block w-full text-left p-3 rounded mt-2 ${
                      clockStyle === 'full' ? 'bg-gray-700' : 'text-gray-400'
                    }`}
                  >
                    Pełny (hh:mm:ss)
                  </button>
                  <button
                    onClick={() => setClockStyle('combined')}
                    className={`block w-full text-left p-3 rounded mt-2 ${
                      clockStyle === 'combined' ? 'bg-gray-700' : 'text-gray-400'
                    }`}
                  >
                    Połączony
                  </button>
                </div>

                <div>
                  <p className="text-gray-400 mb-2">Wizualizacja:</p>
                  <button
                    onClick={() => setVisualizationType('grid')}
                    className={`block w-full text-left p-3 rounded ${
                      visualizationType === 'grid' ? 'bg-gray-700' : 'text-gray-400'
                    }`}
                  >
                    Siatka
                  </button>
                  <button
                    onClick={() => setVisualizationType('line')}
                    className={`block w-full text-left p-3 rounded mt-2 ${
                      visualizationType === 'line' ? 'bg-gray-700' : 'text-gray-400'
                    }`}
                  >
                    Oś czasu
                  </button>
                  <button
                    onClick={() => setVisualizationType('tank')}
                    className={`block w-full text-left p-3 rounded mt-2 ${
                      visualizationType === 'tank' ? 'bg-gray-700' : 'text-gray-400'
                    }`}
                  >
                    Zbiornik
                  </button>
                </div>

                <div>
                  <p className="text-gray-400 mb-2">Podziałka:</p>
                  <button
                    onClick={() => setScaleType('minutes')}
                    className={`block w-full text-left p-3 rounded ${
                      scaleType === 'minutes' ? 'bg-gray-700' : 'text-gray-400'
                    }`}
                  >
                    Minutowa
                  </button>
                  <button
                    onClick={() => setScaleType('seconds')}
                    className={`block w-full text-left p-3 rounded mt-2 ${
                      scaleType === 'seconds' ? 'bg-gray-700' : 'text-gray-400'
                    }`}
                  >
                    Sekundowa
                  </button>
                  {SEGMENT_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setScaleType('custom');
                        setSegmentCount(option);
                        setCustomSegments(option.toString());
                      }}
                      className={`block w-full text-left p-3 rounded mt-2 ${
                        scaleType === 'custom' && segmentCount === option ? 'bg-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {option} segmentów
                    </button>
                  ))}
                  <div className="mt-2 relative">
                    <input
                      type="number"
                      placeholder="Własna wartość"
                      className="w-full p-3 rounded bg-gray-800 text-white"
                      value={customSegments}
                      onChange={handleInputChange}
                      min="1"
                      max="500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={colorGradient}
                      onChange={(e) => {
                        e.stopPropagation();
                        setColorGradient(e.target.checked);
                      }}
                      className="rounded bg-gray-800"
                    />
                    <span className="text-gray-400">Kolorowy gradient</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sekcja Alarmy */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-gray-400 font-medium mb-4">Alarmy</h3>
              
              <AlarmSettingsComponent 
                settings={alarmSettings}
                onSettingsChange={onAlarmSettingsChange}
                onSoundFileChange={onSoundFileChange}
              />
            </div>

            {/* Sekcja Akcje */}
            <div className="border-t border-gray-700 pt-6">
              <button
                onClick={onRepeatLastTimer}
                className="w-full p-4 bg-gray-800 text-gray-400 rounded mb-2"
              >
                Powtórz ostatni timer
              </button>
              <button
                onClick={onReset}
                className="w-full p-4 bg-gray-800 text-gray-400 rounded"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};