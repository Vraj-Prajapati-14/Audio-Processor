/**
 * Audio Synthesis Utilities
 * Generate audio from patterns and notes
 */

/**
 * Generate a simple sine wave tone
 */
export function generateTone(
  frequency: number,
  duration: number,
  sampleRate: number = 44100,
  amplitude: number = 0.3
): Float32Array {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  const phaseIncrement = (2 * Math.PI * frequency) / sampleRate;

  for (let i = 0; i < length; i++) {
    buffer[i] = Math.sin(i * phaseIncrement) * amplitude;
  }

  return buffer;
}

/**
 * Generate a kick drum sound
 */
export function generateKick(
  duration: number,
  sampleRate: number = 44100
): Float32Array {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);
  const frequency = 60; // Start frequency
  const decay = 0.3; // Decay time

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const freq = frequency * Math.exp(-t / decay);
    const phase = 2 * Math.PI * freq * t;
    const envelope = Math.exp(-t / 0.1); // Quick decay
    buffer[i] = Math.sin(phase) * envelope * 0.5;
  }

  return buffer;
}

/**
 * Generate a snare drum sound
 */
export function generateSnare(
  duration: number,
  sampleRate: number = 44100
): Float32Array {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const noise = (Math.random() * 2 - 1) * 0.5;
    const tone = Math.sin(2 * Math.PI * 200 * t) * 0.3;
    const envelope = Math.exp(-t / 0.05);
    buffer[i] = (noise + tone) * envelope;
  }

  return buffer;
}

/**
 * Generate a hi-hat sound
 */
export function generateHihat(
  duration: number,
  sampleRate: number = 44100
): Float32Array {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const noise = (Math.random() * 2 - 1) * 0.3;
    const envelope = Math.exp(-t / 0.02);
    buffer[i] = noise * envelope;
  }

  return buffer;
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

/**
 * Generate a chord (multiple notes)
 */
export function generateChord(
  frequencies: number[],
  duration: number,
  sampleRate: number = 44100,
  amplitude: number = 0.2
): Float32Array {
  const length = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    let sample = 0;
    for (const freq of frequencies) {
      const phase = (2 * Math.PI * freq * i) / sampleRate;
      sample += Math.sin(phase) * amplitude;
    }
    buffer[i] = sample / frequencies.length; // Average to prevent clipping
  }

  return buffer;
}

/**
 * Apply ADSR envelope to audio buffer
 */
export function applyEnvelope(
  buffer: Float32Array,
  attack: number,
  decay: number,
  sustain: number,
  release: number,
  sampleRate: number = 44100
): Float32Array {
  const length = buffer.length;
  const result = new Float32Array(length);
  const totalDuration = length / sampleRate;

  const attackSamples = Math.floor(attack * sampleRate);
  const decaySamples = Math.floor(decay * sampleRate);
  const releaseSamples = Math.floor(release * sampleRate);
  const sustainSamples = length - attackSamples - decaySamples - releaseSamples;

  for (let i = 0; i < length; i++) {
    let envelope = 1.0;

    if (i < attackSamples) {
      // Attack phase
      envelope = i / attackSamples;
    } else if (i < attackSamples + decaySamples) {
      // Decay phase
      const decayProgress = (i - attackSamples) / decaySamples;
      envelope = 1 - (1 - sustain) * decayProgress;
    } else if (i < attackSamples + decaySamples + sustainSamples) {
      // Sustain phase
      envelope = sustain;
    } else {
      // Release phase
      const releaseProgress = (i - (attackSamples + decaySamples + sustainSamples)) / releaseSamples;
      envelope = sustain * (1 - releaseProgress);
    }

    result[i] = buffer[i] * envelope;
  }

  return result;
}

