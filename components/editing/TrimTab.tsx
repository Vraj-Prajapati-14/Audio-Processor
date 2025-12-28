'use client';

interface TrimTabProps {
  trimStart: number;
  trimEnd: number;
  duration: number;
  onTrimStartChange: (value: number) => void;
  onTrimEndChange: (value: number) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export default function TrimTab({
  trimStart,
  trimEnd,
  duration,
  onTrimStartChange,
  onTrimEndChange,
  onProcess,
  isProcessing,
}: TrimTabProps) {
  return (
    <div className="trimSection">
      <h3>Trim/Crop Audio</h3>
      <div className="trimControls">
        <div className="timeControl">
          <label>Start Time (s)</label>
          <input
            type="number"
            min="0"
            max={duration}
            step="0.1"
            value={trimStart.toFixed(1)}
            onChange={(e) => onTrimStartChange(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="timeControl">
          <label>End Time (s)</label>
          <input
            type="number"
            min="0"
            max={duration}
            step="0.1"
            value={trimEnd.toFixed(1)}
            onChange={(e) => onTrimEndChange(parseFloat(e.target.value) || duration)}
          />
        </div>
      </div>
      <button
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary"
      >
        {isProcessing ? 'Processing...' : 'Apply Trim'}
      </button>
    </div>
  );
}

