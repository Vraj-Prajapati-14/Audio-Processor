'use client';

import { useState } from 'react';
import { Plus, Info } from 'lucide-react';
import { LoFiPreset } from '@/lib/lofi-presets';
import styles from './presets.module.css';

interface PresetCardProps {
  preset: LoFiPreset;
  onApply: (preset: LoFiPreset) => void;
  isProcessing: boolean;
  onInfoClick: (preset: LoFiPreset) => void;
}

export default function PresetCard({ preset, onApply, isProcessing, onInfoClick }: PresetCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={styles.presetCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        className={styles.presetCardButton}
        onClick={() => onApply(preset)}
        disabled={isProcessing}
        aria-label={`Apply ${preset.name} preset`}
      >
        <div className={styles.presetEmoji}>{preset.emoji}</div>
        <div className={styles.presetName}>{preset.name}</div>
        <div className={styles.presetDescription}>{preset.description}</div>
      </button>
      <button
        className={styles.infoButton}
        onClick={(e) => {
          e.stopPropagation();
          onInfoClick(preset);
        }}
        aria-label={`Info about ${preset.name} preset`}
        title="More info"
      >
        <Info size={18} />
      </button>
    </div>
  );
}

