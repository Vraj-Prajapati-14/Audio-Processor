'use client';

import { AudioEffects } from '@/lib/audio-utils';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import styles from './effects.module.css';
import clsx from 'clsx';

interface EffectChainProps {
  effects: AudioEffects;
  onToggleEffect: <K extends keyof AudioEffects>(effectType: K) => void;
}

const effectOrder: Array<keyof AudioEffects> = [
  'volume',
  'noiseGate',
  'highpass',
  'compressor',
  'multiBandEQ',
  'distortion',
  'tapeSaturation',
  'bitCrusher',
  'chorus',
  'flanger',
  'phaser',
  'delay',
  'reverb',
  'pitch',
  'vibrato',
  'tremolo',
  'ringModulator',
  'wahWah',
  'exciter',
  'stereoWidener',
  'pan',
  'autoPan',
  'lowpass',
  'lofi',
  'bandpass',
  'limiter',
  'sidechain',
];

export default function EffectChain({ effects, onToggleEffect }: EffectChainProps) {
  const enabledEffects = effectOrder.filter((effectName) => effects[effectName]?.enabled);

  const formatEffectName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className={styles.effectChainContainer}>
      <h3 className={styles.effectChainTitle}>Effect Chain</h3>
      {enabledEffects.length === 0 ? (
        <p className={styles.effectChainEmpty}>No effects enabled</p>
      ) : (
        <div className={styles.effectChainList}>
          {enabledEffects.map((effectName, index) => {
            const effect = effects[effectName];
            return (
              <div
                key={effectName}
                className={clsx(styles.effectChainItem, {
                  [styles.effectChainItemActive]: effect?.enabled,
                })}
              >
                <GripVertical size={16} className={styles.effectChainDragHandle} />
                <span className={styles.effectChainNumber}>{index + 1}</span>
                <span className={styles.effectChainName}>{formatEffectName(effectName)}</span>
                <button
                  onClick={() => onToggleEffect(effectName)}
                  className={styles.effectChainToggle}
                  title={effect?.enabled ? 'Disable' : 'Enable'}
                >
                  {effect?.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

