'use client';

import { useMemo } from 'react';
import { AudioEffects } from '@/lib/audio-utils';
import EffectCard from './EffectCard';
import EffectsSearch from './EffectsSearch';
import styles from './effects.module.css';
import {
  Volume2, Radio, Waves, Clock, Zap, Music, Filter as FilterIcon,
  Gauge, TrendingUp, Disc, Scissors, Layers, Sparkles, Sliders,
  Move, RotateCw, Circle, Waves as WavesIcon
} from 'lucide-react';

interface EffectsGridProps {
  effects: AudioEffects;
  updateEffect: <K extends keyof AudioEffects>(
    effectType: K,
    updates: Partial<AudioEffects[K]>
  ) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const effectCategories: Record<string, Array<keyof AudioEffects>> = {
  'Dynamics': ['compressor', 'limiter', 'noiseGate', 'sidechain'],
  'Time-Based': ['reverb', 'delay', 'chorus', 'flanger', 'phaser'],
  'Modulation': ['tremolo', 'vibrato', 'autoPan', 'ringModulator'],
  'Distortion': ['distortion', 'bitCrusher', 'tapeSaturation', 'wahWah'],
  'Filters': ['lowpass', 'highpass', 'bandpass', 'multiBandEQ'],
  'Spatial': ['stereoWidener', 'pan', 'autoPan'],
  'Pitch': ['pitch', 'vibrato'],
  'Special': ['lofi', 'exciter', 'granular'],
  'Basic': ['volume'],
};

const effectIcons: Record<keyof AudioEffects, React.ComponentType<{ size?: number }>> = {
  volume: Volume2,
  lofi: Radio,
  reverb: Waves,
  delay: Clock,
  distortion: Zap,
  pitch: Music,
  lowpass: FilterIcon,
  highpass: FilterIcon,
  compressor: Gauge,
  limiter: TrendingUp,
  tapeSaturation: Disc,
  bitCrusher: Scissors,
  sidechain: Layers,
  chorus: Sparkles,
  flanger: Sliders,
  phaser: Move,
  tremolo: RotateCw,
  vibrato: Circle,
  wahWah: FilterIcon,
  multiBandEQ: Sliders,
  noiseGate: Gauge,
  exciter: Sparkles,
  stereoWidener: WavesIcon,
  pan: Move,
  autoPan: RotateCw,
  ringModulator: Radio,
  granular: Radio,
  bandpass: FilterIcon,
};

const effectDescriptions: Partial<Record<keyof AudioEffects, string>> = {
  volume: 'Adjust the overall volume level of your audio.',
  lofi: 'Add vintage Lo-Fi character with bit crushing and filtering.',
  reverb: 'Add spatial depth and room ambience to your audio.',
  delay: 'Create echo and repetition effects.',
  distortion: 'Add grit and character with harmonic distortion.',
  pitch: 'Shift the pitch up or down in semitones.',
  lowpass: 'Filter out high frequencies, keeping only low frequencies.',
  highpass: 'Filter out low frequencies, keeping only high frequencies.',
  compressor: 'Control dynamic range by reducing loud sounds.',
  limiter: 'Prevent audio from exceeding a maximum level.',
  tapeSaturation: 'Add warm analog tape saturation and harmonics.',
  bitCrusher: 'Reduce bit depth and sample rate for digital distortion.',
  sidechain: 'Duck audio based on another signal (commonly used with kick drums).',
  chorus: 'Create rich, shimmering modulation by duplicating and slightly detuning the signal.',
  flanger: 'Add sweeping comb-filter effects for jet-like sounds.',
  phaser: 'Create phase-shifting effects for classic modulation sounds.',
  tremolo: 'Modulate volume at a regular rate.',
  vibrato: 'Modulate pitch at a regular rate.',
  wahWah: 'Filter sweep effect, commonly used with guitars.',
  multiBandEQ: 'Precise frequency control with separate low, mid, and high bands.',
  noiseGate: 'Automatically mute audio below a threshold to remove background noise.',
  exciter: 'Enhance high-frequency harmonics for added brightness.',
  stereoWidener: 'Expand or narrow the stereo image.',
  pan: 'Position audio in the stereo field (left to right).',
  autoPan: 'Automatically pan audio left and right at a set rate.',
  ringModulator: 'Create metallic, bell-like modulation effects.',
  granular: 'Break audio into grains for experimental textures.',
  bandpass: 'Filter to keep only frequencies within a specific range.',
};

export default function EffectsGrid({
  effects,
  updateEffect,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: EffectsGridProps) {
  const categories = Object.keys(effectCategories);

  const filteredEffects = useMemo(() => {
    let filtered: Array<keyof AudioEffects> = [];
    
    // Get effects from selected category or all effects
    if (selectedCategory) {
      filtered = effectCategories[selectedCategory] || [];
    } else {
      filtered = Object.keys(effects) as Array<keyof AudioEffects>;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((effectName) => {
        const name = effectName.toLowerCase();
        const description = effectDescriptions[effectName]?.toLowerCase() || '';
        const category = Object.entries(effectCategories).find(([_, effects]) =>
          effects.includes(effectName)
        )?.[0].toLowerCase() || '';
        
        return name.includes(query) || description.includes(query) || category.includes(query);
      });
    }

    return filtered;
  }, [effects, searchQuery, selectedCategory]);

  return (
    <div className={styles.effectsGridContainer}>
      <EffectsSearch
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        categories={categories}
      />
      
      <div className={styles.effectsGrid}>
        {filteredEffects.map((effectName) => {
          const effect = effects[effectName];
          const Icon = effectIcons[effectName];
          const description = effectDescriptions[effectName];
          const category = Object.entries(effectCategories).find(([_, effects]) =>
            effects.includes(effectName)
          )?.[0];

          return (
            <EffectCard
              key={effectName}
              effectName={effectName}
              effect={effect}
              onUpdate={(updates) => updateEffect(effectName, updates)}
              icon={Icon}
              description={description}
              category={category}
            />
          );
        })}
      </div>
      
      {filteredEffects.length === 0 && (
        <div className={styles.noResults}>
          <p>No effects found matching your search.</p>
        </div>
      )}
    </div>
  );
}

