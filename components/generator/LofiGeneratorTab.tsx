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

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const styles_presets = ['ambient', 'chill', 'jazz', 'study'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    onProcessingChange?.(true, 'Generating Lo-Fi tune...');

    try {
      // Generate the complete Lo-Fi tune
      const audioBuffer = await generateLofiTuneAudio(settings, (prog: number) => {
        setProgress(prog);
        onProcessingChange?.(true, `Generating Lo-Fi tune... ${Math.floor(prog)}%`);
      });

      // Convert to WAV and create URL
      const wavBlob = audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      // Create descriptive title
      const durationText = settings.duration === 3600 ? '1 Hour' : 
                          settings.duration === 7200 ? '2 Hours' :
                          settings.duration === 10800 ? '3 Hours' : '4 Hours';
      const scaleText = settings.scale === 'major' ? 'Major' : 'Minor';
      const title = `Generated ${durationText} ${settings.style.charAt(0).toUpperCase() + settings.style.slice(1)} ${scaleText} Lo-Fi Music (${settings.key} Key, ${settings.bpm} BPM)`;
      
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
          <select
            value={settings.duration}
            onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })}
            disabled={isGenerating}
          >
            <option value={3600}>1 Hour</option>
            <option value={7200}>2 Hours</option>
            <option value={10800}>3 Hours</option>
            <option value={14400}>4 Hours</option>
          </select>
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
          <li>Generates drum patterns with swing and variation</li>
          <li>Creates jazz-influenced chord progressions</li>
          <li>Adds melodic elements</li>
          <li>Applies Lo-Fi processing automatically</li>
          <li>Creates seamless loop for continuous playback</li>
        </ul>
        <p className={styles.note}>
          <strong>Note:</strong> Generating longer tracks (3-4 hours) may take several minutes. Please keep this tab open during generation.
        </p>
      </div>
    </div>
  );
}

