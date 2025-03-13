// components/AlarmSettings.tsx
import React from 'react';
import { AlarmSettings as AlarmSettingsType } from '../hooks/useAlarm';

interface AlarmSettingsProps {
  settings: AlarmSettingsType;
  onSettingsChange: (settings: Partial<AlarmSettingsType>) => void;
  onSoundFileChange: (file: File | null) => void;
}

export const AlarmSettings: React.FC<AlarmSettingsProps> = ({ 
  settings, 
  onSettingsChange,
  onSoundFileChange
}) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files?.[0] || null;
    onSoundFileChange(file);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.vibration}
            onChange={(e) => {
              e.stopPropagation();
              onSettingsChange({ vibration: e.target.checked });
            }}
            className="rounded bg-gray-800"
          />
          <span className="text-gray-400">Wibracje</span>
        </label>
        {settings.vibration && (
          <input
            type="number"
            placeholder="Czas wibracji (ms)"
            className="mt-2 w-full p-3 rounded bg-gray-800 text-white"
            value={settings.vibrationDuration}
            onChange={(e) => {
              e.stopPropagation();
              onSettingsChange({ 
                vibrationDuration: parseInt(e.target.value) || 1000 
              });
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => {
              e.stopPropagation();
              onSettingsChange({ sound: e.target.checked });
            }}
            className="rounded bg-gray-800"
          />
          <span className="text-gray-400">Dźwięk</span>
        </label>
        {settings.sound && (
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="mt-2 w-full p-3 rounded bg-gray-800 text-white"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.flash}
            onChange={(e) => {
              e.stopPropagation();
              onSettingsChange({ flash: e.target.checked });
            }}
            className="rounded bg-gray-800"
          />
          <span className="text-gray-400">Lampa błyskowa</span>
        </label>
        {settings.flash && (
          <input
            type="number"
            placeholder="Czas błysku (ms)"
            className="mt-2 w-full p-3 rounded bg-gray-800 text-white"
            value={settings.flashDuration}
            onChange={(e) => {
              e.stopPropagation();
              onSettingsChange({ 
                flashDuration: parseInt(e.target.value) || 3000 
              });
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
};