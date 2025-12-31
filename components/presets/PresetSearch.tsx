'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { LoFiPreset } from '@/lib/lofi-presets';
import styles from './presets.module.css';

interface PresetSearchProps {
  presets: LoFiPreset[];
  onSearchChange: (filteredPresets: LoFiPreset[]) => void;
}

export default function PresetSearch({ presets, onSearchChange }: PresetSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) {
      return presets;
    }

    const query = searchQuery.toLowerCase();
    return presets.filter((preset) => {
      const nameMatch = preset.name.toLowerCase().includes(query);
      const descMatch = preset.description.toLowerCase().includes(query);
      const tagMatch = preset.tags?.some((tag) => tag.toLowerCase().includes(query));
      const useCaseMatch = preset.useCase?.toLowerCase().includes(query);
      
      return nameMatch || descMatch || tagMatch || useCaseMatch;
    });
  }, [searchQuery, presets]);

  // Notify parent of filtered results
  useEffect(() => {
    onSearchChange(filteredPresets);
  }, [filteredPresets, onSearchChange]);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search presets by name, description, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search presets"
        />
        {searchQuery && (
          <button
            className={styles.clearButton}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {searchQuery && (
        <div className={styles.searchResults}>
          Found {filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

