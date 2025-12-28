'use client';

import { RotateCw } from 'lucide-react';
import { FadeSettings } from '@/lib/audio-advanced';

interface ToolsTabProps {
  fadeSettings: FadeSettings;
  onFadeChange: (settings: FadeSettings) => void;
  onReverse: () => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export default function ToolsTab({
  fadeSettings,
  onFadeChange,
  onReverse,
  onProcess,
  isProcessing,
}: ToolsTabProps) {
  return (
    <div className="toolsSection">
      <h3>Audio Tools</h3>
      
      {/* Fade In/Out Controls */}
      <div className="fadeSection">
        <h4>Fade In / Fade Out</h4>
        <div className="fadeControls">
          <div className="fadeControl">
            <label>Fade In (seconds)</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={fadeSettings.fadeIn}
              onChange={(e) => onFadeChange({ ...fadeSettings, fadeIn: parseFloat(e.target.value) })}
            />
            <span>{fadeSettings.fadeIn.toFixed(1)}s</span>
          </div>
          <div className="fadeControl">
            <label>Fade Out (seconds)</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={fadeSettings.fadeOut}
              onChange={(e) => onFadeChange({ ...fadeSettings, fadeOut: parseFloat(e.target.value) })}
            />
            <span>{fadeSettings.fadeOut.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* Reverse Audio */}
      <div className="toolsGrid">
        <button
          onClick={onReverse}
          disabled={isProcessing}
          className="btn btn-secondary"
        >
          <RotateCw size={20} />
          Reverse Audio
        </button>
      </div>

      {/* Apply Button */}
      <button
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary"
        style={{ marginTop: '24px' }}
      >
        {isProcessing ? 'Processing...' : 'Apply Tools'}
      </button>
    </div>
  );
}

