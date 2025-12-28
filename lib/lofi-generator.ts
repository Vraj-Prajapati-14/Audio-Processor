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
  duration: number; // Duration in seconds (can be any value)
  bpm: number; // Beats per minute (60-120)
  key: string; // Musical key (C, C#, D, etc.)
  scale: 'major' | 'minor'; // Scale type
  style: 'ambient' | 'chill' | 'jazz' | 'study'; // Style preset
}

export type VariationLevel = 'low' | 'medium' | 'high' | 'extreme';

/**
 * Generate a drum pattern with variation over time
 */
export function generateDrumPattern(
  bpm: number,
  bars: number,
  swing: number = 0.05,
  variationLevel: VariationLevel = 'medium',
  segmentIndex: number = 0
): Array<{ time: number; type: 'kick' | 'snare' | 'hihat'; velocity: number }> {
  const beatsPerBar = 4;
  const beatDuration = 60 / bpm;
  const pattern: Array<{ time: number; type: 'kick' | 'snare' | 'hihat'; velocity: number }> = [];

  // Variation factors based on level and segment
  const variationFactors = {
    low: { patternChange: 16, velocityVar: 0.1, densityVar: 0.05 },
    medium: { patternChange: 8, velocityVar: 0.15, densityVar: 0.1 },
    high: { patternChange: 4, velocityVar: 0.2, densityVar: 0.15 },
    extreme: { patternChange: 2, velocityVar: 0.3, densityVar: 0.2 },
  };

  const factors = variationFactors[variationLevel];
  const patternSeed = Math.floor(segmentIndex / factors.patternChange);

  for (let bar = 0; bar < bars; bar++) {
    const globalBar = segmentIndex * bars + bar;
    const patternPhase = (globalBar + patternSeed) % 8; // 8-bar pattern variations
    
    for (let beat = 0; beat < beatsPerBar; beat++) {
      const baseTime = (bar * beatsPerBar + beat) * beatDuration;
      const swingOffset = beat % 2 === 1 ? swing : -swing / 2;
      const time = baseTime + swingOffset;

      // Evolving kick pattern
      const kickPattern = [
        beat === 0,
        beat === 0 || (beat === 2 && patternPhase % 2 === 0),
        beat === 0 || beat === 2,
        beat === 0 || beat === 2 || (beat === 1 && patternPhase % 4 === 0),
      ];
      const kickIndex = Math.min(patternPhase, 3);
      if (kickPattern[kickIndex]) {
        const baseVel = 0.7 + (patternPhase % 4) * 0.05;
        pattern.push({ 
          time, 
          type: 'kick', 
          velocity: baseVel + (Math.random() - 0.5) * factors.velocityVar 
        });
      }

      // Evolving snare pattern
      const snarePattern = [
        beat === 1 || beat === 3,
        beat === 1 || (beat === 3 && patternPhase % 2 === 0),
        beat === 2 || beat === 3,
        beat === 1 || beat === 3 || (beat === 2 && patternPhase % 4 === 2),
      ];
      const snareIndex = Math.min(patternPhase, 3);
      if (snarePattern[snareIndex]) {
        const density = 0.85 - (patternPhase % 4) * factors.densityVar;
        if (Math.random() < density) {
          const baseVel = 0.6 + (patternPhase % 4) * 0.05;
          pattern.push({ 
            time, 
            type: 'snare', 
            velocity: baseVel + (Math.random() - 0.5) * factors.velocityVar 
          });
        }
      }

      // Evolving hi-hat pattern
      if (beat === 0.5 || beat === 1.5 || beat === 2.5 || beat === 3.5) {
        const hihatTime = baseTime + (beat - Math.floor(beat)) * beatDuration + swingOffset;
        const density = 0.7 - (patternPhase % 4) * factors.densityVar;
        if (Math.random() < density) {
          pattern.push({ 
            time: hihatTime, 
            type: 'hihat', 
            velocity: 0.3 + (Math.random() * 0.4) + (patternPhase % 4) * 0.05 
          });
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
  bpm: number,
  variationLevel: VariationLevel = 'medium',
  segmentIndex: number = 0
): Array<{ time: number; frequencies: number[]; duration: number }> {
  // Extended chord progressions for variation
  const majorProgressions = [
    ['I', 'vi', 'IV', 'V'],
    ['I', 'V', 'vi', 'IV'],
    ['vi', 'IV', 'I', 'V'],
    ['I', 'iii', 'vi', 'IV'],
    ['vi', 'I', 'V', 'IV'],
    ['I', 'IV', 'vi', 'V'],
    ['vi', 'IV', 'V', 'I'],
    ['I', 'vi', 'iii', 'IV'],
  ];
  
  const minorProgressions = [
    ['i', 'vi', 'III', 'VII'],
    ['i', 'VII', 'VI', 'VII'],
    ['i', 'III', 'vi', 'V'],
    ['i', 'iv', 'VII', 'III'],
    ['i', 'VI', 'III', 'VII'],
    ['i', 'VII', 'VI', 'III'],
    ['i', 'iv', 'i', 'VII'],
    ['i', 'III', 'VI', 'VII'],
  ];

  const progressions = scale === 'major' ? majorProgressions : minorProgressions;
  
  // Change progression based on variation level and segment
  const variationFactors = {
    low: 32,
    medium: 16,
    high: 8,
    extreme: 4,
  };
  const progressionChangeInterval = variationFactors[variationLevel];
  const progressionIndex = Math.floor(segmentIndex * bars / progressionChangeInterval) % progressions.length;
  const progression = progressions[progressionIndex];
  
  const chordChanges: Array<{ time: number; frequencies: number[]; duration: number }> = [];
  const beatDuration = 60 / bpm;
  const beatsPerBar = 4;

  for (let bar = 0; bar < bars; bar++) {
    const globalBar = segmentIndex * bars + bar;
    const chordSymbol = progression[globalBar % progression.length];
    const time = bar * beatsPerBar * beatDuration;
    const duration = beatsPerBar * beatDuration;

    // Vary octave based on segment for more variation
    const octave = 3 + Math.floor((globalBar / 16) % 2);
    
    // Convert chord symbol to actual MIDI notes
    const midiNotes = chordSymbolToNotes(chordSymbol, key, scale, octave);
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
  bpm: number,
  variationLevel: VariationLevel = 'medium',
  segmentIndex: number = 0
): Array<{ time: number; note: number; duration: number; velocity: number }> {
  // Scale degrees (semitones from root)
  const majorScale = [0, 2, 4, 5, 7, 9, 11];
  const minorScale = [0, 2, 3, 5, 7, 8, 10];
  const scaleDegrees = scale === 'major' ? majorScale : minorScale;

  const beatDuration = 60 / bpm;
  const melody: Array<{ time: number; note: number; duration: number; velocity: number }> = [];
  
  let currentTime = 0;
  
  // Vary note durations based on variation level
  const noteDurations = {
    low: [beatDuration, beatDuration * 2],
    medium: [beatDuration, beatDuration * 2, beatDuration * 0.5],
    high: [beatDuration, beatDuration * 2, beatDuration * 0.5, beatDuration * 1.5],
    extreme: [beatDuration * 0.25, beatDuration * 0.5, beatDuration, beatDuration * 1.5, beatDuration * 2],
  };
  const durations = noteDurations[variationLevel];
  
  // Create melodic phrases that evolve
  let phraseStart = 0;
  let lastNote = scaleDegrees[Math.floor(scaleDegrees.length / 2)]; // Start from middle of scale

  while (currentTime < duration) {
    const timeInSegment = currentTime;
    const phraseLength = 4 * beatDuration; // 4-beat phrases
    const phraseIndex = Math.floor(timeInSegment / phraseLength);
    
    // Evolve melody over time
    const degreeIndex = (phraseIndex + segmentIndex) % scaleDegrees.length;
    let degree = scaleDegrees[degreeIndex];
    
    // Add some randomness but keep it melodic (prefer step-wise motion)
    if (Math.random() > 0.3) {
      const step = Math.random() > 0.5 ? 1 : -1;
      const newIndex = (scaleDegrees.indexOf(lastNote) + step + scaleDegrees.length) % scaleDegrees.length;
      degree = scaleDegrees[newIndex];
    } else {
      degree = scaleDegrees[Math.floor(Math.random() * scaleDegrees.length)];
    }
    
    lastNote = degree;
    
    // Vary octave based on segment and variation level
    const octaveVariation = {
      low: 1,
      medium: 2,
      high: 3,
      extreme: 4,
    };
    const octaveRange = octaveVariation[variationLevel];
    const baseOctave = 4 + Math.floor((segmentIndex + phraseIndex) / 8) % 2;
    const octave = baseOctave + Math.floor(Math.random() * octaveRange);
    
    const note = degree + octave * 12;
    const duration = durations[Math.floor(Math.random() * durations.length)];
    
    // Vary velocity based on position in phrase
    const phrasePosition = (timeInSegment % phraseLength) / phraseLength;
    const baseVelocity = 0.4 + phrasePosition * 0.2; // Crescendo in phrase
    
    melody.push({
      time: currentTime,
      note,
      duration,
      velocity: baseVelocity + Math.random() * 0.2,
    });

    currentTime += duration;
  }

  return melody;
}

/**
 * Generate complete Lo-Fi tune as AudioBuffer with variation
 */
export async function generateLofiTuneAudio(
  settings: LoFiGeneratorSettings,
  variationLevel: VariationLevel = 'high',
  onProgress?: (progress: number) => void
): Promise<AudioBuffer> {
  const sampleRate = 44100;
  const totalSamples = Math.floor(settings.duration * sampleRate);

  // Create master buffer
  const masterBuffer = new AudioBuffer({
    numberOfChannels: 2, // Stereo
    length: totalSamples,
    sampleRate,
  });

  const leftChannel = masterBuffer.getChannelData(0);
  const rightChannel = masterBuffer.getChannelData(1);

  // Break duration into segments for variation
  const segmentDuration = {
    low: 300,      // 5 minutes per segment
    medium: 180,   // 3 minutes per segment
    high: 120,     // 2 minutes per segment
    extreme: 60,   // 1 minute per segment
  }[variationLevel];

  const numSegments = Math.ceil(settings.duration / segmentDuration);
  const beatDuration = 60 / settings.bpm;
  const beatsPerBar = 4;

  // Generate patterns for each segment
  let allDrums: Array<{ time: number; type: 'kick' | 'snare' | 'hihat'; velocity: number }> = [];
  let allChords: Array<{ time: number; frequencies: number[]; duration: number }> = [];
  let allMelody: Array<{ time: number; note: number; duration: number; velocity: number }> = [];

  onProgress?.(5);

  for (let segment = 0; segment < numSegments; segment++) {
    const segmentStartTime = segment * segmentDuration;
    const segmentEndTime = Math.min((segment + 1) * segmentDuration, settings.duration);
    const segmentDurationActual = segmentEndTime - segmentStartTime;
    const segmentBars = Math.ceil(segmentDurationActual / (beatDuration * beatsPerBar));

    // Evolve BPM slightly for variation (within ±5 BPM)
    const segmentBpm = settings.bpm + (Math.sin(segment * 0.5) * 3);
    const segmentBeatDuration = 60 / segmentBpm;

    // Generate patterns for this segment
    const drums = generateDrumPattern(segmentBpm, segmentBars, 0.05, variationLevel, segment);
    const chords = generateChordProgression(settings.key, settings.scale, segmentBars, segmentBpm, variationLevel, segment);
    const melody = generateMelody(settings.key, settings.scale, segmentDurationActual, segmentBpm, variationLevel, segment);

    // Offset times by segment start
    allDrums.push(...drums.map(d => ({ ...d, time: d.time + segmentStartTime })));
    allChords.push(...chords.map(c => ({ ...c, time: c.time + segmentStartTime })));
    allMelody.push(...melody.map(m => ({ ...m, time: m.time + segmentStartTime })));

    onProgress?.(5 + (segment / numSegments) * 30);
  }

  // Sort all patterns by time
  allDrums.sort((a, b) => a.time - b.time);
  allChords.sort((a, b) => a.time - b.time);
  allMelody.sort((a, b) => a.time - b.time);

  // Key to MIDI note offset
  const keyOffsets: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
  };
  const keyOffset = keyOffsets[settings.key] || 0;

  // Render drums
  onProgress?.(35);
  for (const hit of allDrums) {
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
  onProgress?.(50);
  for (const chordChange of allChords) {
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
  onProgress?.(65);
  for (const note of allMelody) {
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

