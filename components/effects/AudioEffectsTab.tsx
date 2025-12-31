'use client';

import { useState } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { AudioEffects, defaultEffects } from '@/lib/audio-utils';
import EffectsGrid from './EffectsGrid';
import EffectChain from './EffectChain';
import EffectPresets from './EffectPresets';
import { generateEffectsSchema } from '@/lib/seo';
import styles from './AudioEffectsTab.module.css';

interface AudioEffectsTabProps {
  effects: AudioEffects;
  updateEffect: <K extends keyof AudioEffects>(
    effectType: K,
    updates: Partial<AudioEffects[K]>
  ) => void;
  resetEffects: () => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export default function AudioEffectsTab({
  effects,
  updateEffect,
  resetEffects,
  isProcessing,
  onProcess,
}: AudioEffectsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleToggleEffect = <K extends keyof AudioEffects>(effectType: K) => {
    const currentEffect = effects[effectType];
    if (currentEffect) {
      updateEffect(effectType, { enabled: !currentEffect.enabled } as any);
    }
  };

  return (
    <div className={styles.effectsSection}>
      {/* SEO Headings */}
      <h1 className={styles.seoH1}>Professional Audio Effects - Complete Effects Suite</h1>
      
      <div className={styles.effectsHeader}>
        <h2 className={styles.seoH2}>Effect Categories</h2>
        <button
          onClick={resetEffects}
          className="btn btn-secondary btn-icon"
          title="Reset all effects"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <EffectChain effects={effects} onToggleEffect={handleToggleEffect} />

      <EffectPresets currentEffects={effects} onLoadPreset={(presetEffects) => {
        // Load all effects from preset
        Object.keys(presetEffects).forEach((key) => {
          const effectKey = key as keyof AudioEffects;
          updateEffect(effectKey, presetEffects[effectKey]);
        });
      }} />

      <EffectsGrid
        effects={effects}
        updateEffect={updateEffect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className={styles.effectsActions}>
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="btn btn-primary"
        >
          <Play size={18} />
          {isProcessing ? 'Processing...' : 'Apply Effects'}
        </button>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateEffectsSchema()),
        }}
      />
    </div>
  );
}
