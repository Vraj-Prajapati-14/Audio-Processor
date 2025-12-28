'use client';

import { useState, useRef } from 'react';
import { Upload, Download, Play, Pause, RotateCcw, Music } from 'lucide-react';
import { AudioEffects, defaultEffects, loadAudioFile, processAudio, audioBufferToWav, downloadAudio } from '@/lib/audio-utils';
import styles from './AudioProcessor.module.css';
import clsx from 'clsx';

export default function AudioProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [effects, setEffects] = useState<AudioEffects>(defaultEffects);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Supported audio file extensions
    const supportedExtensions = ['.mp3', '.mpeg', '.mpga', '.m4a', '.wav', '.ogg', '.oga', '.flac', '.aac', '.wma', '.opus', '.webm', '.3gp', '.amr', '.aiff', '.au', '.ra'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    // Check if it's an audio file (by type or extension)
    const isAudioFile = selectedFile.type.startsWith('audio/') || supportedExtensions.includes(fileExtension);
    
    if (!isAudioFile) {
      alert('Please select a supported audio file. Supported formats: MP3, MPEG, M4A, WAV, OGG, FLAC, AAC, WMA, OPUS, WEBM, and more.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setProcessedAudioUrl(null);
    
    // Reset effects
    setEffects(defaultEffects);
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const audioBuffer = await loadAudioFile(file);
      const processedBuffer = await processAudio(audioBuffer, effects);
      const wavBlob = audioBufferToWav(processedBuffer);
      const url = URL.createObjectURL(wavBlob);
      setProcessedAudioUrl(url);

      // Update audio element
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!processedAudioUrl || !file) return;
    
    try {
      const response = await fetch(processedAudioUrl);
      const blob = await response.blob();
      const newFileName = file.name.replace(/\.[^/.]+$/, '') + '_processed.wav';
      downloadAudio(blob, newFileName);
    } catch (error) {
      console.error('Error downloading audio:', error);
      alert('Error downloading audio. Please try again.');
    }
  };

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
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const updateEffect = <K extends keyof AudioEffects>(
    effectType: K,
    updates: Partial<AudioEffects[K]>
  ) => {
    setEffects((prev) => ({
      ...prev,
      [effectType]: { ...prev[effectType], ...updates },
    }));
  };

  const resetEffects = () => {
    setEffects(defaultEffects);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      {/* File Upload Section */}
      <div className={clsx('glass-card', styles.uploadSection)}>
        <div className={styles.uploadArea}>
          <input
            type="file"
            id="audio-upload"
            accept="audio/*,.mp3,.mpeg,.mpga,.m4a,.wav,.ogg,.oga,.flac,.aac,.wma,.opus,.webm,.3gp,.amr,.aiff,.au,.ra"
            onChange={handleFileSelect}
          />
          <label htmlFor="audio-upload" className={styles.uploadLabel}>
            <Upload size={32} />
            <span>{fileName || 'Choose Audio File'}</span>
            {file && (
              <span className={styles.fileInfo}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </label>
          <p className={styles.supportedFormats}>
            Supported formats: MP3, MPEG, M4A, WAV, OGG, FLAC, AAC, WMA, OPUS, WEBM, 3GP, AMR, AIFF, AU, RA
          </p>
        </div>

        {file && (
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className={clsx('btn', 'btn-primary', styles.processBtn)}
          >
            {isProcessing ? 'Processing...' : 'Process Audio'}
          </button>
        )}
      </div>

      {/* Effects Controls */}
      {file && (
        <div className={clsx('glass-card', styles.effectsSection)}>
          <div className={styles.sectionHeader}>
            <h2>Audio Effects</h2>
            <button
              onClick={resetEffects}
              className={clsx('btn', 'btn-secondary', 'btn-icon')}
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
          </div>
        </div>
      )}

      {/* Audio Player */}
      {processedAudioUrl && (
        <div className={clsx('glass-card', styles.playerSection)}>
          <div className={styles.playerHeader}>
            <Music size={20} />
            <h3>Processed Audio</h3>
          </div>
          <audio
            ref={audioRef}
            src={processedAudioUrl}
            onTimeUpdate={(e) => {
              const audio = e.currentTarget;
              setCurrentTime(audio.currentTime);
              setDuration(audio.duration || 0);
            }}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration);
            }}
            onEnded={() => setIsPlaying(false)}
          />
          <div className={styles.playerControls}>
            <button
              onClick={handlePlayPause}
              className={clsx('btn', 'btn-primary', styles.playBtn)}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className={styles.progressContainer}>
              <div className={styles.timeDisplay}>
                <span>{formatTime(currentTime)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={duration ? currentTime : 0}
                onChange={handleSeek}
                className={styles.progressBar}
                step="0.1"
                disabled={!duration}
              />
              <div className={styles.timeDisplay}>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className={clsx('btn', 'btn-primary', styles.downloadBtn)}
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

