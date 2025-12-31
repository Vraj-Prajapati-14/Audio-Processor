'use client';

import { useState, useCallback } from 'react';
import { LoFiPreset } from '@/lib/lofi-presets';
import PresetCard from './PresetCard';
import PresetSearch from './PresetSearch';
import PresetInfoModal from './PresetInfoModal';
import styles from './presets.module.css';

interface PresetGridProps {
  presets: LoFiPreset[];
  onApplyPreset: (preset: LoFiPreset) => void;
  isProcessing: boolean;
}

export default function PresetGrid({ presets, onApplyPreset, isProcessing }: PresetGridProps) {
  const [filteredPresets, setFilteredPresets] = useState<LoFiPreset[]>(presets);
  const [selectedPreset, setSelectedPreset] = useState<LoFiPreset | null>(null);

  const handleSearchChange = useCallback((filtered: LoFiPreset[]) => {
    setFilteredPresets(filtered);
  }, []);

  const handleInfoClick = useCallback((preset: LoFiPreset) => {
    setSelectedPreset(preset);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPreset(null);
  }, []);

  return (
    <div className={styles.presetGridContainer}>
      <PresetSearch presets={presets} onSearchChange={handleSearchChange} />
      
      {filteredPresets.length === 0 ? (
        <div className={styles.noResults}>
          <p>No presets found matching your search.</p>
          <p className={styles.noResultsHint}>Try different keywords or clear your search.</p>
        </div>
      ) : (
        <div className={styles.presetGrid}>
          {filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onApply={onApplyPreset}
              isProcessing={isProcessing}
              onInfoClick={handleInfoClick}
            />
          ))}
        </div>
      )}

      <PresetInfoModal
        preset={selectedPreset}
        onClose={handleCloseModal}
        onApply={onApplyPreset}
        isProcessing={isProcessing}
      />
    </div>
  );
}

