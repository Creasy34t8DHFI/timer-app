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
          <div className="mt-2">
            <label className="text-gray-400 text-sm block mb-1">Intensywność wibracji:</label>
            <select
              className="w-full p-3 rounded bg-gray-800 text-white"
              value={settings.vibrationPattern || 'medium'}
              onChange={(e) => {
                e.stopPropagation();
                // Ponieważ wartości select zgadzają się z typem, możemy rzutować
                const value = e.target.value as 'short' | 'medium' | 'long' | 'double' | 'sos';
                onSettingsChange({ 
                  vibrationPattern: value
                });
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="short">Krótkie</option>
              <option value="medium">Średnie</option>
              <option value="long">Długie</option>
              <option value="double">Podwójne</option>
              <option value="sos">SOS</option>
            </select>
          </div>
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