'use client';

import { useState } from 'react';
import { Music } from 'lucide-react';
import { LoFiGeneratorSettings, generateLofiTuneAudio } from '@/lib/lofi-generator';
import { audioBufferToWav } from '@/lib/audio-utils';
import styles from './LofiGeneratorTab.module.css';

interface LofiGeneratorTabProps {
  onGenerateComplete: (url: string, title: string) => void;
  onError: (error: string) => void;
  onProcessingChange?: (isProcessing: boolean, message?: string) => void;
}

export default function LofiGeneratorTab({
  onGenerateComplete,
  onError,
  onProcessingChange,
}: LofiGeneratorTabProps) {
  const [settings, setSettings] = useState<LoFiGeneratorSettings>({
    duration: 7200, // 2 hours default
    bpm: 80,
    key: 'C',
    scale: 'minor',
    style: 'chill',
  });

  const [customDuration, setCustomDuration] = useState('');
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [variationLevel, setVariationLevel] = useState<'low' | 'medium' | 'high' | 'extreme'>('high');

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const styles_presets = ['ambient', 'chill', 'jazz', 'study'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    onProcessingChange?.(true, 'Generating Lo-Fi tune...');

    try {
      // Calculate final duration
      let finalDuration = settings.duration;
      if (useCustomDuration && customDuration) {
        const custom = parseFloat(customDuration);
        if (custom > 0 && custom <= 86400) { // Max 24 hours
          finalDuration = custom;
        } else {
          onError('Custom duration must be between 1 second and 86400 seconds (24 hours)');
          setIsGenerating(false);
          onProcessingChange?.(false);
          return;
        }
      }

      // Generate the complete Lo-Fi tune with variation
      const audioBuffer = await generateLofiTuneAudio(
        { ...settings, duration: finalDuration },
        variationLevel,
        (prog: number) => {
          setProgress(prog);
          onProcessingChange?.(true, `Generating Lo-Fi tune... ${Math.floor(prog)}%`);
        }
      );

      // Convert to WAV and create URL
      const wavBlob = audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      // Create descriptive title
      const hours = Math.floor(finalDuration / 3600);
      const minutes = Math.floor((finalDuration % 3600) / 60);
      let durationText = '';
      if (hours > 0) {
        durationText = `${hours} Hour${hours > 1 ? 's' : ''}`;
        if (minutes > 0) {
          durationText += ` ${minutes} Min${minutes > 1 ? 's' : ''}`;
        }
      } else {
        durationText = `${minutes} Minute${minutes > 1 ? 's' : ''}`;
      }
      const scaleText = settings.scale === 'major' ? 'Major' : 'Minor';
      const title = `Generated ${durationText} ${settings.style.charAt(0).toUpperCase() + settings.style.slice(1)} ${scaleText} Lo-Fi Music (${settings.key} Key, ${settings.bpm} BPM, ${variationLevel} variation)`;
      
      onGenerateComplete(url, title);
      setProgress(100);
      
    } catch (error) {
      console.error('Error generating tune:', error);
      onError('Error generating Lo-Fi tune. This may take a while for longer tracks.');
    } finally {
      setIsGenerating(false);
      onProcessingChange?.(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className={styles.generatorSection}>
      <h3>Lo-Fi Tune Generator</h3>
      <p className={styles.generatorDescription}>
        Generate seamless 2-4 hour Lo-Fi tracks automatically. Perfect for background music, studying, or relaxing.
      </p>

      <div className={styles.generatorSettings}>
        <div className={styles.settingGroup}>
          <label>Duration</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select
              value={useCustomDuration ? 'custom' : settings.duration.toString()}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setUseCustomDuration(true);
                } else {
                  setUseCustomDuration(false);
                  setSettings({ ...settings, duration: parseInt(e.target.value) });
                }
              }}
              disabled={isGenerating}
            >
              <option value={3600}>1 Hour</option>
              <option value={7200}>2 Hours</option>
              <option value={10800}>3 Hours</option>
              <option value={14400}>4 Hours</option>
              <option value={21600}>6 Hours</option>
              <option value={28800}>8 Hours</option>
              <option value="custom">Custom Duration</option>
            </select>
            {useCustomDuration && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Duration in seconds"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  disabled={isGenerating}
                  style={{
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    flex: 1,
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {customDuration ? `≈ ${(parseFloat(customDuration) / 3600).toFixed(1)} hours` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.settingGroup}>
          <label>Variation Level</label>
          <select
            value={variationLevel}
            onChange={(e) => setVariationLevel(e.target.value as 'low' | 'medium' | 'high' | 'extreme')}
            disabled={isGenerating}
          >
            <option value="low">Low (Minimal Changes)</option>
            <option value="medium">Medium (Moderate Variation)</option>
            <option value="high">High (Lots of Variation)</option>
            <option value="extreme">Extreme (Maximum Variation)</option>
          </select>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Higher variation creates more unique patterns throughout the track
          </p>
        </div>

        <div className={styles.settingGroup}>
          <label>BPM (Beats Per Minute)</label>
          <input
            type="range"
            min="60"
            max="120"
            step="1"
            value={settings.bpm}
            onChange={(e) => setSettings({ ...settings, bpm: parseInt(e.target.value) })}
            disabled={isGenerating}
          />
          <span>{settings.bpm} BPM</span>
        </div>

        <div className={styles.settingGroup}>
          <label>Musical Key</label>
          <select
            value={settings.key}
            onChange={(e) => setSettings({ ...settings, key: e.target.value })}
            disabled={isGenerating}
          >
            {keys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.settingGroup}>
          <label>Scale</label>
          <select
            value={settings.scale}
            onChange={(e) => setSettings({ ...settings, scale: e.target.value as 'major' | 'minor' })}
            disabled={isGenerating}
          >
            <option value="minor">Minor (Most Lo-Fi)</option>
            <option value="major">Major</option>
          </select>
        </div>

        <div className={styles.settingGroup}>
          <label>Style</label>
          <select
            value={settings.style}
            onChange={(e) => setSettings({ ...settings, style: e.target.value as 'ambient' | 'chill' | 'jazz' | 'study' })}
            disabled={isGenerating}
          >
            {styles_presets.map((style) => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isGenerating && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.progressText}>Generating Lo-Fi tune... {progress}%</p>
          <p className={styles.progressNote}>
            This may take a few minutes for longer tracks. Please keep this tab open.
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="btn btn-primary"
        style={{ marginTop: '24px', minWidth: '200px' }}
      >
        <Music size={20} />
        {isGenerating ? 'Generating...' : 'Generate Lo-Fi Tune'}
      </button>

      <div className={styles.infoBox}>
        <h4>How it works:</h4>
        <ul>
          <li>Generates evolving drum patterns that change over time</li>
          <li>Creates varied jazz-influenced chord progressions</li>
          <li>Adds melodic elements with phrase-based evolution</li>
          <li>Applies Lo-Fi processing automatically</li>
          <li>Creates unique patterns throughout the entire duration</li>
          <li>Higher variation = more unique patterns and changes</li>
        </ul>
        <div className={styles.note}>
          <p><strong>Note:</strong></p>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Custom duration allows any length (up to 24 hours)</li>
            <li>Higher variation levels create more unique patterns but may take longer to generate</li>
            <li>Generating longer tracks may take several minutes. Please keep this tab open during generation.</li>
            <li>The tune evolves throughout - no simple repetition!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

