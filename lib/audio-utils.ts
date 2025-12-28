/**
 * Audio processing utilities using Web Audio API
 */

export interface AudioEffects {
  lofi: {
    enabled: boolean;
    bitDepth: number; // 1-32
    sampleRate: number; // 4000-48000
    lowpassFreq: number; // 200-20000 Hz
  };
  reverb: {
    enabled: boolean;
    roomSize: number; // 0-1
    dampening: number; // 0-1
    wet: number; // 0-1
  };
  delay: {
    enabled: boolean;
    delayTime: number; // 0-2 seconds
    feedback: number; // 0-1
    wet: number; // 0-1
  };
  distortion: {
    enabled: boolean;
    amount: number; // 0-1
  };
  pitch: {
    enabled: boolean;
    semitones: number; // -12 to 12
  };
  lowpass: {
    enabled: boolean;
    frequency: number; // 200-20000 Hz
  };
  highpass: {
    enabled: boolean;
    frequency: number; // 20-5000 Hz
  };
  volume: {
    enabled: boolean;
    gain: number; // 0-2
  };
}

export const defaultEffects: AudioEffects = {
  lofi: {
    enabled: false,
    bitDepth: 8,
    sampleRate: 11025,
    lowpassFreq: 3500,
  },
  reverb: {
    enabled: false,
    roomSize: 0.5,
    dampening: 0.5,
    wet: 0.3,
  },
  delay: {
    enabled: false,
    delayTime: 0.3,
    feedback: 0.3,
    wet: 0.3,
  },
  distortion: {
    enabled: false,
    amount: 0.5,
  },
  pitch: {
    enabled: false,
    semitones: 0,
  },
  lowpass: {
    enabled: false,
    frequency: 5000,
  },
  highpass: {
    enabled: false,
    frequency: 200,
  },
  volume: {
    enabled: true,
    gain: 1,
  },
};

/**
 * Load audio file into AudioBuffer
 */
export async function loadAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  return await audioContext.decodeAudioData(arrayBuffer);
}

/**
 * Apply audio effects to AudioBuffer
 */
export async function processAudio(
  audioBuffer: AudioBuffer,
  effects: AudioEffects
): Promise<AudioBuffer> {
  // Create offline context for rendering
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  // Create source
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  // Build effect chain
  let lastNode: AudioNode = source;

  // Pitch shift (must be applied to source before other effects)
  if (effects.pitch.enabled && effects.pitch.semitones !== 0) {
    const pitchRatio = Math.pow(2, effects.pitch.semitones / 12);
    source.playbackRate.value = pitchRatio;
  }

  // Volume (always applied)
  if (effects.volume.enabled) {
    const gainNode = offlineContext.createGain();
    gainNode.gain.value = effects.volume.gain;
    lastNode.connect(gainNode);
    lastNode = gainNode;
  }

  // Highpass Filter
  if (effects.highpass.enabled) {
    const filter = offlineContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = effects.highpass.frequency;
    lastNode.connect(filter);
    lastNode = filter;
  }

  // Lowpass Filter
  if (effects.lowpass.enabled) {
    const filter = offlineContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = effects.lowpass.frequency;
    lastNode.connect(filter);
    lastNode = filter;
  }

  // Lofi (lowpass filter)
  if (effects.lofi.enabled) {
    const lowpassFilter = offlineContext.createBiquadFilter();
    lowpassFilter.type = 'lowpass';
    lowpassFilter.frequency.value = effects.lofi.lowpassFreq;
    lastNode.connect(lowpassFilter);
    lastNode = lowpassFilter;
  }

  // Distortion
  if (effects.distortion.enabled) {
    const distortion = offlineContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(effects.distortion.amount);
    distortion.oversample = '4x';
    lastNode.connect(distortion);
    lastNode = distortion;
  }

  // Delay
  if (effects.delay.enabled) {
    const delayNode = offlineContext.createDelay(2);
    delayNode.delayTime.value = effects.delay.delayTime;
    const feedbackGain = offlineContext.createGain();
    feedbackGain.gain.value = effects.delay.feedback;
    
    const wetGain = offlineContext.createGain();
    wetGain.gain.value = effects.delay.wet;
    const dryGain = offlineContext.createGain();
    dryGain.gain.value = 1 - effects.delay.wet;

    // Dry path
    lastNode.connect(dryGain);
    
    // Wet path (delay with feedback)
    lastNode.connect(delayNode);
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode); // Feedback loop
    delayNode.connect(wetGain);

    // Mix dry and wet using a gain node
    const mixGain = offlineContext.createGain();
    dryGain.connect(mixGain);
    wetGain.connect(mixGain);
    lastNode = mixGain;
  }

  // Reverb (simplified using delay nodes)
  if (effects.reverb.enabled) {
    const reverbGain = offlineContext.createGain();
    reverbGain.gain.value = effects.reverb.wet;
    const dryGain = offlineContext.createGain();
    dryGain.gain.value = 1 - effects.reverb.wet;

    // Create multiple delay nodes for reverb effect
    const delays = [0.03, 0.05, 0.07, 0.09].map((delayTime) => {
      const delay = offlineContext.createDelay(0.1);
      delay.delayTime.value = delayTime * effects.reverb.roomSize;
      const gain = offlineContext.createGain();
      gain.gain.value = effects.reverb.dampening * 0.3;
      lastNode.connect(delay);
      delay.connect(gain);
      gain.connect(reverbGain);
      return { delay, gain };
    });

    // Dry path
    lastNode.connect(dryGain);

    // Mix dry and reverb using a gain node
    const mixGain = offlineContext.createGain();
    dryGain.connect(mixGain);
    reverbGain.connect(mixGain);
    lastNode = mixGain;
  }

  // Connect to destination
  lastNode.connect(offlineContext.destination);

  // Render audio
  source.start(0);
  return await offlineContext.startRendering();
}

/**
 * Create distortion curve for WaveShaper
 */
function makeDistortionCurve(amount: number): Float32Array {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

/**
 * Convert AudioBuffer to WAV blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const arrayBuffer = new ArrayBuffer(44 + buffer.length * numChannels * bytesPerSample);
  const view = new DataView(arrayBuffer);

  // Write WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + buffer.length * numChannels * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, buffer.length * numChannels * bytesPerSample, true);

  // Convert audio data
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Download audio file
 */
export function downloadAudio(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

