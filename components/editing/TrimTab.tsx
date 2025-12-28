'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import { getWaveformData } from '@/lib/audio-advanced';
import styles from './TrimTab.module.css';

interface TrimTabProps {
  trimStart: number;
  trimEnd: number;
  duration: number;
  audioBuffer: AudioBuffer | null;
  onTrimStartChange: (value: number) => void;
  onTrimEndChange: (value: number) => void;
  onProcess: () => void;
  isProcessing: boolean;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onExport?: (format: string) => void;
  onActionChange?: (action: 'extract' | 'delete') => void;
  onFadeInChange?: (fadeIn: boolean) => void;
  onFadeOutChange?: (fadeOut: boolean) => void;
  action?: 'extract' | 'delete';
  fadeIn?: boolean;
  fadeOut?: boolean;
}

export default function TrimTab({
  trimStart,
  trimEnd,
  duration,
  audioBuffer,
  onTrimStartChange,
  onTrimEndChange,
  onProcess,
  isProcessing,
  isPlaying,
  currentTime,
  onPlayPause,
  onSeek,
  onExport,
  onActionChange,
  onFadeInChange,
  onFadeOutChange,
  action: propAction = 'extract',
  fadeIn: propFadeIn = false,
  fadeOut: propFadeOut = false,
}: TrimTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [action, setAction] = useState<'extract' | 'delete'>(propAction);
  const [fadeIn, setFadeIn] = useState(propFadeIn);
  const [fadeOut, setFadeOut] = useState(propFadeOut);
  const [outputFormat, setOutputFormat] = useState('wav');
  const [waveformWidth, setWaveformWidth] = useState(800);

  // Sync with props
  useEffect(() => {
    setAction(propAction);
  }, [propAction]);

  useEffect(() => {
    setFadeIn(propFadeIn);
  }, [propFadeIn]);

  useEffect(() => {
    setFadeOut(propFadeOut);
  }, [propFadeOut]);

  // Calculate output duration
  const outputDuration = action === 'extract' 
    ? Math.max(0, trimEnd - trimStart)
    : duration - Math.max(0, trimEnd - trimStart);

  useEffect(() => {
    if (containerRef.current) {
      setWaveformWidth(containerRef.current.offsetWidth - 40);
    }
  }, []);

  const drawWaveform = useCallback(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Get waveform data
    const waveform = getWaveformData(audioBuffer, Math.floor(width / 2));
    const max = Math.max(...waveform, 0.01);

    // Calculate positions
    const startPercent = trimStart / duration;
    const endPercent = trimEnd / duration;
    const startX = startPercent * width;
    const endX = endPercent * width;

    // Draw unselected waveform (gray)
    waveform.forEach((value, index) => {
      const x = (index / waveform.length) * width;
      const barHeight = (value / max) * height * 0.8;
      const centerY = height / 2;

      // Determine if this bar is in the selected region
      const isSelected = x >= startX && x <= endX;

      if (!isSelected) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x, centerY - barHeight / 2, 2, barHeight);
      }
    });

    // Draw selected waveform (blue highlight)
    waveform.forEach((value, index) => {
      const x = (index / waveform.length) * width;
      const barHeight = (value / max) * height * 0.8;
      const centerY = height / 2;

      const isSelected = x >= startX && x <= endX;

      if (isSelected) {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x, centerY - barHeight / 2, 2, barHeight);
      }
    });

    // Draw selection handles
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(startX - 2, 0, 4, height);
    ctx.fillRect(endX - 2, 0, 4, height);

    // Draw handle indicators
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX - 5, 8);
    ctx.lineTo(startX + 5, 8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX - 5, 8);
    ctx.lineTo(endX + 5, 8);
    ctx.closePath();
    ctx.fill();

    // Draw progress line (always show, even at 0)
    const progressX = (currentTime / duration) * width;
    ctx.strokeStyle = '#fbbf24'; // Yellow to match the image
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
    
    // Add a small indicator on top of progress line
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(progressX, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw time markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i <= Math.floor(duration); i += 10) {
      const x = (i / duration) * width;
      if (x >= 0 && x <= width) {
        ctx.fillRect(x - 0.5, height - 15, 1, 5);
        const minutes = Math.floor(i / 60);
        const seconds = i % 60;
        ctx.fillText(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
          x,
          height - 5
        );
      }
    }
  }, [audioBuffer, trimStart, trimEnd, currentTime, duration, waveformWidth]);

  // Redraw waveform when any relevant state changes
  useEffect(() => {
    if (audioBuffer && canvasRef.current) {
      drawWaveform();
    }
  }, [audioBuffer, trimStart, trimEnd, currentTime, waveformWidth, duration, drawWaveform]);

  // Continuously redraw during playback for smooth progress line
  useEffect(() => {
    if (!isPlaying || !audioBuffer) {
      // Still redraw once when paused to show current position
      if (audioBuffer && canvasRef.current) {
        drawWaveform();
      }
      return;
    }

    let animationFrameId: number;
    let isActive = true;
    
    const update = () => {
      if (!isActive || !canvasRef.current || !audioBuffer) return;
      drawWaveform();
      if (isPlaying) {
        animationFrameId = requestAnimationFrame(update);
      }
    };
    animationFrameId = requestAnimationFrame(update);

    return () => {
      isActive = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, audioBuffer, drawWaveform, currentTime]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !duration) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / canvas.width;
    const time = percent * duration;

    const startX = (trimStart / duration) * canvas.width;
    const endX = (trimEnd / duration) * canvas.width;

    // Check if clicking near start handle
    if (Math.abs(x - startX) < 10) {
      setIsDragging('start');
    }
    // Check if clicking near end handle
    else if (Math.abs(x - endX) < 10) {
      setIsDragging('end');
    }
    // Otherwise, set "From" time to clicked position and seek
    else {
      // Set "From" time to the clicked position
      const newStart = Math.max(0, Math.min(time, trimEnd - 0.1));
      onTrimStartChange(newStart);
      // Also seek to that position
      onSeek(time);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !duration || !isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / canvas.width));
    const time = percent * duration;

    if (isDragging === 'start') {
      onTrimStartChange(Math.max(0, Math.min(time, trimEnd - 0.1)));
    } else if (isDragging === 'end') {
      onTrimEndChange(Math.max(trimStart + 0.1, Math.min(time, duration)));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.trimContainer}>
      {/* Waveform Section */}
      <div className={styles.waveformSection} ref={containerRef}>
        <canvas
          ref={canvasRef}
          width={waveformWidth}
          height={120}
          className={styles.waveformCanvas}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Play Controls */}
      <div className={styles.playControls}>
        <button
          onClick={onPlayPause}
          className={styles.playButton}
          disabled={!audioBuffer}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className={styles.timeDisplay}>
          <span>{formatDuration(currentTime)}</span>
          <span className={styles.timeSeparator}>/</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls Panel */}
      <div className={styles.controlsPanel}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Action</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="action"
                value="extract"
                checked={action === 'extract'}
                onChange={(e) => {
                  const newAction = e.target.value as 'extract' | 'delete';
                  setAction(newAction);
                  onActionChange?.(newAction);
                }}
              />
              <span>Extract Selected</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="action"
                value="delete"
                checked={action === 'delete'}
                onChange={(e) => {
                  const newAction = e.target.value as 'extract' | 'delete';
                  setAction(newAction);
                  onActionChange?.(newAction);
                }}
              />
              <span>Delete Selected</span>
            </label>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Cut from</label>
          <div className={styles.timeInputs}>
            <div className={styles.timeInput}>
              <label>From</label>
              <input
                type="text"
                value={formatTime(trimStart)}
                onChange={(e) => {
                  const timeStr = e.target.value.replace(/:/g, '').replace(/\./g, '');
                  const mins = parseInt(timeStr.slice(0, 2)) || 0;
                  const secs = parseInt(timeStr.slice(2, 4)) || 0;
                  const ms = parseInt(timeStr.slice(4, 6)) || 0;
                  const time = mins * 60 + secs + ms / 100;
                  onTrimStartChange(Math.max(0, Math.min(time, trimEnd - 0.1)));
                }}
              />
            </div>
            <div className={styles.timeInput}>
              <label>To</label>
              <input
                type="text"
                value={formatTime(trimEnd)}
                onChange={(e) => {
                  const timeStr = e.target.value.replace(/:/g, '').replace(/\./g, '');
                  const mins = parseInt(timeStr.slice(0, 2)) || 0;
                  const secs = parseInt(timeStr.slice(2, 4)) || 0;
                  const ms = parseInt(timeStr.slice(4, 6)) || 0;
                  const time = mins * 60 + secs + ms / 100;
                  onTrimEndChange(Math.max(trimStart + 0.1, Math.min(time, duration)));
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Fade Options</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={fadeIn}
                onChange={(e) => {
                  setFadeIn(e.target.checked);
                  onFadeInChange?.(e.target.checked);
                }}
              />
              <span>Fade in</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={fadeOut}
                onChange={(e) => {
                  setFadeOut(e.target.checked);
                  onFadeOutChange?.(e.target.checked);
                }}
              />
              <span>Fade out</span>
            </label>
          </div>
        </div>
      </div>

      {/* Output Summary */}
      <div className={styles.outputSummary}>
        <div className={styles.outputInfo}>
          <div className={styles.outputItem}>
            <span className={styles.outputLabel}>Final output:</span>
            <span className={styles.outputValue}>{formatDuration(outputDuration)}</span>
          </div>
          <div className={styles.outputItem}>
            <span className={styles.outputLabel}>Format:</span>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className={styles.formatSelect}
            >
              <option value="wav">WAV</option>
              <option value="mp3">MP3</option>
              <option value="ogg">OGG</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            if (onExport) {
              onExport(outputFormat);
            } else {
              onProcess();
            }
          }}
          disabled={isProcessing || !audioBuffer}
          className={styles.exportButton}
        >
          <Download size={18} />
          Export
        </button>
      </div>
    </div>
  );
}
