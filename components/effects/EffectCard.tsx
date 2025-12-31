'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Info } from 'lucide-react';
import { AudioEffects } from '@/lib/audio-utils';
import InfoTooltip from '../generator/InfoTooltip';
import styles from './effects.module.css';
import clsx from 'clsx';

interface EffectCardProps {
  effectName: keyof AudioEffects;
  effect: AudioEffects[keyof AudioEffects];
  onUpdate: (updates: Partial<AudioEffects[keyof AudioEffects]>) => void;
  icon?: React.ComponentType<{ size?: number }>;
  description?: string;
  category?: string;
}

export default function EffectCard({
  effectName,
  effect,
  onUpdate,
  icon: Icon,
  description,
  category,
}: EffectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(effect));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatValue = (key: string, value: any): string => {
    if (typeof value === 'boolean') return value ? 'On' : 'Off';
    if (typeof value === 'number') {
      if (key.includes('freq') || key.includes('Freq') || key === 'frequency') {
        return `${value} Hz`;
      }
      if (key.includes('gain') || key === 'amount' || key === 'depth' || key === 'wet') {
        return `${(value * 100).toFixed(0)}%`;
      }
      if (key.includes('time') || key === 'delayTime') {
        return `${value.toFixed(2)}s`;
      }
      if (key.includes('threshold')) {
        return `${value} dB`;
      }
      if (key === 'ratio') {
        return `${value}:1`;
      }
      if (key === 'semitones') {
        return `${value > 0 ? '+' : ''}${value}`;
      }
      if (key === 'bits' || key === 'stages') {
        return `${value}`;
      }
      return value.toFixed(2);
    }
    return String(value);
  };

  const renderParameter = (key: string, value: any) => {
    if (key === 'enabled') return null;
    
    const paramDescription = getParameterDescription(effectName, key);
    
    return (
      <div key={key} className={styles.parameterGroup}>
        <div className={styles.parameterHeader}>
          <label className={styles.parameterLabel}>
            {formatParameterName(key)}
            {paramDescription && (
              <InfoTooltip description={paramDescription} title={formatParameterName(key)} />
            )}
          </label>
          <span className={styles.parameterValue}>{formatValue(key, value)}</span>
        </div>
        {typeof value === 'number' && (
          <input
            type="range"
            min={getMinValue(key, effectName)}
            max={getMaxValue(key, effectName)}
            step={getStepValue(key, effectName)}
            value={value}
            onChange={(e) => onUpdate({ [key]: parseFloat(e.target.value) } as any)}
            className={styles.parameterSlider}
          />
        )}
        {typeof value === 'boolean' && (
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onUpdate({ [key]: e.target.checked } as any)}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        )}
        {typeof value === 'string' && (
          <select
            value={value}
            onChange={(e) => onUpdate({ [key]: e.target.value } as any)}
            className={styles.parameterSelect}
          >
            {getStringOptions(key, effectName).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  const enabled = effect.enabled;
  const parameters = Object.entries(effect).filter(([key]) => key !== 'enabled');

  return (
    <div className={clsx(styles.effectCard, { [styles.effectCardEnabled]: enabled })}>
      <div className={styles.effectCardHeader}>
        <div className={styles.effectCardTitle}>
          {Icon && <Icon size={20} />}
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onUpdate({ enabled: e.target.checked } as any)}
            />
            <span>{formatEffectName(effectName)}</span>
          </label>
        </div>
        <div className={styles.effectCardActions}>
          {description && (
            <InfoTooltip description={description} title={formatEffectName(effectName)} />
          )}
          <button
            onClick={handleCopy}
            className={styles.iconButton}
            title="Copy settings"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          {parameters.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={styles.iconButton}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>
      
      {enabled && isExpanded && parameters.length > 0 && (
        <div className={styles.effectCardContent}>
          {parameters.map(([key, value]) => renderParameter(key, value))}
        </div>
      )}
    </div>
  );
}

function formatEffectName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatParameterName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getParameterDescription(effectName: keyof AudioEffects, paramName: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    reverb: {
      roomSize: 'Controls the size of the reverb space. Larger values create more spacious reverb.',
      dampening: 'Controls high-frequency absorption. Higher values make reverb sound darker.',
      wet: 'Balance between dry (original) and wet (effected) signal.',
      preDelay: 'Time before reverb starts. Adds clarity and separation.',
      earlyReflections: 'Controls early reflections in the reverb tail.',
      lateReflections: 'Controls late reflections in the reverb tail.',
    },
    delay: {
      delayTime: 'Time between original and delayed signal.',
      feedback: 'Amount of delayed signal fed back into the delay. Higher values create more repeats.',
      wet: 'Balance between dry and wet signal.',
      pingPong: 'Alternates delay between left and right channels for stereo effect.',
      stereoWidth: 'Controls the stereo width of the delay effect.',
      modulation: 'Adds chorus-like modulation to the delay for movement.',
    },
    distortion: {
      amount: 'Intensity of the distortion effect.',
      type: 'Type of distortion: soft (smooth), hard (aggressive), or tube (warm).',
      tone: 'Tone control to shape the frequency response of the distortion.',
    },
    compressor: {
      threshold: 'Level above which compression begins.',
      ratio: 'Compression ratio. Higher values compress more aggressively.',
      attack: 'Time for compressor to respond to signal above threshold.',
      release: 'Time for compressor to return to normal after signal drops below threshold.',
      knee: 'Smoothness of compression curve. Higher values create softer compression.',
      makeUpGain: 'Output gain compensation after compression.',
      lookahead: 'Lookahead time for smoother compression response.',
    },
    lofi: {
      bitDepth: 'Reduces bit depth for digital distortion and character.',
      sampleRate: 'Reduces sample rate for vintage lo-fi sound.',
      lowpassFreq: 'Lowpass filter frequency to cut high frequencies.',
      wowFlutter: 'Adds pitch variation for tape-like wobble effect.',
      noiseAmount: 'Amount of tape noise to add.',
    },
    tapeSaturation: {
      drive: 'Amount of saturation applied to the signal.',
      bias: 'DC bias offset for tape-like characteristics.',
      amount: 'Mix between dry and saturated signal.',
      wowFlutter: 'Pitch variation for tape-like wobble.',
      noise: 'Amount of tape noise to add.',
    },
    chorus: {
      rate: 'Speed of the chorus modulation in Hz.',
      depth: 'Depth of the chorus effect.',
      feedback: 'Amount of feedback in the chorus circuit.',
      delay: 'Delay time for the chorus effect in milliseconds.',
    },
    flanger: {
      rate: 'Speed of the flanger modulation in Hz.',
      depth: 'Depth of the flanger effect.',
      feedback: 'Amount of feedback. Negative values create different character.',
      delay: 'Delay time for the flanger effect in milliseconds.',
    },
    phaser: {
      rate: 'Speed of the phaser modulation in Hz.',
      depth: 'Depth of the phaser effect.',
      feedback: 'Amount of feedback in the phaser circuit.',
      stages: 'Number of allpass filter stages. More stages = stronger effect.',
    },
    tremolo: {
      rate: 'Speed of the tremolo modulation in Hz.',
      depth: 'Depth of the volume modulation.',
      waveform: 'Waveform shape: sine (smooth), square (hard), triangle (linear).',
    },
    vibrato: {
      rate: 'Speed of the pitch modulation in Hz.',
      depth: 'Depth of the pitch variation.',
    },
    wahWah: {
      frequency: 'Center frequency of the wah filter.',
      resonance: 'Q factor of the filter. Higher values create more pronounced effect.',
      autoWah: 'Enable automatic wah based on input level.',
    },
    multiBandEQ: {
      lowGain: 'Gain adjustment for low frequencies in dB.',
      lowFreq: 'Crossover frequency for the low band.',
      midGain: 'Gain adjustment for mid frequencies in dB.',
      midFreq: 'Center frequency for the mid band.',
      midQ: 'Q factor (bandwidth) for the mid band.',
      highGain: 'Gain adjustment for high frequencies in dB.',
      highFreq: 'Crossover frequency for the high band.',
    },
    noiseGate: {
      threshold: 'Level below which the gate closes in dB.',
      attack: 'Time for gate to open when signal exceeds threshold in ms.',
      release: 'Time for gate to close when signal drops below threshold in ms.',
      hold: 'Minimum time gate stays open after closing in ms.',
    },
    exciter: {
      amount: 'Intensity of the harmonic enhancement.',
      frequency: 'Frequency above which harmonics are added.',
      harmonics: 'Amount of harmonic content to add.',
    },
    stereoWidener: {
      width: 'Stereo width: 0=mono, 1=normal, 2=wide.',
      balance: 'Left/right balance: -1=left, 0=center, 1=right.',
    },
    pan: {
      position: 'Pan position: -1=left, 0=center, 1=right.',
    },
    autoPan: {
      rate: 'Speed of the automatic panning in Hz.',
      depth: 'Depth of the panning effect.',
      waveform: 'Waveform shape for the panning modulation.',
    },
    ringModulator: {
      frequency: 'Frequency of the carrier signal in Hz.',
      depth: 'Intensity of the ring modulation effect.',
    },
    granular: {
      grainSize: 'Size of each audio grain in milliseconds.',
      pitch: 'Pitch shift factor: 0.25=quarter speed, 1=normal, 4=4x speed.',
      position: 'Position in the audio buffer for grain playback (0-1).',
    },
    bandpass: {
      frequency: 'Center frequency of the bandpass filter in Hz.',
      Q: 'Q factor (bandwidth). Higher values = narrower band.',
    },
  };
  
  return descriptions[effectName as string]?.[paramName] || '';
}

function getMinValue(key: string, effectName: keyof AudioEffects): number {
  const mins: Record<string, Record<string, number>> = {
    reverb: { roomSize: 0, dampening: 0, wet: 0, preDelay: 0, earlyReflections: 0, lateReflections: 0 },
    delay: { delayTime: 0, feedback: 0, wet: 0, stereoWidth: 0, modulation: 0 },
    distortion: { amount: 0, tone: 0 },
    compressor: { threshold: -60, ratio: 1, attack: 0, release: 0, knee: 0, makeUpGain: 0, lookahead: 0 },
    pitch: { semitones: -12 },
    lowpass: { frequency: 20 },
    highpass: { frequency: 20 },
    volume: { gain: 0 },
    lofi: { bitDepth: 1, sampleRate: 4000, lowpassFreq: 200, wowFlutter: 0, noiseAmount: 0 },
    tapeSaturation: { drive: 0, bias: 0, amount: 0, wowFlutter: 0, noise: 0 },
    chorus: { rate: 0, depth: 0, feedback: 0, delay: 0 },
    flanger: { rate: 0, depth: 0, feedback: -1, delay: 0 },
    phaser: { rate: 0, depth: 0, feedback: -1, stages: 2 },
    tremolo: { rate: 0, depth: 0 },
    vibrato: { rate: 0, depth: 0 },
    wahWah: { frequency: 200, resonance: 0 },
    multiBandEQ: { lowGain: -12, lowFreq: 20, midGain: -12, midFreq: 200, midQ: 0.1, highGain: -12, highFreq: 2000 },
    noiseGate: { threshold: -60, attack: 0, release: 0, hold: 0 },
    exciter: { amount: 0, frequency: 2000, harmonics: 0 },
    stereoWidener: { width: 0, balance: -1 },
    pan: { position: -1 },
    autoPan: { rate: 0, depth: 0 },
    ringModulator: { frequency: 20, depth: 0 },
    granular: { grainSize: 10, pitch: 0.25, position: 0 },
    bandpass: { frequency: 20, Q: 0.1 },
  };
  return mins[effectName as string]?.[key] ?? 0;
}

function getMaxValue(key: string, effectName: keyof AudioEffects): number {
  const maxs: Record<string, Record<string, number>> = {
    reverb: { roomSize: 1, dampening: 1, wet: 1, preDelay: 200, earlyReflections: 1, lateReflections: 1 },
    delay: { delayTime: 2, feedback: 1, wet: 1, stereoWidth: 1, modulation: 1 },
    distortion: { amount: 1, tone: 1 },
    compressor: { threshold: 0, ratio: 20, attack: 1, release: 1, knee: 40, makeUpGain: 12, lookahead: 10 },
    pitch: { semitones: 12 },
    lowpass: { frequency: 20000 },
    highpass: { frequency: 20000 },
    volume: { gain: 2 },
    lofi: { bitDepth: 32, sampleRate: 48000, lowpassFreq: 20000, wowFlutter: 1, noiseAmount: 1 },
    tapeSaturation: { drive: 1, bias: 1, amount: 1, wowFlutter: 1, noise: 1 },
    chorus: { rate: 10, depth: 1, feedback: 1, delay: 50 },
    flanger: { rate: 10, depth: 1, feedback: 1, delay: 20 },
    phaser: { rate: 10, depth: 1, feedback: 1, stages: 12 },
    tremolo: { rate: 20, depth: 1 },
    vibrato: { rate: 20, depth: 1 },
    wahWah: { frequency: 2000, resonance: 1 },
    multiBandEQ: { lowGain: 12, lowFreq: 500, midGain: 12, midFreq: 5000, midQ: 10, highGain: 12, highFreq: 20000 },
    noiseGate: { threshold: 0, attack: 100, release: 1000, hold: 1000 },
    exciter: { amount: 1, frequency: 20000, harmonics: 1 },
    stereoWidener: { width: 2, balance: 1 },
    pan: { position: 1 },
    autoPan: { rate: 10, depth: 1 },
    ringModulator: { frequency: 2000, depth: 1 },
    granular: { grainSize: 500, pitch: 4, position: 1 },
    bandpass: { frequency: 20000, Q: 30 },
  };
  return maxs[effectName as string]?.[key] ?? 1;
}

function getStepValue(key: string, effectName: keyof AudioEffects): number {
  const steps: Record<string, Record<string, number>> = {
    reverb: { roomSize: 0.01, dampening: 0.01, wet: 0.01, preDelay: 1, earlyReflections: 0.01, lateReflections: 0.01 },
    delay: { delayTime: 0.01, feedback: 0.01, wet: 0.01, stereoWidth: 0.01, modulation: 0.01 },
    distortion: { amount: 0.01, tone: 0.01 },
    compressor: { threshold: 1, ratio: 0.1, attack: 0.001, release: 0.01, knee: 1, makeUpGain: 0.1, lookahead: 0.1 },
    pitch: { semitones: 1 },
    lowpass: { frequency: 100 },
    highpass: { frequency: 100 },
    volume: { gain: 0.1 },
    lofi: { bitDepth: 1, sampleRate: 1000, lowpassFreq: 100, wowFlutter: 0.01, noiseAmount: 0.01 },
    tapeSaturation: { drive: 0.01, bias: 0.01, amount: 0.01, wowFlutter: 0.01, noise: 0.01 },
    chorus: { rate: 0.1, depth: 0.01, feedback: 0.01, delay: 1 },
    flanger: { rate: 0.1, depth: 0.01, feedback: 0.01, delay: 1 },
    phaser: { rate: 0.1, depth: 0.01, feedback: 0.01, stages: 1 },
    tremolo: { rate: 0.1, depth: 0.01 },
    vibrato: { rate: 0.1, depth: 0.01 },
    wahWah: { frequency: 10, resonance: 0.01 },
    multiBandEQ: { lowGain: 0.1, lowFreq: 10, midGain: 0.1, midFreq: 10, midQ: 0.1, highGain: 0.1, highFreq: 100 },
    noiseGate: { threshold: 1, attack: 1, release: 10, hold: 10 },
    exciter: { amount: 0.01, frequency: 100, harmonics: 0.01 },
    stereoWidener: { width: 0.1, balance: 0.1 },
    pan: { position: 0.1 },
    autoPan: { rate: 0.1, depth: 0.01 },
    ringModulator: { frequency: 10, depth: 0.01 },
    granular: { grainSize: 1, pitch: 0.1, position: 0.01 },
    bandpass: { frequency: 100, Q: 0.1 },
  };
  return steps[effectName as string]?.[key] ?? 0.01;
}

function getStringOptions(key: string, effectName: keyof AudioEffects): string[] {
  if (key === 'type' && effectName === 'distortion') {
    return ['soft', 'hard', 'tube'];
  }
  if (key === 'waveform') {
    return ['sine', 'square', 'triangle'];
  }
  return [];
}

