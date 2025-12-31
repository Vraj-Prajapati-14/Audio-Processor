'use client';

import { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import styles from './LofiGeneratorTab.module.css';

interface InfoTooltipProps {
  description: string;
  title?: string;
}

export default function InfoTooltip({ description, title }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  return (
    <div className={styles.tooltipContainer}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.infoIconButton}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Show information"
        aria-expanded={isOpen}
      >
        <Info size={14} />
      </button>
      {isOpen && (
        <div ref={tooltipRef} className={styles.tooltipContent}>
          <button
            className={styles.tooltipClose}
            onClick={() => setIsOpen(false)}
            aria-label="Close tooltip"
          >
            <X size={12} />
          </button>
          {title && <div className={styles.tooltipTitle}>{title}</div>}
          <div className={styles.tooltipDescription}>{description}</div>
        </div>
      )}
    </div>
  );
}

