'use client';

import { useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { LoFiPreset } from '@/lib/lofi-presets';
import styles from './presets.module.css';

interface PresetInfoModalProps {
  preset: LoFiPreset | null;
  onClose: () => void;
  onApply: (preset: LoFiPreset) => void;
  isProcessing: boolean;
}

export default function PresetInfoModal({ preset, onClose, onApply, isProcessing }: PresetInfoModalProps) {
  useEffect(() => {
    if (preset) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [preset, onClose]);

  if (!preset) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>
        
        <div className={styles.modalHeader}>
          <div className={styles.modalEmoji}>{preset.emoji}</div>
          <h2 className={styles.modalTitle}>{preset.name}</h2>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalDescription}>
            {preset.longDescription || preset.description}
          </p>
          
          {preset.useCase && (
            <div className={styles.modalUseCase}>
              <strong>Best for:</strong> {preset.useCase}
            </div>
          )}

          {preset.tags && preset.tags.length > 0 && (
            <div className={styles.modalTags}>
              <strong>Tags:</strong>
              <div className={styles.tagsList}>
                {preset.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.modalEffects}>
            <strong>Applied Effects:</strong>
            <ul className={styles.effectsList}>
              {preset.effects.lofi?.enabled && (
                <li>Lo-Fi (Bit Depth: {preset.effects.lofi.bitDepth}, Sample Rate: {preset.effects.lofi.sampleRate}Hz)</li>
              )}
              {preset.effects.reverb?.enabled && (
                <li>Reverb (Room Size: {Math.round((preset.effects.reverb.roomSize || 0) * 100)}%)</li>
              )}
              {preset.effects.delay?.enabled && (
                <li>Delay ({preset.effects.delay.delayTime}s)</li>
              )}
              {preset.effects.distortion?.enabled && (
                <li>Distortion ({Math.round((preset.effects.distortion.amount || 0) * 100)}%)</li>
              )}
              {preset.effects.pitch && preset.effects.pitch.enabled && preset.effects.pitch.semitones !== 0 && (
                <li>Pitch Shift ({preset.effects.pitch.semitones > 0 ? '+' : ''}{preset.effects.pitch.semitones} semitones)</li>
              )}
              {preset.effects.lowpass?.enabled && (
                <li>Lowpass Filter ({preset.effects.lowpass.frequency}Hz)</li>
              )}
              {preset.effects.volume?.enabled && preset.effects.volume.gain !== 1 && (
                <li>Volume ({preset.effects.volume.gain.toFixed(2)}x)</li>
              )}
            </ul>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.applyButton}
            onClick={() => {
              onApply(preset);
              onClose();
            }}
            disabled={isProcessing}
          >
            <Play size={18} />
            {isProcessing ? 'Applying...' : 'Apply Preset'}
          </button>
        </div>
      </div>
    </div>
  );
}

