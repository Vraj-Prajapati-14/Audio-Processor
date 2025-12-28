'use client';

import { Upload } from 'lucide-react';
import { MergeSettings } from '@/lib/audio-advanced';

interface MergeTabProps {
  mergeFile: File | null;
  mergeSettings: MergeSettings;
  onMergeFileChange: (file: File | null) => void;
  onMergeSettingsChange: (settings: MergeSettings) => void;
  onMerge: () => void;
  isProcessing: boolean;
}

export default function MergeTab({
  mergeFile,
  mergeSettings,
  onMergeFileChange,
  onMergeSettingsChange,
  onMerge,
  isProcessing,
}: MergeTabProps) {
  return (
    <div className="mergeSection">
      <h3>Merge Audio Files</h3>
      <div className="mergeUpload">
        <input
          type="file"
          id="merge-upload"
          accept="audio/*,.mp3,.mpeg,.mpga,.m4a,.wav,.ogg,.oga,.flac,.aac,.wma,.opus,.webm,.3gp,.amr,.aiff,.au,.ra"
          onChange={(e) => onMergeFileChange(e.target.files?.[0] || null)}
        />
        <label htmlFor="merge-upload" className="btn btn-secondary">
          <Upload size={18} />
          Select Second File
        </label>
        {mergeFile && <span>{mergeFile.name}</span>}
      </div>
      <div className="mergeControls">
        <div className="mergeControl">
          <label>Crossfade (seconds)</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={mergeSettings.crossfade}
            onChange={(e) => onMergeSettingsChange({ ...mergeSettings, crossfade: parseFloat(e.target.value) })}
          />
          <span>{mergeSettings.crossfade.toFixed(1)}s</span>
        </div>
        <div className="mergeControl">
          <label>Volume 1</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={mergeSettings.volume1}
            onChange={(e) => onMergeSettingsChange({ ...mergeSettings, volume1: parseFloat(e.target.value) })}
          />
          <span>{mergeSettings.volume1.toFixed(1)}x</span>
        </div>
        <div className="mergeControl">
          <label>Volume 2</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={mergeSettings.volume2}
            onChange={(e) => onMergeSettingsChange({ ...mergeSettings, volume2: parseFloat(e.target.value) })}
          />
          <span>{mergeSettings.volume2.toFixed(1)}x</span>
        </div>
      </div>
      <button
        onClick={onMerge}
        disabled={isProcessing || !mergeFile}
        className="btn btn-primary"
      >
        {isProcessing ? 'Merging...' : 'Merge Audio'}
      </button>
    </div>
  );
}

