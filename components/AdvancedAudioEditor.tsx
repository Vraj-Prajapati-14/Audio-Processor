'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Upload, Download, Play, Pause, Music, Scissors, RotateCcw, 
  Merge, Radio, Sliders, BarChart3, Volume2, RotateCw, Sparkles
} from 'lucide-react';
import { AudioEffects, defaultEffects, loadAudioFile, processAudio, audioBufferToWav, downloadAudio } from '@/lib/audio-utils';
import { 
  trimAudio, deleteAudioSegment, reverseAudio, applyEQ, mergeAudio, 
  getWaveformData, applyFade,
  EQSettings, MergeSettings, FadeSettings 
} from '@/lib/audio-advanced';
import { allLoFiPresets, LoFiPreset } from '@/lib/lofi-presets';
import LofiGeneratorTab from './generator/LofiGeneratorTab';
import TrimTab from './editing/TrimTab';
import AdvancedMashupTab from './editing/AdvancedMashupTab';
import Loader from './Loader';
import PresetGrid from './presets/PresetGrid';
import AudioEffectsTab from './effects/AudioEffectsTab';
import { generatePresetSchema, generatePresetFAQSchema } from '@/lib/seo';
import styles from './AdvancedAudioEditor.module.css';
import clsx from 'clsx';

type TabType = 'lofi' | 'effects' | 'trim' | 'eq' | 'merge' | 'mashup' | 'tools' | 'generator';

export default function AdvancedAudioEditor() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('lofi');
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [processedAudioTitle, setProcessedAudioTitle] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Processing...');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [trimAction, setTrimAction] = useState<'extract' | 'delete'>('extract');
  const [trimFadeIn, setTrimFadeIn] = useState(false);
  const [trimFadeOut, setTrimFadeOut] = useState(false);

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
  const [fadeSettings, setFadeSettings] = useState<FadeSettings>({ fadeIn: 0, fadeOut: 0 });

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
      // Clean up previous audio URL
      if (originalAudioUrl) {
        URL.revokeObjectURL(originalAudioUrl);
      }
      
      const buffer = await loadAudioFile(selectedFile);
      setFile(selectedFile);
      setAudioBuffer(buffer);
      
      // Create URL for original audio playback
      const url = URL.createObjectURL(selectedFile);
      setOriginalAudioUrl(url);
      
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

      // Apply Lo-Fi preset or custom effects
      if (activeTab === 'lofi' || activeTab === 'effects') {
        processed = await processAudio(processed, effects);
      }

      // Apply trim (extract or delete)
      if (activeTab === 'trim' && (trimStart > 0 || trimEnd < duration)) {
        if (trimAction === 'extract') {
          processed = await trimAudio(processed, trimStart, trimEnd);
        } else {
          processed = await deleteAudioSegment(processed, trimStart, trimEnd);
        }
        
        // Apply fade if requested
        if (trimFadeIn || trimFadeOut) {
          processed = await applyFade(processed, {
            fadeIn: trimFadeIn ? 0.5 : 0,
            fadeOut: trimFadeOut ? 0.5 : 0,
          });
        }
      }

      // Apply EQ
      if (activeTab === 'eq' && (eqSettings.bass !== 0 || eqSettings.mid !== 0 || eqSettings.treble !== 0)) {
        processed = await applyEQ(processed, eqSettings);
      }

      // Apply reverse
      if (activeTab === 'tools' && isReversed) {
        processed = await reverseAudio(processed);
      }

      // Apply fade in/fade out
      if (activeTab === 'tools' && (fadeSettings.fadeIn > 0 || fadeSettings.fadeOut > 0)) {
        processed = await applyFade(processed, fadeSettings);
      }

      // Ensure we have a valid buffer
      if (!processed) {
        throw new Error('Audio processing failed: no buffer returned');
      }

      const wavBlob = audioBufferToWav(processed);
      const url = URL.createObjectURL(wavBlob);
      setProcessedAudioUrl(url);
      
      // Create descriptive title based on active tab
      let title = 'Processed Audio';
      if (activeTab === 'lofi') {
        title = 'Lo-Fi Processed Audio';
      } else if (activeTab === 'effects') {
        title = 'Audio with Effects Applied';
      } else if (activeTab === 'trim') {
        title = 'Trimmed Audio';
      } else if (activeTab === 'eq') {
        title = 'Equalized Audio';
      } else if (activeTab === 'merge') {
        title = 'Merged Audio';
      } else if (activeTab === 'tools') {
        title = 'Processed Audio (Tools Applied)';
      }
      setProcessedAudioTitle(title);
      
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
      setProcessingMessage('Processing...');
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
    setProcessingMessage('Merging audio files...');
    try {
      const buffer2 = await loadAudioFile(mergeFile);
      const merged = await mergeAudio(audioBuffer, buffer2, mergeSettings);
      
      const wavBlob = audioBufferToWav(merged);
      const url = URL.createObjectURL(wavBlob);
      setProcessedAudioUrl(url);
      setProcessedAudioTitle('Merged Audio Files');
      
      setAudioBuffer(merged);
      setDuration(merged.duration);
      setCurrentTime(0);
      drawWaveform(0);
    } catch (error) {
      console.error('Error merging audio:', error);
      alert('Error merging audio');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('Processing...');
    }
  };

  const handleDownload = async () => {
    if (!processedAudioUrl || !file) return;

    // Check authentication
    if (!session) {
      const shouldSignIn = confirm('You need to sign in to download processed audio. Would you like to sign in now?');
      if (shouldSignIn) {
        router.push('/auth/signin?callback=/');
      }
      return;
    }

    // Check subscription and usage limit
    try {
      const usageResponse = await fetch('/api/usage/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'songs' }),
      });

      const usageData = await usageResponse.json();

      if (!usageData.allowed) {
        if (usageData.reason === 'No active subscription') {
          const shouldUpgrade = confirm('You need an active subscription to download audio. Would you like to view our plans?');
          if (shouldUpgrade) {
            router.push('/pricing');
          }
        } else {
          alert(`${usageData.reason}. Please upgrade your plan to continue.`);
          router.push('/pricing');
        }
        return;
      }

      // Proceed with download
      const response = await fetch(processedAudioUrl);
      const blob = await response.blob();
      const newFileName = file.name.replace(/\.[^/.]+$/, '') + '_processed.wav';
      downloadAudio(blob, newFileName);

      // Record usage after successful download
      try {
        await fetch('/api/usage/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'download',
            metadata: {
              fileName: newFileName,
              originalFileName: file.name,
            },
          }),
        });
      } catch (error) {
        console.error('Failed to record usage:', error);
        // Don't block the download if usage recording fails
      }
    } catch (error) {
      console.error('Download error:', error);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'lofi' as TabType, label: 'Lo-Fi Presets', icon: Sparkles },
    { id: 'generator' as TabType, label: 'Lo-Fi Generator', icon: Music },
    { id: 'effects' as TabType, label: 'Effects', icon: Sliders },
    { id: 'trim' as TabType, label: 'Trim/Crop', icon: Scissors },
    { id: 'eq' as TabType, label: 'EQ', icon: Radio },
    { id: 'merge' as TabType, label: 'Merge', icon: Merge },
    { id: 'mashup' as TabType, label: 'Mashup', icon: Music },
    { id: 'tools' as TabType, label: 'Tools', icon: BarChart3 },
  ];

  return (
    <>
      <Loader show={isProcessing} message={processingMessage} />
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

      {/* Tabs - Always visible */}
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

      {audioBuffer && (
        <>
          {/* Hidden audio element for original audio playback (used in trim tab) */}
          {originalAudioUrl && (
            <audio
              ref={originalAudioRef}
              src={originalAudioUrl}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                if (!duration) {
                  setDuration(e.currentTarget.duration);
                }
              }}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
          )}
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
        </>
      )}

      {/* Tab Content */}
      <div className={clsx('glass-card', styles.tabContent)}>
        {!audioBuffer && (
          <div className={styles.noFileMessage}>
            <h3>Upload an audio file to get started</h3>
            <p>Choose a feature from the tabs above to see what you can do:</p>
            <ul className={styles.featureList}>
              <li><strong>Lo-Fi Presets:</strong> Apply instant Lo-Fi vibes with one click</li>
              <li><strong>Lo-Fi Generator:</strong> Generate 2-8 hour seamless Lo-Fi tracks</li>
              <li><strong>Effects:</strong> Apply professional audio effects (reverb, delay, distortion, etc.)</li>
              <li><strong>Trim/Crop:</strong> Cut and extract specific parts from your audio</li>
              <li><strong>EQ:</strong> Adjust bass, mid, and treble frequencies</li>
              <li><strong>Merge:</strong> Combine two audio files with crossfade</li>
              <li><strong>Mashup:</strong> Create professional mashups with multiple files, tempo control, and DJ effects</li>
              <li><strong>Tools:</strong> Reverse audio, apply fades, and more</li>
            </ul>
            <p className={styles.uploadHint}>
              👆 Upload your audio file using the button above to start editing!
            </p>
          </div>
        )}

        {audioBuffer && (
          <>
            {activeTab === 'lofi' && (
              <div className={styles.lofiSection}>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(generatePresetSchema()) }}
                />
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(generatePresetFAQSchema()) }}
                />
                <h1 className={styles.lofiMainTitle}>Lo-Fi Audio Presets - Transform Your Sound</h1>
                <p className={styles.lofiDescription}>
                  Discover 20+ professional Lo-Fi audio presets designed to instantly transform your audio. Perfect for creating chill, nostalgic, or dreamy sounds. Click any preset to apply that Lo-Fi vibe instantly.
                </p>
                <h2 className={styles.lofiSubtitle}>Choose Your Vibe</h2>
                <p className={styles.lofiSubDescription}>
                  Each preset is carefully crafted with unique effect combinations. Use the search bar to find presets by mood, use case, or tags. Click the info button on any preset to learn more about it.
                </p>
                <PresetGrid
                  presets={allLoFiPresets}
                  onApplyPreset={async (preset: LoFiPreset) => {
                    if (!audioBuffer) {
                      alert('Please upload an audio file first');
                      return;
                    }
                    setIsProcessing(true);
                    setProcessingMessage(`Applying ${preset.name} preset...`);
                    try {
                      // Merge preset effects with defaultEffects to ensure all properties exist
                      const mergedEffects: AudioEffects = {
                        lofi: { ...defaultEffects.lofi, ...preset.effects.lofi },
                        reverb: { ...defaultEffects.reverb, ...preset.effects.reverb },
                        delay: { ...defaultEffects.delay, ...preset.effects.delay },
                        distortion: { ...defaultEffects.distortion, ...preset.effects.distortion },
                        pitch: { ...defaultEffects.pitch, ...preset.effects.pitch },
                        lowpass: { ...defaultEffects.lowpass, ...preset.effects.lowpass },
                        highpass: { ...defaultEffects.highpass, ...preset.effects.highpass },
                        volume: { ...defaultEffects.volume, ...preset.effects.volume },
                        compressor: defaultEffects.compressor,
                        limiter: defaultEffects.limiter,
                        tapeSaturation: defaultEffects.tapeSaturation,
                        bitCrusher: defaultEffects.bitCrusher,
                        sidechain: defaultEffects.sidechain,
                      };
                      setEffects(mergedEffects);
                      const processed = await processAudio(audioBuffer, mergedEffects);
                      const wavBlob = audioBufferToWav(processed);
                      const url = URL.createObjectURL(wavBlob);
                      setProcessedAudioUrl(url);
                      const newBuffer = await loadAudioFile(new File([wavBlob], 'processed.wav', { type: 'audio/wav' }));
                      setAudioBuffer(newBuffer);
                      setCurrentTime(0);
                      setTimeout(() => drawWaveform(0), 100);
                    } catch (error) {
                      console.error('Error applying preset:', error);
                      alert('Error applying preset');
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  isProcessing={isProcessing}
                />
                <h3 className={styles.lofiSectionTitle}>Popular Presets</h3>
                <p className={styles.lofiSectionDescription}>
                  These are some of our most popular Lo-Fi presets, perfect for studying, relaxing, or creating nostalgic vibes.
                </p>
              </div>
            )}

            {activeTab === 'trim' && (
              <TrimTab
                trimStart={trimStart}
                trimEnd={trimEnd}
                duration={duration}
                audioBuffer={audioBuffer}
                onTrimStartChange={setTrimStart}
                onTrimEndChange={setTrimEnd}
                onProcess={handleProcess}
                isProcessing={isProcessing}
                isPlaying={isPlaying}
                currentTime={currentTime}
                onPlayPause={() => {
                  const audio = originalAudioRef.current || audioRef.current;
                  if (isPlaying) {
                    audio?.pause();
                  } else {
                    audio?.play();
                  }
                  setIsPlaying(!isPlaying);
                }}
                onSeek={(time) => {
                  const audio = originalAudioRef.current || audioRef.current;
                  if (audio) {
                    audio.currentTime = time;
                    setCurrentTime(time);
                  }
                }}
                onExport={() => {
                  // Handle export (format can be used later for different export formats)
                  handleProcess();
                }}
                action={trimAction}
                fadeIn={trimFadeIn}
                fadeOut={trimFadeOut}
                onActionChange={setTrimAction}
                onFadeInChange={setTrimFadeIn}
                onFadeOutChange={setTrimFadeOut}
              />
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

            {activeTab === 'mashup' && (
              <AdvancedMashupTab
                onGenerateComplete={(url, title) => {
                  setProcessedAudioUrl(url);
                  setProcessedAudioTitle(title);
                  const audio = new Audio(url);
                  audio.addEventListener('loadedmetadata', () => {
                    setDuration(audio.duration);
                  });
                }}
                onError={(error) => {
                  alert(error);
                }}
                onProcessingChange={(processing, message) => {
                  setIsProcessing(processing);
                  setProcessingMessage(message || 'Processing...');
                }}
              />
            )}

            {activeTab === 'tools' && (
              <div className={styles.toolsSection}>
                <h3>Audio Tools</h3>
                
                {/* Fade In/Out Controls */}
                <div className={styles.fadeSection}>
                  <h4>Fade In / Fade Out</h4>
                  <div className={styles.fadeControls}>
                    <div className={styles.fadeControl}>
                      <label>Fade In (seconds)</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={fadeSettings.fadeIn}
                        onChange={(e) => setFadeSettings({ ...fadeSettings, fadeIn: parseFloat(e.target.value) })}
                      />
                      <span>{fadeSettings.fadeIn.toFixed(1)}s</span>
                    </div>
                    <div className={styles.fadeControl}>
                      <label>Fade Out (seconds)</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={fadeSettings.fadeOut}
                        onChange={(e) => setFadeSettings({ ...fadeSettings, fadeOut: parseFloat(e.target.value) })}
                      />
                      <span>{fadeSettings.fadeOut.toFixed(1)}s</span>
                    </div>
                  </div>
                </div>

                {/* Reverse Audio */}
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

                {/* Apply Button */}
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="btn btn-primary"
                  style={{ marginTop: '24px' }}
                >
                  {isProcessing ? 'Processing...' : 'Apply Tools'}
                </button>
              </div>
            )}

            {activeTab === 'generator' && (
              <LofiGeneratorTab
                onGenerateComplete={(url, title) => {
                  setProcessedAudioUrl(url);
                  setProcessedAudioTitle(title);
                  setCurrentTime(0);
                  // Load as audio buffer for waveform
                  const audio = new Audio(url);
                  audio.onloadedmetadata = () => {
                    setDuration(audio.duration);
                  };
                }}
                onError={(error) => alert(error)}
                onProcessingChange={(isProcessing, message) => {
                  setIsProcessing(isProcessing);
                  setProcessingMessage(message || 'Processing...');
                }}
              />
            )}

            {activeTab === 'effects' && (
              <AudioEffectsTab
                effects={effects}
                updateEffect={updateEffect}
                resetEffects={resetEffects}
                isProcessing={isProcessing}
                onProcess={handleProcess}
              />
            )}

            {/* OLD EFFECTS CODE - REMOVED - Using AudioEffectsTab component instead */}
            {false && activeTab === 'effects' && (
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

        {/* Sidechain Compression */}
        <div className={styles.effectCard}>
          <label className={styles.effectLabel}>
            <input
              type="checkbox"
              checked={effects.sidechain.enabled}
              onChange={(e) => updateEffect('sidechain', { enabled: e.target.checked })}
            />
            <span>Sidechain Compression</span>
          </label>
          {effects.sidechain.enabled && (
            <>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Threshold</label>
                <input
                  type="range"
                  min="-60"
                  max="0"
                  step="1"
                  value={effects.sidechain.threshold}
                  onChange={(e) => updateEffect('sidechain', { threshold: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{effects.sidechain.threshold} dB</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Ratio</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={effects.sidechain.ratio}
                  onChange={(e) => updateEffect('sidechain', { ratio: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{effects.sidechain.ratio}:1</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Attack</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={effects.sidechain.attack}
                  onChange={(e) => updateEffect('sidechain', { attack: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.sidechain.attack * 1000).toFixed(0)} ms</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Release</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effects.sidechain.release}
                  onChange={(e) => updateEffect('sidechain', { release: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.sidechain.release * 1000).toFixed(0)} ms</span>
              </div>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>Depth</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effects.sidechain.depth}
                  onChange={(e) => updateEffect('sidechain', { depth: parseFloat(e.target.value) })}
                />
                <span className={styles.sliderValue}>{(effects.sidechain.depth * 100).toFixed(0)}%</span>
              </div>
            </>
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
          </>
        )}

      {/* Audio Player */}
      {processedAudioUrl && audioBuffer && (
            <div className={clsx('glass-card', styles.playerSection)}>
              <div className={styles.playerHeader}>
                <Music size={20} />
                <h3>{processedAudioTitle || 'Processed Audio'}</h3>
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
      </div>
    </div>
    </>
  );
}

