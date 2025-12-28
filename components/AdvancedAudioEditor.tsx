'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, Play, Pause, Music, Scissors, RotateCcw, 
  Merge, Radio, Sliders, BarChart3, Volume2, RotateCw
} from 'lucide-react';
import { AudioEffects, defaultEffects, loadAudioFile, processAudio, audioBufferToWav, downloadAudio } from '@/lib/audio-utils';
import { 
  trimAudio, reverseAudio, applyEQ, mergeAudio, 
  getWaveformData, EQSettings, MergeSettings 
} from '@/lib/audio-advanced';
import styles from './AdvancedAudioEditor.module.css';
import clsx from 'clsx';

type TabType = 'effects' | 'trim' | 'eq' | 'merge' | 'tools';

export default function AdvancedAudioEditor() {
  const [activeTab, setActiveTab] = useState<TabType>('effects');
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // EQ state
  const [eqSettings, setEqSettings] = useState<EQSettings>({ bass: 0, mid: 0, treble: 0 });

  // Merge state
  const [mergeFile, setMergeFile] = useState<File | null>(null);
  const [mergeSettings, setMergeSettings] = useState<MergeSettings>({ 
    crossfade: 0, 
    volume1: 1, 
    volume2: 1 
  });

  // Tools state
  const [isReversed, setIsReversed] = useState(false);

  // Effects state
  const [effects, setEffects] = useState<AudioEffects>(defaultEffects);

  useEffect(() => {
    if (audioBuffer) {
      const dur = audioBuffer.duration;
      setDuration(dur);
      setTrimEnd(dur);
      drawWaveform(currentTime);
    }
  }, [audioBuffer]);

  // Update waveform with progress line
  useEffect(() => {
    if (audioBuffer) {
      drawWaveform(currentTime);
    }
  }, [currentTime, audioBuffer]);


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Supported audio file extensions
    const supportedExtensions = ['.mp3', '.mpeg', '.mpga', '.m4a', '.wav', '.ogg', '.oga', '.flac', '.aac', '.wma', '.opus', '.webm', '.3gp', '.amr', '.aiff', '.au', '.ra'];
    // Supported MIME types
    const supportedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-mpeg', 'audio/x-mpeg-3', 'video/mpeg', 'video/mp4'];
    
    const fileExtension = selectedFile.name.toLowerCase().includes('.') 
      ? selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'))
      : '';
    
    // Check if it's an audio file (by type or extension)
    const isAudioFile = selectedFile.type.startsWith('audio/') || 
                        selectedFile.type.startsWith('video/') ||
                        supportedMimeTypes.includes(selectedFile.type) ||
                        supportedExtensions.includes(fileExtension);
    
    if (!isAudioFile) {
      alert('Please select a supported audio file. Supported formats: MP3, MPEG, M4A, WAV, OGG, FLAC, AAC, WMA, OPUS, WEBM, and more.');
      return;
    }

    try {
      const buffer = await loadAudioFile(selectedFile);
      setFile(selectedFile);
      setAudioBuffer(buffer);
      setProcessedAudioUrl(null);
      setTrimStart(0);
      setTrimEnd(buffer.duration);
      setEffects(defaultEffects); // Reset effects when new file is loaded
      setEqSettings({ bass: 0, mid: 0, treble: 0 }); // Reset EQ
      setIsReversed(false); // Reset reverse
    } catch (error) {
      alert('Error loading audio file. Please make sure it is a valid audio file.');
    }
  };

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
    const max = Math.max(...waveform, 0.01); // Prevent division by zero
    
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
      
      // Draw a vertical line at the progress position
      ctx.strokeStyle = '#10b981'; // Green color for progress line
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();
      
      // Draw a small circle at the top of the progress line
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(progressX, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw a small circle at the bottom of the progress line
      ctx.beginPath();
      ctx.arc(progressX, height - 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };


  const handleProcess = async () => {
    if (!audioBuffer) return;

    setIsProcessing(true);
    try {
      let processed = audioBuffer;

      // Apply effects (lofi, reverb, delay, etc.)
      if (activeTab === 'effects') {
        processed = await processAudio(processed, effects);
      }

      // Apply trim
      if (activeTab === 'trim' && (trimStart > 0 || trimEnd < duration)) {
        processed = await trimAudio(processed, trimStart, trimEnd);
      }

      // Apply EQ
      if (activeTab === 'eq' && (eqSettings.bass !== 0 || eqSettings.mid !== 0 || eqSettings.treble !== 0)) {
        processed = await applyEQ(processed, eqSettings);
      }

      // Apply reverse
      if (activeTab === 'tools' && isReversed) {
        processed = await reverseAudio(processed);
      }

      const wavBlob = audioBufferToWav(processed);
      const url = URL.createObjectURL(wavBlob);
      setProcessedAudioUrl(url);
      
      // Update buffer for next operations
      const newBuffer = await loadAudioFile(new File([wavBlob], 'processed.wav', { type: 'audio/wav' }));
      setAudioBuffer(newBuffer);
      setCurrentTime(0);
      setTimeout(() => drawWaveform(0), 100); // Small delay to ensure buffer is set
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio');
    } finally {
      setIsProcessing(false);
    }
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

  const handleMerge = async () => {
    if (!audioBuffer || !mergeFile) return;

    setIsProcessing(true);
    try {
      const buffer2 = await loadAudioFile(mergeFile);
      const merged = await mergeAudio(audioBuffer, buffer2, mergeSettings);
      
      const wavBlob = audioBufferToWav(merged);
      const url = URL.createObjectURL(wavBlob);
      setProcessedAudioUrl(url);
      
      setAudioBuffer(merged);
      setDuration(merged.duration);
      setCurrentTime(0);
      drawWaveform(0);
    } catch (error) {
      console.error('Error merging audio:', error);
      alert('Error merging audio');
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
      alert('Error downloading audio');
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'effects' as TabType, label: 'Effects', icon: Sliders },
    { id: 'trim' as TabType, label: 'Trim/Crop', icon: Scissors },
    { id: 'eq' as TabType, label: 'EQ', icon: Radio },
    { id: 'merge' as TabType, label: 'Merge', icon: Merge },
    { id: 'tools' as TabType, label: 'Tools', icon: BarChart3 },
  ];

  return (
    <div className={styles.container}>
      {/* File Upload */}
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
            <span>{file ? file.name : 'Choose Audio File'}</span>
            {file && (
              <span className={styles.fileInfo}>
                {formatTime(duration)} • {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </label>
          <p className={styles.supportedFormats}>
            Supported: MP3, MPEG, M4A, WAV, OGG, FLAC, AAC, WMA, OPUS, WEBM, 3GP, AMR, AIFF, AU, RA
          </p>
        </div>
      </div>

      {audioBuffer && (
        <>
          {/* Waveform Visualization */}
          <div className={clsx('glass-card', styles.waveformSection)}>
            <canvas 
              ref={canvasRef} 
              className={styles.waveformCanvas} 
              width={800} 
              height={100}
              onClick={(e) => {
                if (!audioBuffer || !audioRef.current || !canvasRef.current) return;
                const canvas = canvasRef.current;
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percent = x / canvas.width;
                const newTime = percent * duration;
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
                  setCurrentTime(audioRef.current.currentTime);
                }
              }}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(styles.tab, activeTab === tab.id && styles.tabActive)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className={clsx('glass-card', styles.tabContent)}>
            {activeTab === 'trim' && (
              <div className={styles.trimSection}>
                <h3>Trim/Crop Audio</h3>
                <div className={styles.trimControls}>
                  <div className={styles.timeControl}>
                    <label>Start Time (s)</label>
                    <input
                      type="number"
                      min="0"
                      max={duration}
                      step="0.1"
                      value={trimStart.toFixed(1)}
                      onChange={(e) => setTrimStart(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className={styles.timeControl}>
                    <label>End Time (s)</label>
                    <input
                      type="number"
                      min="0"
                      max={duration}
                      step="0.1"
                      value={trimEnd.toFixed(1)}
                      onChange={(e) => setTrimEnd(parseFloat(e.target.value) || duration)}
                    />
                  </div>
                </div>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="btn btn-primary"
                >
                  {isProcessing ? 'Processing...' : 'Apply Trim'}
                </button>
              </div>
            )}

            {activeTab === 'eq' && (
              <div className={styles.eqSection}>
                <h3>Equalizer (Bass, Mid, Treble)</h3>
                <div className={styles.eqControls}>
                  <div className={styles.eqControl}>
                    <label>Bass</label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={eqSettings.bass}
                      onChange={(e) => setEqSettings({ ...eqSettings, bass: parseFloat(e.target.value) })}
                    />
                    <span>{eqSettings.bass > 0 ? '+' : ''}{eqSettings.bass} dB</span>
                  </div>
                  <div className={styles.eqControl}>
                    <label>Mid</label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={eqSettings.mid}
                      onChange={(e) => setEqSettings({ ...eqSettings, mid: parseFloat(e.target.value) })}
                    />
                    <span>{eqSettings.mid > 0 ? '+' : ''}{eqSettings.mid} dB</span>
                  </div>
                  <div className={styles.eqControl}>
                    <label>Treble</label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={eqSettings.treble}
                      onChange={(e) => setEqSettings({ ...eqSettings, treble: parseFloat(e.target.value) })}
                    />
                    <span>{eqSettings.treble > 0 ? '+' : ''}{eqSettings.treble} dB</span>
                  </div>
                </div>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="btn btn-primary"
                >
                  {isProcessing ? 'Processing...' : 'Apply EQ'}
                </button>
              </div>
            )}

            {activeTab === 'merge' && (
              <div className={styles.mergeSection}>
                <h3>Merge Audio Files</h3>
                <div className={styles.mergeUpload}>
                  <input
                    type="file"
                    id="merge-upload"
                    accept="audio/*,.mp3,.mpeg,.mpga,.m4a,.wav,.ogg,.oga,.flac,.aac,.wma,.opus,.webm,.3gp,.amr,.aiff,.au,.ra"
                    onChange={(e) => setMergeFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="merge-upload" className="btn btn-secondary">
                    <Upload size={18} />
                    Select Second File
                  </label>
                  {mergeFile && <span>{mergeFile.name}</span>}
                </div>
                <div className={styles.mergeControls}>
                  <div className={styles.mergeControl}>
                    <label>Crossfade (s)</label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={mergeSettings.crossfade}
                      onChange={(e) => setMergeSettings({ ...mergeSettings, crossfade: parseFloat(e.target.value) })}
                    />
                    <span>{mergeSettings.crossfade.toFixed(1)}s</span>
                  </div>
                  <div className={styles.mergeControl}>
                    <label>File 1 Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={mergeSettings.volume1}
                      onChange={(e) => setMergeSettings({ ...mergeSettings, volume1: parseFloat(e.target.value) })}
                    />
                    <span>{(mergeSettings.volume1 * 100).toFixed(0)}%</span>
                  </div>
                  <div className={styles.mergeControl}>
                    <label>File 2 Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={mergeSettings.volume2}
                      onChange={(e) => setMergeSettings({ ...mergeSettings, volume2: parseFloat(e.target.value) })}
                    />
                    <span>{(mergeSettings.volume2 * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <button
                  onClick={handleMerge}
                  disabled={isProcessing || !mergeFile}
                  className="btn btn-primary"
                >
                  {isProcessing ? 'Merging...' : 'Merge Audio'}
                </button>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className={styles.toolsSection}>
                <h3>Audio Tools</h3>
                <div className={styles.toolsGrid}>
                  <button
                    onClick={async () => {
                      if (!audioBuffer) return;
                      setIsProcessing(true);
                      try {
                        const reversed = await reverseAudio(audioBuffer);
                        const wavBlob = audioBufferToWav(reversed);
                        const url = URL.createObjectURL(wavBlob);
                        setProcessedAudioUrl(url);
                        setAudioBuffer(reversed);
                        setIsReversed(!isReversed);
                      } catch (error) {
                        alert('Error reversing audio');
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                    className="btn btn-secondary"
                  >
                    <RotateCw size={20} />
                    Reverse Audio
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'effects' && (
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
                </div>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="btn btn-primary"
                  style={{ marginTop: '24px' }}
                >
                  {isProcessing ? 'Processing...' : 'Apply Effects'}
                </button>
              </div>
            )}
          </div>

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
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => setIsPlaying(false)}
              />
              <div className={styles.playerControls}>
                <button onClick={handlePlayPause} className="btn btn-primary">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className={styles.progressContainer}>
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={duration ? currentTime : 0}
                    onChange={(e) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = parseFloat(e.target.value);
                      }
                    }}
                    className={styles.progressBar}
                    step="0.1"
                  />
                  <span>{formatTime(duration)}</span>
                </div>
                <button onClick={handleDownload} className="btn btn-primary">
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

