'use client';

import { useState } from 'react';
import { Music, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { LoFiGeneratorSettings, generateLofiTuneAudio } from '@/lib/lofi-generator';
import { audioBufferToWav } from '@/lib/audio-utils';
import { generateLofiGeneratorSchema } from '@/lib/seo';
import InfoTooltip from './InfoTooltip';
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
    // Advanced controls with defaults
    swing: 0.05,
    drumIntensity: 0.7,
    melodyComplexity: 0.6,
    chordVoicing: 'jazz',
    reverbAmount: 0.3,
    delayAmount: 0.15,
    lofiAmount: 0.8,
    bassLevel: 0.5,
    trebleLevel: 0.4,
    overallVolume: 0.9,
  });

  const [customDuration, setCustomDuration] = useState('');
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [variationLevel, setVariationLevel] = useState<'low' | 'medium' | 'high' | 'extreme'>('high');
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const updateSetting = <K extends keyof LoFiGeneratorSettings>(
    key: K,
    value: LoFiGeneratorSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.generatorSection}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateLofiGeneratorSchema()) }}
      />
      <h1 className={styles.generatorMainTitle}>Lo-Fi Music Generator - Create Custom Tracks</h1>
      <p className={styles.generatorDescription}>
        Generate seamless, professional Lo-Fi tracks from 1 hour to 24 hours. Perfect for studying, relaxing, or background music. Customize every aspect of your track with advanced controls.
      </p>

      <h2 className={styles.generatorSubtitle}>Basic Settings</h2>
      <p className={styles.generatorSubDescription}>
        Start with these essential settings to define your track's foundation.
      </p>

      <div className={styles.generatorSettings}>
        <div className={styles.settingGroup}>
          <label>
            Duration
            <InfoTooltip 
              title="Duration"
              description="Choose a preset duration (1-8 hours) or set a custom duration up to 24 hours. Longer tracks take more time to generate but provide seamless, uninterrupted music."
            />
          </label>
          <div className={styles.durationContainer}>
            <select
              value={useCustomDuration ? 'custom' : settings.duration.toString()}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setUseCustomDuration(true);
                } else {
                  setUseCustomDuration(false);
                  updateSetting('duration', parseInt(e.target.value));
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
              <div className={styles.customDurationInput}>
                <input
                  type="number"
                  placeholder="Duration in seconds"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  disabled={isGenerating}
                  min="1"
                  max="86400"
                />
                <span className={styles.durationHint}>
                  {customDuration ? `≈ ${(parseFloat(customDuration) / 3600).toFixed(1)} hours` : 'Max 24 hours'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.settingGroup}>
          <label>
            Variation Level
            <InfoTooltip 
              title="Variation Level"
              description="Controls how much the track changes over time. Low variation creates consistent patterns, while extreme variation generates constantly evolving, unique patterns throughout the entire track."
            />
          </label>
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
          <p className={styles.settingHint}>
            Higher variation creates more unique patterns throughout the track
          </p>
        </div>

        <div className={styles.settingGroup}>
          <label>
            BPM (Beats Per Minute)
            <InfoTooltip 
              title="BPM (Beats Per Minute)"
              description="The tempo of your track. Lo-Fi music typically ranges from 70-90 BPM for a relaxed, chill vibe. Lower BPM creates slower, more meditative tracks, while higher BPM adds more energy."
            />
          </label>
          <input
            type="range"
            min="60"
            max="120"
            step="1"
            value={settings.bpm}
            onChange={(e) => updateSetting('bpm', parseInt(e.target.value))}
            disabled={isGenerating}
          />
          <span className={styles.valueDisplay}>{settings.bpm} BPM</span>
        </div>

        <div className={styles.settingGroup}>
          <label>
            Musical Key
            <InfoTooltip 
              title="Musical Key"
              description="The root key determines the tonal center of your track. Each key has a unique character - C major is bright and simple, while keys with sharps/flats add more complexity and color."
            />
          </label>
          <select
            value={settings.key}
            onChange={(e) => updateSetting('key', e.target.value)}
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
          <label>
            Scale
            <InfoTooltip 
              title="Scale"
              description="Major scales create brighter, happier, more uplifting sounds. Minor scales produce darker, more melancholic, and emotional tones - perfect for the classic Lo-Fi aesthetic."
            />
          </label>
          <select
            value={settings.scale}
            onChange={(e) => updateSetting('scale', e.target.value as 'major' | 'minor')}
            disabled={isGenerating}
          >
            <option value="minor">Minor (Most Lo-Fi)</option>
            <option value="major">Major</option>
          </select>
        </div>

        <div className={styles.settingGroup}>
          <label>
            Style
            <InfoTooltip 
              title="Style"
              description="Musical style presets that affect chord progressions and melody patterns. Ambient creates atmospheric soundscapes, Chill focuses on relaxed vibes, Jazz adds sophisticated harmonies, and Study optimizes for focus and concentration."
            />
          </label>
          <select
            value={settings.style}
            onChange={(e) => updateSetting('style', e.target.value as 'ambient' | 'chill' | 'jazz' | 'study')}
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

      {/* Advanced Controls */}
      <div className={styles.advancedSection}>
        <button
          className={styles.advancedToggle}
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={isGenerating}
        >
          <Settings size={18} />
          <span>Advanced Controls</span>
          {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showAdvanced && (
          <div className={styles.advancedControls}>
            <h3 className={styles.advancedTitle}>Sound Design</h3>
            <div className={styles.advancedGrid}>
              <div className={styles.settingGroup}>
                <label>
                  Swing
                  <InfoTooltip 
                    title="Swing"
                    description="Adds groove and human feel to the rhythm by slightly delaying off-beat notes. Higher swing values create a more relaxed, laid-back groove typical of jazz and Lo-Fi music."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.2"
                  step="0.01"
                  value={settings.swing || 0.05}
                  onChange={(e) => updateSetting('swing', parseFloat(e.target.value))}
                  disabled={isGenerating}
                />
                <span className={styles.valueDisplay}>{(settings.swing || 0.05).toFixed(2)}</span>
              </div>

              <div className={styles.settingGroup}>
                <label>
                  Drum Intensity
                  <InfoTooltip 
                    title="Drum Intensity"
                    description="Controls the volume and presence of drum elements (kick, snare, hi-hat). Lower values create subtle, background rhythms, while higher values make drums more prominent and driving."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.drumIntensity || 0.7}
                  onChange={(e) => updateSetting('drumIntensity', parseFloat(e.target.value))}
                  disabled={isGenerating}
                />
                <span className={styles.valueDisplay}>{Math.round((settings.drumIntensity || 0.7) * 100)}%</span>
              </div>

              <div className={styles.settingGroup}>
                <label>
                  Melody Complexity
                  <InfoTooltip 
                    title="Melody Complexity"
                    description="Controls how intricate and varied the melody is. Lower complexity creates simple, repetitive melodies perfect for background music. Higher complexity adds more variation, jumps, and musical interest."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.melodyComplexity || 0.6}
                  onChange={(e) => updateSetting('melodyComplexity', parseFloat(e.target.value))}
                  disabled={isGenerating}
                />
                <span className={styles.valueDisplay}>{Math.round((settings.melodyComplexity || 0.6) * 100)}%</span>
              </div>

              <div className={styles.settingGroup}>
                <label>
                  Chord Voicing
                  <InfoTooltip 
                    title="Chord Voicing"
                    description="Determines the style of chord arrangements. Simple uses basic triads (3-note chords), Jazz adds 7th chords for richer harmonies, and Extended includes 9th and 11th chords for sophisticated, modern sounds."
                  />
                </label>
                <select
                  value={settings.chordVoicing || 'jazz'}
                  onChange={(e) => updateSetting('chordVoicing', e.target.value as 'simple' | 'jazz' | 'extended')}
                  disabled={isGenerating}
                >
                  <option value="simple">Simple (Triads)</option>
                  <option value="jazz">Jazz (7th Chords)</option>
                  <option value="extended">Extended (9th/11th Chords)</option>
                </select>
              </div>
            </div>

            <h3 className={styles.advancedTitle}>Effects & Processing</h3>
            <div className={styles.advancedGrid}>
              <div className={styles.settingGroup}>
                <label>
                  Reverb Amount
                  <InfoTooltip 
                    title="Reverb Amount"
                    description="Controls spatial depth and room size. Reverb simulates the sound of a physical space. Higher values create a larger, more spacious sound, while lower values keep the sound more intimate and dry."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.reverbAmount || 0.3}
                  onChange={(e) => updateSetting('reverbAmount', parseFloat(e.target.value))}
                  disabled={isGenerating}
                />
                <span className={styles.valueDisplay}>{Math.round((settings.reverbAmount || 0.3) * 100)}%</span>
              </div>

              <div className={styles.settingGroup}>
                <label>
                  Delay Amount
                  <InfoTooltip 
                    title="Delay Amount"
                    description="Adds echo and spatial effects to create depth and movement. Delay repeats the sound after a short time, creating a sense of space and rhythm. Higher values create more noticeable echo effects."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.delayAmount || 0.15}
                  onChange={(e) => updateSetting('delayAmount', parseFloat(e.target.value))}
                  disabled={isGenerating}
                />
                <span className={styles.valueDisplay}>{Math.round((settings.delayAmount || 0.15) * 100)}%</span>
              </div>

              <div className={styles.settingGroup}>
                <label>
                  Lo-Fi Intensity
                  <InfoTooltip 
                    title="Lo-Fi Intensity"
                    description="Controls the amount of vintage/analog character. Higher values add more bit-crushing, sample rate reduction, and lowpass filtering to create that classic warm, nostalgic Lo-Fi sound. Lower values keep the sound cleaner."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.lofiAmount || 0.8}
                  onChange={(e) => updateSetting('lofiAmount', parseFloat(e.target.value))}
                  disabled={isGenerating}
                />
                <span className={styles.valueDisplay}>{Math.round((settings.lofiAmount || 0.8) * 100)}%</span>
              </div>
            </div>

            <h3 className={styles.advancedTitle}>EQ & Volume</h3>
            <div className={styles.advancedGrid}>
              <div className={styles.settingGroup}>
                <label>
                  Bass Level
                  <InfoTooltip 
                    title="Bass Level"
                    description="Controls low frequency content (bass). Higher values boost the bass frequencies for a warmer, fuller sound. Lower values reduce bass for a lighter, more transparent sound."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.bassLevel || 0.5}
                  onChange={(e) => updateSetting('bassLevel', parseFloat(e.target.value))}
                  disabled={isGenerating}
                />
                <span className={styles.valueDisplay}>{Math.round((settings.bassLevel || 0.5) * 100)}%</span>
              </div>

              <div className={styles.settingGroup}>
                <label>
                  Treble Level
                  <InfoTooltip 
                    title="Treble Level"
                    description="Controls high frequency content (treble). Higher values add brightness and clarity, while lower values create a darker, more muffled sound typical of Lo-Fi aesthetics."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.trebleLevel || 0.4}
                  onChange={(e) => updateSetting('trebleLevel', parseFloat(e.target.value))}
                  disabled={isGenerating}
                />
                <span className={styles.valueDisplay}>{Math.round((settings.trebleLevel || 0.4) * 100)}%</span>
              </div>

              <div className={styles.settingGroup}>
                <label>
                  Master Volume
                  <InfoTooltip 
                    title="Master Volume"
                    description="Controls the overall output volume of the generated track. Adjust this to match your preferred listening level. The track will be normalized to prevent clipping regardless of this setting."
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.overallVolume || 0.9}
                  onChange={(e) => updateSetting('overallVolume', parseFloat(e.target.value))}
                  disabled={isGenerating}
                />
                <span className={styles.valueDisplay}>{Math.round((settings.overallVolume || 0.9) * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {isGenerating && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.progressText}>Generating Lo-Fi tune... {Math.floor(progress)}%</p>
          <p className={styles.progressNote}>
            This may take a few minutes for longer tracks. Please keep this tab open.
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={styles.generateButton}
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
          <li>Advanced controls let you fine-tune every aspect of the sound</li>
        </ul>
        <div className={styles.note}>
          <p><strong>Note:</strong></p>
          <ul>
            <li>Custom duration allows any length (up to 24 hours)</li>
            <li>Higher variation levels create more unique patterns but may take longer to generate</li>
            <li>Generating longer tracks may take several minutes. Please keep this tab open during generation.</li>
            <li>The tune evolves throughout - no simple repetition!</li>
            <li>Use advanced controls to customize the sound to your preference</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
