/**
 * Lo-Fi Tune Generator
 * Auto-generates 2-4 hour seamless Lo-Fi tracks
 */

import { 
  generateKick, generateSnare, generateHihat, 
  generateTone, generateChord, applyEnvelope, midiToFrequency
} from './audio-synthesis';
import { processAudio, defaultEffects } from './audio-utils';
import { coffeeShopPreset } from './lofi-presets';

export interface LoFiGeneratorSettings {
  duration: number; // Duration in seconds (7200 = 2 hours, 14400 = 4 hours)
  bpm: number; // Beats per minute (60-120)
  key: string; // Musical key (C, C#, D, etc.)
  scale: 'major' | 'minor'; // Scale type
  style: 'ambient' | 'chill' | 'jazz' | 'study'; // Style preset
}

/**
 * Generate a simple drum pattern
 */
export function generateDrumPattern(
  bpm: number,
  bars: number,
  swing: number = 0.05
): Array<{ time: number; type: 'kick' | 'snare' | 'hihat'; velocity: number }> {
  const beatsPerBar = 4;
  const beatDuration = 60 / bpm; // Duration of one beat in seconds
  const pattern: Array<{ time: number; type: 'kick' | 'snare' | 'hihat'; velocity: number }> = [];

  for (let bar = 0; bar < bars; bar++) {
    for (let beat = 0; beat < beatsPerBar; beat++) {
      const baseTime = (bar * beatsPerBar + beat) * beatDuration;
      const swingOffset = beat % 2 === 1 ? swing : -swing / 2;
      const time = baseTime + swingOffset;

      // Kick on 1 and 3 (or every other bar for variation)
      if (beat === 0 || (beat === 2 && bar % 2 === 0)) {
        pattern.push({ time, type: 'kick', velocity: 0.8 + Math.random() * 0.2 });
      }

      // Snare on 2 and 4 (with some variation)
      if (beat === 1 || beat === 3) {
        if (Math.random() > 0.1) { // 90% chance
          pattern.push({ time, type: 'snare', velocity: 0.7 + Math.random() * 0.2 });
        }
      }

      // Hi-hats on off-beats (with swing)
      if (beat === 0.5 || beat === 1.5 || beat === 2.5 || beat === 3.5) {
        const hihatTime = baseTime + (beat - Math.floor(beat)) * beatDuration + swingOffset;
        if (Math.random() > 0.3) { // 70% chance
          pattern.push({ time: hihatTime, type: 'hihat', velocity: 0.4 + Math.random() * 0.3 });
        }
      }
    }
  }

  return pattern.sort((a, b) => a.time - b.time);
}

/**
 * Generate chord progression (jazz-influenced for Lo-Fi)
 */
/**
 * Convert chord symbol to MIDI note numbers
 */
function chordSymbolToNotes(chordSymbol: string, key: string, scale: 'major' | 'minor', octave: number = 4): number[] {
  const keyOffsets: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
  };
  
  const keyOffset = keyOffsets[key] || 0;
  const rootNote = (octave * 12) + keyOffset;
  
  // Scale degrees for major and minor
  const majorScale = [0, 2, 4, 5, 7, 9, 11]; // I, ii, iii, IV, V, vi, vii
  const minorScale = [0, 2, 3, 5, 7, 8, 10]; // i, ii, III, iv, v, VI, VII
  
  const scaleIntervals = scale === 'major' ? majorScale : minorScale;
  
  // Map chord symbols to scale degrees
  const chordMap: Record<string, number> = {
    'I': 0, 'i': 0,
    'II': 1, 'ii': 1,
    'III': 2, 'iii': 2,
    'IV': 3, 'iv': 3,
    'V': 4, 'v': 4,
    'VI': 5, 'vi': 5,
    'VII': 6, 'vii': 6,
  };
  
  const degree = chordMap[chordSymbol] ?? 0;
  const root = scaleIntervals[degree];
  
  // Create triad (1st, 3rd, 5th)
  const third = scaleIntervals[(degree + 2) % 7];
  const fifth = scaleIntervals[(degree + 4) % 7];
  
  // Adjust intervals based on root
  const thirdOffset = third - root;
  const fifthOffset = fifth - root;
  
  // Handle wrap-around
  const thirdSemitone = thirdOffset < 0 ? thirdOffset + 12 : thirdOffset;
  const fifthSemitone = fifthOffset < 0 ? fifthOffset + 12 : fifthOffset;
  
  return [
    rootNote + root,
    rootNote + root + thirdSemitone,
    rootNote + root + fifthSemitone,
  ];
}

export function generateChordProgression(
  key: string,
  scale: 'major' | 'minor',
  bars: number,
  bpm: number
): Array<{ time: number; frequencies: number[]; duration: number }> {
  // Simple chord progressions
  const majorProgressions = [
    ['I', 'vi', 'IV', 'V'],
    ['I', 'V', 'vi', 'IV'],
    ['vi', 'IV', 'I', 'V'],
  ];
  
  const minorProgressions = [
    ['i', 'vi', 'III', 'VII'],
    ['i', 'VII', 'VI', 'VII'],
    ['i', 'III', 'vi', 'V'],
  ];

  const progressions = scale === 'major' ? majorProgressions : minorProgressions;
  const progression = progressions[Math.floor(Math.random() * progressions.length)];
  
  const chordChanges: Array<{ time: number; frequencies: number[]; duration: number }> = [];
  const beatDuration = 60 / bpm;
  const beatsPerBar = 4;

  for (let bar = 0; bar < bars; bar++) {
    const chordSymbol = progression[bar % progression.length];
    const time = bar * beatsPerBar * beatDuration;
    const duration = beatsPerBar * beatDuration;

    // Convert chord symbol to actual MIDI notes
    const midiNotes = chordSymbolToNotes(chordSymbol, key, scale, 4);
    const frequencies = midiNotes.map(note => midiToFrequency(note));

    chordChanges.push({
      time,
      frequencies,
      duration,
    });
  }

  return chordChanges;
}

/**
 * Generate a simple melody line
 */
export function generateMelody(
  key: string,
  scale: 'major' | 'minor',
  duration: number,
  bpm: number
): Array<{ time: number; note: number; duration: number; velocity: number }> {
  // Scale degrees (semitones from root)
  const majorScale = [0, 2, 4, 5, 7, 9, 11];
  const minorScale = [0, 2, 3, 5, 7, 8, 10];
  const scaleDegrees = scale === 'major' ? majorScale : minorScale;

  const beatDuration = 60 / bpm;
  const melody: Array<{ time: number; note: number; duration: number; velocity: number }> = [];
  
  let currentTime = 0;
  const noteDurations = [beatDuration, beatDuration * 2, beatDuration * 0.5];

  while (currentTime < duration) {
    const degree = scaleDegrees[Math.floor(Math.random() * scaleDegrees.length)];
    const octave = 4 + Math.floor(Math.random() * 2); // Octave 4 or 5
    const note = degree + octave * 12;
    const duration = noteDurations[Math.floor(Math.random() * noteDurations.length)];
    
    melody.push({
      time: currentTime,
      note,
      duration,
      velocity: 0.5 + Math.random() * 0.3,
    });

    currentTime += duration;
  }

  return melody;
}

/**
 * Generate complete Lo-Fi tune as AudioBuffer
 */
export async function generateLofiTuneAudio(
  settings: LoFiGeneratorSettings,
  onProgress?: (progress: number) => void
): Promise<AudioBuffer> {
  const sampleRate = 44100;
  const bars = Math.ceil(settings.duration / (60 / settings.bpm) / 4);
  const totalSamples = Math.floor(settings.duration * sampleRate);

  // Create master buffer
  const masterBuffer = new AudioBuffer({
    numberOfChannels: 2, // Stereo
    length: totalSamples,
    sampleRate,
  });

  const leftChannel = masterBuffer.getChannelData(0);
  const rightChannel = masterBuffer.getChannelData(1);

  // Generate patterns
  const drumPattern = generateDrumPattern(settings.bpm, bars);
  const chordProgression = generateChordProgression(settings.key, settings.scale, bars, settings.bpm);
  const melody = generateMelody(settings.key, settings.scale, settings.duration, settings.bpm);

  // Key to MIDI note offset
  const keyOffsets: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
  };
  const keyOffset = keyOffsets[settings.key] || 0;

  // Render drums
  onProgress?.(10);
  for (const hit of drumPattern) {
    if (hit.time >= settings.duration) break;
    
    let sound: Float32Array;
    switch (hit.type) {
      case 'kick':
        sound = generateKick(0.2, sampleRate);
        break;
      case 'snare':
        sound = generateSnare(0.15, sampleRate);
        break;
      case 'hihat':
        sound = generateHihat(0.1, sampleRate);
        break;
      default:
        continue;
    }

    const startSample = Math.floor(hit.time * sampleRate);
    const volume = hit.velocity * 0.3; // Reduce drum volume

    for (let i = 0; i < sound.length && startSample + i < totalSamples; i++) {
      const sample = sound[i] * volume;
      leftChannel[startSample + i] += sample;
      rightChannel[startSample + i] += sample;
    }
  }

  // Render chords
  onProgress?.(40);
  for (const chordChange of chordProgression) {
    if (chordChange.time >= settings.duration) break;

    const chordAudio = generateChord(chordChange.frequencies, chordChange.duration, sampleRate, 0.15);
    const startSample = Math.floor(chordChange.time * sampleRate);
    const envelope = applyEnvelope(chordAudio, 0.1, 0.2, 0.7, 0.3, sampleRate);

    for (let i = 0; i < envelope.length && startSample + i < totalSamples; i++) {
      const sample = envelope[i];
      leftChannel[startSample + i] += sample * 0.7;
      rightChannel[startSample + i] += sample * 0.7;
    }
  }

  // Render melody
  onProgress?.(70);
  for (const note of melody) {
    if (note.time >= settings.duration) break;

    const frequency = midiToFrequency(note.note + keyOffset);
    const noteAudio = generateTone(frequency, note.duration, sampleRate, note.velocity * 0.2);
    const startSample = Math.floor(note.time * sampleRate);
    const envelope = applyEnvelope(noteAudio, 0.05, 0.1, 0.6, 0.2, sampleRate);

    for (let i = 0; i < envelope.length && startSample + i < totalSamples; i++) {
      const sample = envelope[i];
      leftChannel[startSample + i] += sample * 0.8;
      rightChannel[startSample + i] += sample * 0.8;
    }
  }

  // Normalize to prevent clipping
  onProgress?.(85);
  let maxAmplitude = 0;
  for (let i = 0; i < totalSamples; i++) {
    maxAmplitude = Math.max(maxAmplitude, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
  }

  if (maxAmplitude > 1) {
    const normalizeFactor = 0.95 / maxAmplitude;
    for (let i = 0; i < totalSamples; i++) {
      leftChannel[i] *= normalizeFactor;
      rightChannel[i] *= normalizeFactor;
    }
  }

  // Apply Lo-Fi processing
  onProgress?.(90);
  const lofiEffects = {
    ...defaultEffects,
    ...coffeeShopPreset.effects,
  };

  const processed = await processAudio(masterBuffer, lofiEffects);
  onProgress?.(100);

  return processed;
}

/**
 * Generate Lo-Fi tune structure (for preview/analysis)
 */
export async function generateLofiTune(settings: LoFiGeneratorSettings): Promise<{
  drums: ReturnType<typeof generateDrumPattern>;
  chords: ReturnType<typeof generateChordProgression>;
  melody: ReturnType<typeof generateMelody>;
  bpm: number;
}> {
  const bars = Math.ceil(settings.duration / (60 / settings.bpm) / 4); // 4 beats per bar
  
  return {
    drums: generateDrumPattern(settings.bpm, bars),
    chords: generateChordProgression(settings.key, settings.scale, bars, settings.bpm),
    melody: generateMelody(settings.key, settings.scale, settings.duration, settings.bpm),
    bpm: settings.bpm,
  };
}

