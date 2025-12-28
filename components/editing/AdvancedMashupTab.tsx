'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Play, Pause, Trash2, GripVertical, Music, Download, Volume2, Sliders } from 'lucide-react';
import { loadAudioFile, audioBufferToWav } from '@/lib/audio-utils';
import { getWaveformData, trimAudio } from '@/lib/audio-advanced';
import styles from './AdvancedMashupTab.module.css';

export interface MashupSegment {
  id: string;
  file: File;
  audioBuffer: AudioBuffer;
  startTime: number;
  endTime: number;
  volume: number;
  tempo: number; // 0.5x to 2.0x
  fadeIn: number;
  fadeOut: number;
  lowpass: boolean;
  highpass: boolean;
  crossfade: number; // Crossfade with next segment
}

interface AdvancedMashupTabProps {
  onGenerateComplete: (url: string, title: string) => void;
  onError: (error: string) => void;
  onProcessingChange?: (isProcessing: boolean, message?: string) => void;
}

export default function AdvancedMashupTab({
  onGenerateComplete,
  onError,
  onProcessingChange,
}: AdvancedMashupTabProps) {
  const [segments, setSegments] = useState<MashupSegment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const [isDragging, setIsDragging] = useState<{ segmentId: string; type: 'start' | 'end' } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Supported audio file extensions (same as main editor)
    const supportedExtensions = ['.mp3', '.mpeg', '.mpga', '.m4a', '.wav', '.ogg', '.oga', '.flac', '.aac', '.wma', '.opus', '.webm', '.3gp', '.amr', '.aiff', '.au', '.ra'];
    // Supported MIME types
    const supportedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-mpeg', 'audio/x-mpeg-3', 'video/mpeg', 'video/mp4'];

    // Validate files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of files) {
      const fileExtension = file.name.toLowerCase().includes('.') 
        ? file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
        : '';
      
      const isAudioFile = file.type.startsWith('audio/') || 
                          file.type.startsWith('video/') ||
                          supportedMimeTypes.includes(file.type) ||
                          supportedExtensions.includes(fileExtension);
      
      if (isAudioFile) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (validFiles.length === 0) {
      onError('No valid audio files selected. Supported formats: MP3, MPEG, M4A, WAV, OGG, FLAC, AAC, WMA, OPUS, WEBM, 3GP, AMR, AIFF, AU, RA');
      return;
    }

    if (invalidFiles.length > 0) {
      console.warn(`Skipped ${invalidFiles.length} unsupported file(s): ${invalidFiles.join(', ')}`);
    }

    try {
      const newSegments: MashupSegment[] = [];
      
      for (const file of validFiles) {
        const buffer = await loadAudioFile(file);
        const id = `${Date.now()}-${Math.random()}`;
        
        newSegments.push({
          id,
          file,
          audioBuffer: buffer,
          startTime: 0,
          endTime: buffer.duration,
          volume: 1.0,
          tempo: 1.0,
          fadeIn: 0,
          fadeOut: 0,
          lowpass: false,
          highpass: false,
          crossfade: 1.0,
        });
      }

      setSegments([...segments, ...newSegments]);
      if (newSegments.length > 0) {
        setSelectedSegmentId(newSegments[0].id);
      }
    } catch (error) {
      onError('Error loading audio files. Please make sure they are valid audio files.');
    }
  };

  const updateSegment = (id: string, updates: Partial<MashupSegment>) => {
    setSegments(segments.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSegment = (id: string) => {
    setSegments(segments.filter(s => s.id !== id));
    if (selectedSegmentId === id) {
      setSelectedSegmentId(segments.length > 1 ? segments.find(s => s.id !== id)?.id || null : null);
    }
  };

  const moveSegment = (fromIndex: number, toIndex: number) => {
    const newSegments = [...segments];
    const [moved] = newSegments.splice(fromIndex, 1);
    newSegments.splice(toIndex, 0, moved);
    setSegments(newSegments);
  };

  const drawWaveform = (segment: MashupSegment, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !segment.audioBuffer) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const waveform = getWaveformData(segment.audioBuffer, Math.floor(width / 2));
    const max = Math.max(...waveform, 0.01);
    const duration = segment.audioBuffer.duration;

    const startPercent = segment.startTime / duration;
    const endPercent = segment.endTime / duration;
    const startX = startPercent * width;
    const endX = endPercent * width;

    // Draw unselected (gray)
    waveform.forEach((value, index) => {
      const x = (index / waveform.length) * width;
      const barHeight = (value / max) * height * 0.8;
      const centerY = height / 2;
      const isSelected = x >= startX && x <= endX;

      if (!isSelected) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x, centerY - barHeight / 2, 2, barHeight);
      }
    });

    // Draw selected (blue)
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

    // Draw handles
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(startX - 2, 0, 4, height);
    ctx.fillRect(endX - 2, 0, 4, height);
  };

  useEffect(() => {
    segments.forEach(segment => {
      const canvas = canvasRefs.current.get(segment.id);
      if (canvas) {
        drawWaveform(segment, canvas);
      }
    });
  }, [segments, isDragging]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>, segment: MashupSegment) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / canvas.width;
    const duration = segment.audioBuffer.duration;
    const time = percent * duration;

    const startX = (segment.startTime / duration) * canvas.width;
    const endX = (segment.endTime / duration) * canvas.width;

    // Check if clicking near start handle
    if (Math.abs(x - startX) < 10) {
      setIsDragging({ segmentId: segment.id, type: 'start' });
    }
    // Check if clicking near end handle
    else if (Math.abs(x - endX) < 10) {
      setIsDragging({ segmentId: segment.id, type: 'end' });
    }
    // Otherwise, set "from" time to clicked position
    else {
      const newStart = Math.max(0, Math.min(time, segment.endTime - 0.1));
      updateSegment(segment.id, { startTime: newStart });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>, segment: MashupSegment) => {
    if (!isDragging || isDragging.segmentId !== segment.id) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / canvas.width));
    const duration = segment.audioBuffer.duration;
    const time = percent * duration;

    if (isDragging.type === 'start') {
      const newStart = Math.max(0, Math.min(time, segment.endTime - 0.1));
      updateSegment(segment.id, { startTime: newStart });
    } else if (isDragging.type === 'end') {
      const newEnd = Math.max(segment.startTime + 0.1, Math.min(time, duration));
      updateSegment(segment.id, { endTime: newEnd });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(null);
  };

  const handleGenerateMashup = async () => {
    if (segments.length === 0) {
      onError('Please add at least one audio segment');
      return;
    }

    setIsProcessing(true);
    onProcessingChange?.(true, 'Generating mashup...');

    try {
      const sampleRate = segments[0].audioBuffer.sampleRate;
      const processedSegments: AudioBuffer[] = [];

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        onProcessingChange?.(true, `Processing segment ${i + 1}/${segments.length}...`);

        // Trim the segment
        let processed = await trimAudio(segment.audioBuffer, segment.startTime, segment.endTime);

        // Apply tempo (pitch shift + time stretch)
        if (segment.tempo !== 1.0) {
          const offlineContext = new OfflineAudioContext(
            processed.numberOfChannels,
            Math.floor(processed.length / segment.tempo),
            sampleRate
          );
          const source = offlineContext.createBufferSource();
          source.buffer = processed;
          source.playbackRate.value = segment.tempo;
          source.connect(offlineContext.destination);
          source.start(0);
          processed = await offlineContext.startRendering();
        }

        // Apply volume
        if (segment.volume !== 1.0) {
          const offlineContext = new OfflineAudioContext(
            processed.numberOfChannels,
            processed.length,
            sampleRate
          );
          const source = offlineContext.createBufferSource();
          source.buffer = processed;
          const gainNode = offlineContext.createGain();
          gainNode.gain.value = segment.volume;
          source.connect(gainNode);
          gainNode.connect(offlineContext.destination);
          source.start(0);
          processed = await offlineContext.startRendering();
        }

        // Apply filters
        if (segment.lowpass || segment.highpass) {
          const offlineContext = new OfflineAudioContext(
            processed.numberOfChannels,
            processed.length,
            sampleRate
          );
          const source = offlineContext.createBufferSource();
          source.buffer = processed;
          let lastNode: AudioNode = source;

          if (segment.lowpass) {
            const filter = offlineContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 5000;
            lastNode.connect(filter);
            lastNode = filter;
          }

          if (segment.highpass) {
            const filter = offlineContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 200;
            lastNode.connect(filter);
            lastNode = filter;
          }

          lastNode.connect(offlineContext.destination);
          source.start(0);
          processed = await offlineContext.startRendering();
        }

        // Apply fade in/out
        if (segment.fadeIn > 0 || segment.fadeOut > 0) {
          const fadeInSamples = Math.floor(segment.fadeIn * sampleRate);
          const fadeOutSamples = Math.floor(segment.fadeOut * sampleRate);
          const numberOfChannels = processed.numberOfChannels;
          const length = processed.length;

          const fadedBuffer = new AudioBuffer({
            numberOfChannels,
            length,
            sampleRate,
          });

          for (let channel = 0; channel < numberOfChannels; channel++) {
            const inputData = processed.getChannelData(channel);
            const outputData = fadedBuffer.getChannelData(channel);

            for (let i = 0; i < length; i++) {
              let gain = 1.0;
              if (segment.fadeIn > 0 && i < fadeInSamples) {
                gain = i / fadeInSamples;
              }
              if (segment.fadeOut > 0 && i >= length - fadeOutSamples) {
                const fadeOutProgress = (length - i) / fadeOutSamples;
                gain = Math.min(gain, fadeOutProgress);
              }
              outputData[i] = inputData[i] * gain;
            }
          }

          const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);
          const source = offlineContext.createBufferSource();
          source.buffer = fadedBuffer;
          source.connect(offlineContext.destination);
          source.start(0);
          processed = await offlineContext.startRendering();
        }

        processedSegments.push(processed);
      }

      // Merge all segments with crossfades
      onProcessingChange?.(true, 'Merging segments...');
      let finalBuffer = processedSegments[0];

      for (let i = 1; i < processedSegments.length; i++) {
        const crossfade = segments[i - 1].crossfade;
        const crossfadeSamples = Math.floor(crossfade * sampleRate);
        const totalLength = finalBuffer.length + processedSegments[i].length - crossfadeSamples;

        const offlineContext = new OfflineAudioContext(
          Math.max(finalBuffer.numberOfChannels, processedSegments[i].numberOfChannels),
          totalLength,
          sampleRate
        );
        const mergedBuffer = offlineContext.createBuffer(
          Math.max(finalBuffer.numberOfChannels, processedSegments[i].numberOfChannels),
          totalLength,
          sampleRate
        );

        for (let channel = 0; channel < mergedBuffer.numberOfChannels; channel++) {
          const outputData = mergedBuffer.getChannelData(channel);
          const data1 = finalBuffer.numberOfChannels > channel 
            ? finalBuffer.getChannelData(channel) 
            : new Float32Array(finalBuffer.length);
          const data2 = processedSegments[i].numberOfChannels > channel 
            ? processedSegments[i].getChannelData(channel) 
            : new Float32Array(processedSegments[i].length);

          // Copy first buffer
          for (let j = 0; j < finalBuffer.length - crossfadeSamples; j++) {
            outputData[j] = data1[j];
          }

          // Crossfade
          for (let j = 0; j < crossfadeSamples; j++) {
            const fadeOut = 1 - (j / crossfadeSamples);
            const fadeIn = j / crossfadeSamples;
            const idx1 = finalBuffer.length - crossfadeSamples + j;
            const idx2 = j;
            outputData[finalBuffer.length - crossfadeSamples + j] = 
              (data1[idx1] * fadeOut) + (data2[idx2] * fadeIn);
          }

          // Copy second buffer
          for (let j = crossfadeSamples; j < processedSegments[i].length; j++) {
            outputData[finalBuffer.length - crossfadeSamples + j] = data2[j];
          }
        }

        const source = offlineContext.createBufferSource();
        source.buffer = mergedBuffer;
        source.connect(offlineContext.destination);
        source.start(0);
        finalBuffer = await offlineContext.startRendering();
      }

      // Convert to WAV and create URL
      const wavBlob = audioBufferToWav(finalBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      const totalDuration = finalBuffer.duration;
      const hours = Math.floor(totalDuration / 3600);
      const minutes = Math.floor((totalDuration % 3600) / 60);
      const title = `Mashup - ${segments.length} segments (${hours}h ${minutes}m)`;
      
      onGenerateComplete(url, title);
      onProcessingChange?.(false);
    } catch (error) {
      console.error('Error generating mashup:', error);
      onError('Error generating mashup. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedSegment = segments.find(s => s.id === selectedSegmentId);

  return (
    <div className={styles.mashupContainer}>
      <div className={styles.header}>
        <h3>Advanced Mashup Creator</h3>
        <p>Create professional mashups by selecting parts from multiple files, adjusting tempo, and applying DJ effects</p>
      </div>

      {/* File Upload */}
      <div className={styles.uploadSection}>
        <input
          type="file"
          id="mashup-upload"
          multiple
          accept="audio/*,video/mpeg,video/mp4,.mp3,.mpeg,.mpga,.m4a,.wav,.ogg,.oga,.flac,.aac,.wma,.opus,.webm,.3gp,.amr,.aiff,.au,.ra"
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
        <label htmlFor="mashup-upload" className={styles.uploadButton}>
          <Upload size={20} />
          Add Audio Files
        </label>
        <span className={styles.fileCount}>{segments.length} file{segments.length !== 1 ? 's' : ''} loaded</span>
      </div>

      {/* Segments List */}
      {segments.length > 0 && (
        <div className={styles.segmentsList}>
          <h4>Segments ({segments.length})</h4>
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className={`${styles.segmentCard} ${selectedSegmentId === segment.id ? styles.selected : ''}`}
              onClick={() => setSelectedSegmentId(segment.id)}
            >
              <div className={styles.segmentHeader}>
                <GripVertical className={styles.dragHandle} />
                <span className={styles.segmentNumber}>{index + 1}</span>
                <span className={styles.segmentName}>{segment.file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSegment(segment.id);
                  }}
                  className={styles.removeButton}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Waveform */}
              <div className={styles.waveformContainer}>
                <canvas
                  ref={(el) => {
                    if (el) canvasRefs.current.set(segment.id, el);
                  }}
                  width={600}
                  height={60}
                  className={styles.waveform}
                  style={{ cursor: 'pointer' }}
                  onMouseDown={(e) => handleCanvasMouseDown(e, segment)}
                  onMouseMove={(e) => handleCanvasMouseMove(e, segment)}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>

              {/* Quick Info */}
              <div className={styles.segmentInfo}>
                <span>Duration: {((segment.endTime - segment.startTime) / segment.tempo).toFixed(1)}s</span>
                <span>Volume: {(segment.volume * 100).toFixed(0)}%</span>
                <span>Tempo: {(segment.tempo * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Segment Editor */}
      {selectedSegment && (
        <div className={styles.editorSection}>
          <h4>Edit Segment: {selectedSegment.file.name}</h4>
          
          <div className={styles.editorGrid}>
            {/* Time Selection */}
            <div className={styles.editorGroup}>
              <label>Time Selection</label>
              <div className={styles.timeInputs}>
                <div>
                  <label>From (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedSegment.audioBuffer.duration}
                    step="0.1"
                    value={selectedSegment.startTime.toFixed(1)}
                    onChange={(e) => updateSegment(selectedSegment.id, {
                      startTime: Math.max(0, Math.min(parseFloat(e.target.value), selectedSegment.endTime - 0.1))
                    })}
                  />
                </div>
                <div>
                  <label>To (s)</label>
                  <input
                    type="number"
                    min={selectedSegment.startTime + 0.1}
                    max={selectedSegment.audioBuffer.duration}
                    step="0.1"
                    value={selectedSegment.endTime.toFixed(1)}
                    onChange={(e) => updateSegment(selectedSegment.id, {
                      endTime: Math.max(selectedSegment.startTime + 0.1, Math.min(parseFloat(e.target.value), selectedSegment.audioBuffer.duration))
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Volume & Tempo */}
            <div className={styles.editorGroup}>
              <label>Volume</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={selectedSegment.volume}
                onChange={(e) => updateSegment(selectedSegment.id, { volume: parseFloat(e.target.value) })}
              />
              <span>{(selectedSegment.volume * 100).toFixed(0)}%</span>
            </div>

            <div className={styles.editorGroup}>
              <label>Tempo / Speed</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={selectedSegment.tempo}
                onChange={(e) => updateSegment(selectedSegment.id, { tempo: parseFloat(e.target.value) })}
              />
              <span>{(selectedSegment.tempo * 100).toFixed(0)}%</span>
            </div>

            {/* Fades */}
            <div className={styles.editorGroup}>
              <label>Fade In (s)</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={selectedSegment.fadeIn}
                onChange={(e) => updateSegment(selectedSegment.id, { fadeIn: parseFloat(e.target.value) })}
              />
              <span>{selectedSegment.fadeIn.toFixed(1)}s</span>
            </div>

            <div className={styles.editorGroup}>
              <label>Fade Out (s)</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={selectedSegment.fadeOut}
                onChange={(e) => updateSegment(selectedSegment.id, { fadeOut: parseFloat(e.target.value) })}
              />
              <span>{selectedSegment.fadeOut.toFixed(1)}s</span>
            </div>

            {/* Crossfade */}
            <div className={styles.editorGroup}>
              <label>Crossfade with Next (s)</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={selectedSegment.crossfade}
                onChange={(e) => updateSegment(selectedSegment.id, { crossfade: parseFloat(e.target.value) })}
              />
              <span>{selectedSegment.crossfade.toFixed(1)}s</span>
            </div>

            {/* DJ Effects */}
            <div className={styles.editorGroup}>
              <label>DJ Effects</label>
              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedSegment.lowpass}
                    onChange={(e) => updateSegment(selectedSegment.id, { lowpass: e.target.checked })}
                  />
                  Lowpass Filter
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedSegment.highpass}
                    onChange={(e) => updateSegment(selectedSegment.id, { highpass: e.target.checked })}
                  />
                  Highpass Filter
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {segments.length > 0 && (
        <div className={styles.actions}>
          <button
            onClick={handleGenerateMashup}
            disabled={isProcessing || segments.length === 0}
            className={styles.generateButton}
          >
            <Music size={20} />
            {isProcessing ? 'Generating Mashup...' : 'Generate Mashup'}
          </button>
          <div className={styles.totalDuration}>
            Total Duration: ~{(
              segments.reduce((sum, s) => sum + (s.endTime - s.startTime) / s.tempo, 0) / 3600
            ).toFixed(2)} hours
          </div>
        </div>
      )}
    </div>
  );
}

