'use client';

import { useState, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';
import styles from './effects.module.css';

interface EffectsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
}

export default function EffectsSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: EffectsSearchProps) {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search effects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className={styles.clearButton}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className={styles.categoryFilters}>
        <button
          onClick={() => onCategoryChange(null)}
          className={`${styles.categoryButton} ${!selectedCategory ? styles.categoryButtonActive : ''}`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`${styles.categoryButton} ${selectedCategory === category ? styles.categoryButtonActive : ''}`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

