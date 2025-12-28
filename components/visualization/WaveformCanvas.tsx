'use client';

import { useRef, useEffect } from 'react';
import { getWaveformData } from '@/lib/audio-advanced';
import styles from './WaveformCanvas.module.css';
import clsx from 'clsx';

interface WaveformCanvasProps {
  audioBuffer: AudioBuffer | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function WaveformCanvas({
  audioBuffer,
  currentTime,
  duration,
  onSeek,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawWaveform = (progressTime?: number) => {
    if (!audioBuffer || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw waveform bars
    ctx.fillStyle = '#6366f1';
    const waveform = getWaveformData(audioBuffer, width);
    const max = Math.max(...waveform, 0.01);
    
    waveform.forEach((value, index) => {
      const barHeight = (value / max) * height * 0.8;
      const x = index;
      const y = (height - barHeight) / 2;
      ctx.fillRect(x, y, 1, barHeight);
    });
    
    // Draw progress line
    if (progressTime !== undefined && duration > 0) {
      const progressPercent = progressTime / duration;
      const progressX = progressPercent * width;
      
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();
      
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(progressX, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(progressX, height - 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    if (audioBuffer) {
      drawWaveform(currentTime);
    }
  }, [currentTime, audioBuffer, duration]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioBuffer || !canvasRef.current || duration === 0) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / canvas.width;
    const newTime = percent * duration;
    onSeek(Math.max(0, Math.min(newTime, duration)));
  };

  return (
    <div className={clsx('glass-card', styles.waveformSection)}>
      <canvas 
        ref={canvasRef} 
        className={styles.waveformCanvas} 
        width={800} 
        height={100}
        onClick={handleCanvasClick}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}

