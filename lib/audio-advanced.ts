/**
 * Advanced audio processing utilities for professional audio editing
 */

import { loadAudioFile } from './audio-utils';

export interface AudioTrim {
  startTime: number; // in seconds
  endTime: number; // in seconds
}

export interface EQSettings {
  bass: number; // -12 to +12 dB
  mid: number; // -12 to +12 dB
  treble: number; // -12 to +12 dB
}

export interface MergeSettings {
  crossfade: number; // 0-5 seconds
  volume1: number; // 0-1
  volume2: number; // 0-1
}

export interface FadeSettings {
  fadeIn: number; // 0-10 seconds
  fadeOut: number; // 0-10 seconds
}

/**
 * Trim/crop audio to specified time range
 */
export async function trimAudio(
  audioBuffer: AudioBuffer,
  startTime: number,
  endTime: number
): Promise<AudioBuffer> {
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor(endTime * sampleRate);
  const length = endSample - startSample;

  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    length,
    sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.start(0, startTime, endTime - startTime);
  source.connect(offlineContext.destination);

  return await offlineContext.startRendering();
}

/**
 * Reverse audio buffer
 */
export async function reverseAudio(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;

  const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);
  const reversedBuffer = offlineContext.createBuffer(numberOfChannels, length, sampleRate);

  // Reverse each channel
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const originalData = audioBuffer.getChannelData(channel);
    const reversedData = reversedBuffer.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      reversedData[i] = originalData[length - 1 - i];
    }
  }

  // Create a new buffer source to render
  const source = offlineContext.createBufferSource();
  source.buffer = reversedBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  return await offlineContext.startRendering();
}

/**
 * Apply EQ (Bass, Mid, Treble) to audio
 */
export async function applyEQ(
  audioBuffer: AudioBuffer,
  eqSettings: EQSettings
): Promise<AudioBuffer> {
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  let lastNode: AudioNode = source;

  // Bass (low frequencies) - around 60-250 Hz
  if (eqSettings.bass !== 0) {
    const bassFilter = offlineContext.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 200;
    bassFilter.gain.value = eqSettings.bass;
    lastNode.connect(bassFilter);
    lastNode = bassFilter;
  }

  // Mid frequencies - around 250-4000 Hz
  if (eqSettings.mid !== 0) {
    const midFilter = offlineContext.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1000;
    midFilter.Q.value = 1;
    midFilter.gain.value = eqSettings.mid;
    lastNode.connect(midFilter);
    lastNode = midFilter;
  }

  // Treble (high frequencies) - above 4000 Hz
  if (eqSettings.treble !== 0) {
    const trebleFilter = offlineContext.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 4000;
    trebleFilter.gain.value = eqSettings.treble;
    lastNode.connect(trebleFilter);
    lastNode = trebleFilter;
  }

  lastNode.connect(offlineContext.destination);
  source.start(0);
  return await offlineContext.startRendering();
}

/**
 * Merge two audio buffers with optional crossfade (concatenate)
 */
export async function mergeAudio(
  audioBuffer1: AudioBuffer,
  audioBuffer2: AudioBuffer,
  settings: MergeSettings
): Promise<AudioBuffer> {
  const sampleRate = audioBuffer1.sampleRate;
  const numberOfChannels = Math.max(audioBuffer1.numberOfChannels, audioBuffer2.numberOfChannels);
  
  // Calculate total length: buffer1 + buffer2 - crossfade overlap
  const crossfadeSamples = Math.floor(settings.crossfade * sampleRate);
  const totalLength = audioBuffer1.length + audioBuffer2.length - crossfadeSamples;

  const offlineContext = new OfflineAudioContext(numberOfChannels, totalLength, sampleRate);
  const mergedBuffer = offlineContext.createBuffer(numberOfChannels, totalLength, sampleRate);

  // Mix channels
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const outputData = mergedBuffer.getChannelData(channel);
    const data1 = audioBuffer1.numberOfChannels > channel 
      ? audioBuffer1.getChannelData(channel) 
      : new Float32Array(audioBuffer1.length);
    const data2 = audioBuffer2.numberOfChannels > channel 
      ? audioBuffer2.getChannelData(channel) 
      : new Float32Array(audioBuffer2.length);

    const len1 = audioBuffer1.length;
    const len2 = audioBuffer2.length;
    const crossfadeStart = len1 - crossfadeSamples;

    // First audio with volume
    for (let i = 0; i < len1; i++) {
      let volume = settings.volume1;
      
      // Apply crossfade at the end of first buffer
      if (i >= crossfadeStart && crossfadeSamples > 0 && crossfadeStart >= 0) {
        const crossfadePos = (i - crossfadeStart) / crossfadeSamples;
        volume = settings.volume1 * (1 - crossfadePos);
      }
      
      outputData[i] = data1[i] * volume;
    }

    // Second audio with volume and crossfade at the beginning
    for (let i = 0; i < len2; i++) {
      let volume = settings.volume2;
      
      // Apply crossfade at the beginning of second buffer
      if (i < crossfadeSamples && crossfadeSamples > 0) {
        const crossfadePos = i / crossfadeSamples;
        volume = settings.volume2 * crossfadePos;
      }
      
      const outputIndex = Math.max(0, crossfadeStart) + i;
      if (outputIndex < totalLength) {
        // Mix with existing data if in crossfade region
        if (i < crossfadeSamples && outputIndex < len1) {
          outputData[outputIndex] = outputData[outputIndex] + (data2[i] * volume);
        } else {
          outputData[outputIndex] = data2[i] * volume;
        }
      }
    }
  }

  // Create source to render
  const source = offlineContext.createBufferSource();
  source.buffer = mergedBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  return await offlineContext.startRendering();
}

/**
 * Get audio waveform data for visualization
 */
export function getWaveformData(
  audioBuffer: AudioBuffer,
  samples: number = 200
): number[] {
  const channelData = audioBuffer.getChannelData(0); // Use first channel
  const blockSize = Math.floor(channelData.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    let sum = 0;
    
    for (let j = 0; j < blockSize && start + j < channelData.length; j++) {
      sum += Math.abs(channelData[start + j]);
    }
    
    waveform.push(sum / blockSize);
  }

  return waveform;
}


/**
 * Apply fade in and/or fade out to audio
 */
export async function applyFade(
  audioBuffer: AudioBuffer,
  fadeSettings: FadeSettings
): Promise<AudioBuffer> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  // Create a new buffer with the same properties
  const fadedBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  const fadeInSamples = Math.floor(fadeSettings.fadeIn * sampleRate);
  const fadeOutSamples = Math.floor(fadeSettings.fadeOut * sampleRate);

  // Process each channel
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = fadedBuffer.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      let gain = 1.0;

      // Apply fade in
      if (fadeSettings.fadeIn > 0 && i < fadeInSamples) {
        gain = i / fadeInSamples; // Linear fade from 0 to 1
      }

      // Apply fade out
      if (fadeSettings.fadeOut > 0 && i >= length - fadeOutSamples) {
        const fadeOutProgress = (length - i) / fadeOutSamples; // Linear fade from 1 to 0
        gain = Math.min(gain, fadeOutProgress);
      }

      outputData[i] = inputData[i] * gain;
    }
  }

  // Render through OfflineAudioContext to ensure proper format
  const offlineContext = new OfflineAudioContext(
    numberOfChannels,
    length,
    sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = fadedBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  return await offlineContext.startRendering();
}

/**
 * Get real-time frequency data from audio element
 * Note: This function is disabled to prevent createMediaElementSource conflicts
 * Will be re-implemented properly later with proper state management
 */
// export function createFrequencyAnalyzer(
//   audioElement: HTMLAudioElement,
//   callback: (data: Uint8Array) => void
// ): () => void {
//   // Implementation will be added later
// }

