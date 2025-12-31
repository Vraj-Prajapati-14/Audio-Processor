'use client';

import { useState, useEffect } from 'react';
import { Save, Download, Upload, Trash2, Star, StarOff } from 'lucide-react';
import { AudioEffects } from '@/lib/audio-utils';
import styles from './effects.module.css';

interface EffectPreset {
  id: string;
  name: string;
  effects: AudioEffects;
  isFavorite?: boolean;
  createdAt: number;
}

interface EffectPresetsProps {
  currentEffects: AudioEffects;
  onLoadPreset: (effects: AudioEffects) => void;
}

export default function EffectPresets({ currentEffects, onLoadPreset }: EffectPresetsProps) {
  const [presets, setPresets] = useState<EffectPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    // Load presets from localStorage
    const savedPresets = localStorage.getItem('audioEffectPresets');
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    }
  }, []);

  const savePresets = (newPresets: EffectPreset[]) => {
    setPresets(newPresets);
    localStorage.setItem('audioEffectPresets', JSON.stringify(newPresets));
  };

  const handleSave = () => {
    if (!presetName.trim()) return;

    const newPreset: EffectPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      effects: JSON.parse(JSON.stringify(currentEffects)), // Deep clone
      isFavorite: false,
      createdAt: Date.now(),
    };

    const updatedPresets = [...presets, newPreset];
    savePresets(updatedPresets);
    setPresetName('');
    setShowSaveDialog(false);
  };

  const handleLoad = (preset: EffectPreset) => {
    onLoadPreset(preset.effects);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      const updatedPresets = presets.filter((p) => p.id !== id);
      savePresets(updatedPresets);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updatedPresets = presets.map((p) =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    savePresets(updatedPresets);
  };

  const handleExport = (preset: EffectPreset) => {
    const dataStr = JSON.stringify(preset.effects, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${preset.name.replace(/\s+/g, '_')}_preset.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedEffects = JSON.parse(e.target?.result as string);
        const newPreset: EffectPreset = {
          id: Date.now().toString(),
          name: file.name.replace('.json', ''),
          effects: importedEffects,
          isFavorite: false,
          createdAt: Date.now(),
        };
        const updatedPresets = [...presets, newPreset];
        savePresets(updatedPresets);
      } catch (error) {
        alert('Failed to import preset. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const sortedPresets = [...presets].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className={styles.presetsContainer}>
      <div className={styles.presetsHeader}>
        <h3>Effect Presets</h3>
        <div className={styles.presetsActions}>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="btn btn-secondary btn-icon"
            title="Save current settings as preset"
          >
            <Save size={18} />
            Save Preset
          </button>
          <label className="btn btn-secondary btn-icon" title="Import preset from file">
            <Upload size={18} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {showSaveDialog && (
        <div className={styles.saveDialog}>
          <div className={styles.saveDialogContent}>
            <h4>Save Preset</h4>
            <input
              type="text"
              placeholder="Preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className={styles.presetNameInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setShowSaveDialog(false);
              }}
              autoFocus
            />
            <div className={styles.saveDialogActions}>
              <button onClick={handleSave} className="btn btn-primary" disabled={!presetName.trim()}>
                Save
              </button>
              <button onClick={() => setShowSaveDialog(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sortedPresets.length === 0 ? (
        <p className={styles.noPresets}>No presets saved. Save your current effect settings to create a preset.</p>
      ) : (
        <div className={styles.presetsList}>
          {sortedPresets.map((preset) => (
            <div key={preset.id} className={styles.presetItem}>
              <div className={styles.presetInfo}>
                <button
                  onClick={() => handleToggleFavorite(preset.id)}
                  className={styles.favoriteButton}
                  title={preset.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {preset.isFavorite ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                </button>
                <div className={styles.presetDetails}>
                  <span className={styles.presetName}>{preset.name}</span>
                  <span className={styles.presetDate}>
                    {new Date(preset.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className={styles.presetActions}>
                <button
                  onClick={() => handleLoad(preset)}
                  className="btn btn-primary btn-sm"
                  title="Load preset"
                >
                  Load
                </button>
                <button
                  onClick={() => handleExport(preset)}
                  className="btn btn-secondary btn-sm btn-icon"
                  title="Export preset"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="btn btn-secondary btn-sm btn-icon"
                  title="Delete preset"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

