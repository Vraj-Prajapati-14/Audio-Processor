'use client';

import { EQSettings } from '@/lib/audio-advanced';

interface EQTabProps {
  eqSettings: EQSettings;
  onEqChange: (settings: EQSettings) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export default function EQTab({
  eqSettings,
  onEqChange,
  onProcess,
  isProcessing,
}: EQTabProps) {
  return (
    <div className="eqSection">
      <h3>Equalizer (Bass, Mid, Treble)</h3>
      <div className="eqControls">
        <div className="eqControl">
          <label>Bass</label>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={eqSettings.bass}
            onChange={(e) => onEqChange({ ...eqSettings, bass: parseFloat(e.target.value) })}
          />
          <span>{eqSettings.bass > 0 ? '+' : ''}{eqSettings.bass} dB</span>
        </div>
        <div className="eqControl">
          <label>Mid</label>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={eqSettings.mid}
            onChange={(e) => onEqChange({ ...eqSettings, mid: parseFloat(e.target.value) })}
          />
          <span>{eqSettings.mid > 0 ? '+' : ''}{eqSettings.mid} dB</span>
        </div>
        <div className="eqControl">
          <label>Treble</label>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={eqSettings.treble}
            onChange={(e) => onEqChange({ ...eqSettings, treble: parseFloat(e.target.value) })}
          />
          <span>{eqSettings.treble > 0 ? '+' : ''}{eqSettings.treble} dB</span>
        </div>
      </div>
      <button
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary"
      >
        {isProcessing ? 'Processing...' : 'Apply EQ'}
      </button>
    </div>
  );
}

