'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Download, Music } from 'lucide-react';
import { downloadAudio } from '@/lib/audio-utils';
import styles from './AudioPlayer.module.css';
import clsx from 'clsx';

interface AudioPlayerProps {
  audioUrl: string | null;
  fileName: string | null;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}

export default function AudioPlayer({
  audioUrl,
  fileName,
  onTimeUpdate,
  onDurationChange,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = parseFloat(e.target.value);
    }
  };

  const handleDownload = async () => {
    if (!audioUrl || !fileName) return;
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const newFileName = fileName.replace(/\.[^/.]+$/, '') + '_processed.wav';
      downloadAudio(blob, newFileName);
    } catch (error) {
      alert('Error downloading audio');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  return (
    <div className={clsx('glass-card', styles.playerSection)}>
      <div className={styles.playerHeader}>
        <Music size={20} />
        <h3>Processed Audio</h3>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => onDurationChange(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className={styles.playerControls}>
        <button onClick={handlePlayPause} className="btn btn-primary">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className={styles.progressContainer}>
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <input
            type="range"
            min="0"
            max={audioRef.current?.duration || 100}
            value={audioRef.current?.currentTime || 0}
            onChange={handleSeek}
            className={styles.progressBar}
            step="0.1"
          />
          <span>{formatTime(audioRef.current?.duration || 0)}</span>
        </div>
        <button onClick={handleDownload} className="btn btn-primary">
          <Download size={18} />
          Download
        </button>
      </div>
    </div>
  );
}

