'use client';

import { RotateCcw } from 'lucide-react';
import { AudioEffects, defaultEffects } from '@/lib/audio-utils';
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
  return (
    <div className={styles.effectsSection}>
      <div className={styles.effectsHeader}>
        <h3>Audio Effects</h3>
        <button
          onClick={resetEffects}
          className="btn btn-secondary btn-icon"
          title="Reset all effects"
        >
          <RotateCcw size={18} />
        </button>
      </div>
      <div className={styles.effectsGrid}>
        {/* Volume */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.volume.enabled}
              onChange={(e) => updateEffect('volume', { enabled: e.target.checked })}
            />
            <span>Volume</span>
          </label>
          {effects.volume.enabled && (
            <div className={styles.sliderGroup}>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={effects.volume.gain}
                onChange={(e) => updateEffect('volume', { gain: parseFloat(e.target.value) })}
              />
              <span className={styles.sliderValue}>{effects.volume.gain.toFixed(1)}x</span>
            </div>
          )}
        </div>

        {/* Lofi */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.lofi.enabled}
              onChange={(e) => updateEffect('lofi', { enabled: e.target.checked })}
            />
            <span>Lofi</span>
          </label>
          {effects.lofi.enabled && (
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel}>Lowpass Frequency</label>
              <input
                type="range"
                min="200"
                max="8000"
                step="100"
                value={effects.lofi.lowpassFreq}
                onChange={(e) => updateEffect('lofi', { lowpassFreq: parseInt(e.target.value) })}
              />
              <span className={styles.sliderValue}>{effects.lofi.lowpassFreq} Hz</span>
            </div>
          )}
        </div>

        {/* Reverb */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.reverb.enabled}
              onChange={(e) => updateEffect('reverb', { enabled: e.target.checked })}
            />
            <span>Reverb</span>
          </label>
          {effects.reverb.enabled && (
            <>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Room Size</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={effects.reverb.roomSize}
                  onChange={(e) => updateEffect('reverb', { roomSize: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.reverb.roomSize * 100).toFixed(0)}%</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Wet Level</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={effects.reverb.wet}
                  onChange={(e) => updateEffect('reverb', { wet: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.reverb.wet * 100).toFixed(0)}%</span>
              </div>
            </>
          )}
        </div>

        {/* Delay */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.delay.enabled}
              onChange={(e) => updateEffect('delay', { enabled: e.target.checked })}
            />
            <span>Delay</span>
          </label>
          {effects.delay.enabled && (
            <>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Delay Time</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={effects.delay.delayTime}
                  onChange={(e) => updateEffect('delay', { delayTime: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{effects.delay.delayTime.toFixed(1)}s</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Feedback</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={effects.delay.feedback}
                  onChange={(e) => updateEffect('delay', { feedback: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.delay.feedback * 100).toFixed(0)}%</span>
              </div>
            </>
          )}
        </div>

        {/* Distortion */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.distortion.enabled}
              onChange={(e) => updateEffect('distortion', { enabled: e.target.checked })}
            />
            <span>Distortion</span>
          </label>
          {effects.distortion.enabled && (
            <div className={styles.sliderGroup}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={effects.distortion.amount}
                onChange={(e) => updateEffect('distortion', { amount: parseFloat(e.target.value) })}
              />
              <span className={styles.sliderValue}>{(effects.distortion.amount * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Pitch */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.pitch.enabled}
              onChange={(e) => updateEffect('pitch', { enabled: e.target.checked })}
            />
            <span>Pitch Shift</span>
          </label>
          {effects.pitch.enabled && (
            <div className={styles.sliderGroup}>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={effects.pitch.semitones}
                onChange={(e) => updateEffect('pitch', { semitones: parseInt(e.target.value) })}
              />
              <span className={styles.sliderValue}>
                {effects.pitch.semitones > 0 ? '+' : ''}{effects.pitch.semitones} semitones
              </span>
            </div>
          )}
        </div>

        {/* Lowpass Filter */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.lowpass.enabled}
              onChange={(e) => updateEffect('lowpass', { enabled: e.target.checked })}
            />
            <span>Lowpass Filter</span>
          </label>
          {effects.lowpass.enabled && (
            <div className={styles.sliderGroup}>
              <input
                type="range"
                min="200"
                max="20000"
                step="100"
                value={effects.lowpass.frequency}
                onChange={(e) => updateEffect('lowpass', { frequency: parseInt(e.target.value) })}
              />
              <span className={styles.sliderValue}>{effects.lowpass.frequency} Hz</span>
            </div>
          )}
        </div>

        {/* Highpass Filter */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.highpass.enabled}
              onChange={(e) => updateEffect('highpass', { enabled: e.target.checked })}
            />
            <span>Highpass Filter</span>
          </label>
          {effects.highpass.enabled && (
            <div className={styles.sliderGroup}>
              <input
                type="range"
                min="20"
                max="5000"
                step="50"
                value={effects.highpass.frequency}
                onChange={(e) => updateEffect('highpass', { frequency: parseInt(e.target.value) })}
              />
              <span className={styles.sliderValue}>{effects.highpass.frequency} Hz</span>
            </div>
          )}
        </div>

        {/* Compressor */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.compressor.enabled}
              onChange={(e) => updateEffect('compressor', { enabled: e.target.checked })}
            />
            <span>Compressor</span>
          </label>
          {effects.compressor.enabled && (
            <>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Threshold</label>
                <input
                  type="range"
                  min="-60"
                  max="0"
                  step="1"
                  value={effects.compressor.threshold}
                  onChange={(e) => updateEffect('compressor', { threshold: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{effects.compressor.threshold} dB</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Ratio</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={effects.compressor.ratio}
                  onChange={(e) => updateEffect('compressor', { ratio: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{effects.compressor.ratio}:1</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Attack</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={effects.compressor.attack}
                  onChange={(e) => updateEffect('compressor', { attack: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.compressor.attack * 1000).toFixed(0)} ms</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Release</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effects.compressor.release}
                  onChange={(e) => updateEffect('compressor', { release: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.compressor.release * 1000).toFixed(0)} ms</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Knee</label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={effects.compressor.knee}
                  onChange={(e) => updateEffect('compressor', { knee: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{effects.compressor.knee} dB</span>
              </div>
            </>
          )}
        </div>

        {/* Limiter */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.limiter.enabled}
              onChange={(e) => updateEffect('limiter', { enabled: e.target.checked })}
            />
            <span>Limiter</span>
          </label>
          {effects.limiter.enabled && (
            <>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Threshold</label>
                <input
                  type="range"
                  min="-60"
                  max="0"
                  step="1"
                  value={effects.limiter.threshold}
                  onChange={(e) => updateEffect('limiter', { threshold: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{effects.limiter.threshold} dB</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Release</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={effects.limiter.release}
                  onChange={(e) => updateEffect('limiter', { release: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.limiter.release * 1000).toFixed(0)} ms</span>
              </div>
            </>
          )}
        </div>

        {/* Tape Saturation */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.tapeSaturation.enabled}
              onChange={(e) => updateEffect('tapeSaturation', { enabled: e.target.checked })}
            />
            <span>Tape Saturation</span>
          </label>
          {effects.tapeSaturation.enabled && (
            <>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Drive</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effects.tapeSaturation.drive}
                  onChange={(e) => updateEffect('tapeSaturation', { drive: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.tapeSaturation.drive * 100).toFixed(0)}%</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Bias</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effects.tapeSaturation.bias}
                  onChange={(e) => updateEffect('tapeSaturation', { bias: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.tapeSaturation.bias * 100).toFixed(0)}%</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Amount</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effects.tapeSaturation.amount}
                  onChange={(e) => updateEffect('tapeSaturation', { amount: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.tapeSaturation.amount * 100).toFixed(0)}%</span>
              </div>
            </>
          )}
        </div>

        {/* Bit Crusher */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.bitCrusher.enabled}
              onChange={(e) => updateEffect('bitCrusher', { enabled: e.target.checked })}
            />
            <span>Bit Crusher</span>
          </label>
          {effects.bitCrusher.enabled && (
            <>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Bit Depth</label>
                <input
                  type="range"
                  min="1"
                  max="16"
                  step="1"
                  value={effects.bitCrusher.bits}
                  onChange={(e) => updateEffect('bitCrusher', { bits: parseInt(e.target.value) })}
                />
                <span className={styles.sliderValue}>{effects.bitCrusher.bits} bits</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Sample Rate Reduction</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={effects.bitCrusher.reduction}
                  onChange={(e) => updateEffect('bitCrusher', { reduction: parseInt(e.target.value) })}
                />
                <span className={styles.sliderValue}>{effects.bitCrusher.reduction}x</span>
              </div>
            </>
          )}
        </div>
      </div>
      <button
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary"
        style={{ marginTop: '24px' }}
      >
        {isProcessing ? 'Processing...' : 'Apply Effects'}
      </button>
    </div>
  );
}

