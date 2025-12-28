'use client';

import { useState } from 'react';
import { allLoFiPresets } from '@/lib/lofi-presets';
import { AudioEffects, defaultEffects, loadAudioFile, processAudio, audioBufferToWav } from '@/lib/audio-utils';
import styles from './LofiPresetsTab.module.css';

interface LofiPresetsTabProps {
  audioBuffer: AudioBuffer | null;
  onProcessComplete: (url: string, newBuffer: AudioBuffer) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  setEffects: (effects: AudioEffects) => void;
  drawWaveform: (progressTime?: number) => void;
}

export default function LofiPresetsTab({
  audioBuffer,
  onProcessComplete,
  onError,
  isProcessing,
  setIsProcessing,
  setEffects,
  drawWaveform,
}: LofiPresetsTabProps) {
  const handlePresetClick = async (preset: typeof allLoFiPresets[0]) => {
    if (!audioBuffer) {
      onError('Please upload an audio file first');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Merge preset effects with defaultEffects to ensure all properties exist
      const mergedEffects: AudioEffects = {
        lofi: { ...defaultEffects.lofi, ...preset.effects.lofi },
        reverb: { ...defaultEffects.reverb, ...preset.effects.reverb },
        delay: { ...defaultEffects.delay, ...preset.effects.delay },
        distortion: { ...defaultEffects.distortion, ...preset.effects.distortion },
        pitch: { ...defaultEffects.pitch, ...preset.effects.pitch },
        lowpass: { ...defaultEffects.lowpass, ...preset.effects.lowpass },
        highpass: { ...defaultEffects.highpass, ...preset.effects.highpass },
        volume: { ...defaultEffects.volume, ...preset.effects.volume },
        compressor: defaultEffects.compressor,
        limiter: defaultEffects.limiter,
        tapeSaturation: defaultEffects.tapeSaturation,
        bitCrusher: defaultEffects.bitCrusher,
        sidechain: defaultEffects.sidechain,
      };
      setEffects(mergedEffects);
      const processed = await processAudio(audioBuffer, mergedEffects);
      const wavBlob = audioBufferToWav(processed);
      const url = URL.createObjectURL(wavBlob);
      const newBuffer = await loadAudioFile(new File([wavBlob], 'processed.wav', { type: 'audio/wav' }));
      onProcessComplete(url, newBuffer);
      setTimeout(() => drawWaveform(0), 100);
    } catch (error) {
      console.error('Error applying preset:', error);
      onError('Error applying preset');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.lofiSection}>
      <h3>Lo-Fi Presets</h3>
      <p className={styles.lofiDescription}>
        Click any preset to instantly apply that Lo-Fi vibe to your audio. Perfect for creating chill, nostalgic, or dreamy sounds.
      </p>
      <div className={styles.lofiPresetsGrid}>
        {allLoFiPresets.map((preset) => (
          <button
            key={preset.id}
            className={styles.lofiPresetCard}
            onClick={() => handlePresetClick(preset)}
            disabled={isProcessing}
          >
            <div className={styles.lofiPresetEmoji}>{preset.emoji}</div>
            <div className={styles.lofiPresetName}>{preset.name}</div>
            <div className={styles.lofiPresetDescription}>{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

