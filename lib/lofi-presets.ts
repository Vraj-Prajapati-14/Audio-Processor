/**
 * Lo-Fi Preset Configurations
 * Single-click presets for instant Lo-Fi vibes
 */

import { AudioEffects } from './audio-utils';

export interface LoFiPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  effects: Partial<AudioEffects>;
}

/**
 * Coffee Shop Vibes ☕
 * Warm, cozy, perfect for studying or relaxing
 */
export const coffeeShopPreset: LoFiPreset = {
  id: 'coffee-shop',
  name: 'Coffee Shop',
  emoji: '☕',
  description: 'Warm and cozy vibes perfect for studying',
  effects: {
    lofi: { enabled: true, bitDepth: 10, sampleRate: 16000, lowpassFreq: 8000 },
    reverb: { enabled: true, roomSize: 0.5, dampening: 0.3, wet: 0.3 },
    delay: { enabled: true, delayTime: 0.15, feedback: 0.2, wet: 0.15 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 8000 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.95 },
  },
};

/**
 * Rainy Day 🌧️
 * Soft, melancholic, with a sense of peace
 */
export const rainyDayPreset: LoFiPreset = {
  id: 'rainy-day',
  name: 'Rainy Day',
  emoji: '🌧️',
  description: 'Soft and melancholic, like a gentle rain',
  effects: {
    lofi: { enabled: true, bitDepth: 9, sampleRate: 18000, lowpassFreq: 6000 },
    reverb: { enabled: true, roomSize: 0.7, dampening: 0.4, wet: 0.4 },
    delay: { enabled: true, delayTime: 0.3, feedback: 0.3, wet: 0.2 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: -1 },
    lowpass: { enabled: true, frequency: 6000 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.9 },
  },
};

/**
 * Midnight Study 🌙
 * Focused, calm, perfect for late-night sessions
 */
export const midnightStudyPreset: LoFiPreset = {
  id: 'midnight-study',
  name: 'Midnight Study',
  emoji: '🌙',
  description: 'Focused and calm for late-night sessions',
  effects: {
    lofi: { enabled: true, bitDepth: 11, sampleRate: 14000, lowpassFreq: 7000 },
    reverb: { enabled: true, roomSize: 0.4, dampening: 0.5, wet: 0.25 },
    delay: { enabled: true, delayTime: 0.2, feedback: 0.15, wet: 0.1 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 7000 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.92 },
  },
};

/**
 * Vintage Vinyl 📀
 * Classic vinyl crackle and warmth
 */
export const vintageVinylPreset: LoFiPreset = {
  id: 'vintage-vinyl',
  name: 'Vintage Vinyl',
  emoji: '📀',
  description: 'Classic vinyl warmth with nostalgic crackle',
  effects: {
    lofi: { enabled: true, bitDepth: 8, sampleRate: 11025, lowpassFreq: 5000 },
    reverb: { enabled: true, roomSize: 0.3, dampening: 0.6, wet: 0.2 },
    delay: { enabled: false, delayTime: 0, feedback: 0, wet: 0 },
    distortion: { enabled: true, amount: 0.15 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 5000 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.88 },
  },
};

/**
 * Tape Cassette 📼
 * Warm tape saturation with subtle wow & flutter
 */
export const tapeCassettePreset: LoFiPreset = {
  id: 'tape-cassette',
  name: 'Tape Cassette',
  emoji: '📼',
  description: 'Warm tape saturation with nostalgic feel',
  effects: {
    lofi: { enabled: true, bitDepth: 9, sampleRate: 16000, lowpassFreq: 6500 },
    reverb: { enabled: true, roomSize: 0.35, dampening: 0.55, wet: 0.18 },
    delay: { enabled: false, delayTime: 0, feedback: 0, wet: 0 },
    distortion: { enabled: true, amount: 0.25 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 6500 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.9 },
  },
};

/**
 * Bedroom Beats 🛏️
 * Intimate, personal, cozy bedroom vibes
 */
export const bedroomBeatsPreset: LoFiPreset = {
  id: 'bedroom-beats',
  name: 'Bedroom Beats',
  emoji: '🛏️',
  description: 'Intimate and personal bedroom vibes',
  effects: {
    lofi: { enabled: true, bitDepth: 10, sampleRate: 18000, lowpassFreq: 7500 },
    reverb: { enabled: true, roomSize: 0.45, dampening: 0.35, wet: 0.28 },
    delay: { enabled: true, delayTime: 0.18, feedback: 0.25, wet: 0.12 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 7500 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.93 },
  },
};

/**
 * Chill Lofi 🎧
 * Classic chill Lo-Fi hip-hop sound
 */
export const chillLofiPreset: LoFiPreset = {
  id: 'chill-lofi',
  name: 'Chill Lofi',
  emoji: '🎧',
  description: 'Classic chill Lo-Fi hip-hop vibes',
  effects: {
    lofi: { enabled: true, bitDepth: 8, sampleRate: 12000, lowpassFreq: 5500 },
    reverb: { enabled: true, roomSize: 0.5, dampening: 0.4, wet: 0.3 },
    delay: { enabled: true, delayTime: 0.2, feedback: 0.2, wet: 0.15 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 5500 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.91 },
  },
};

/**
 * Dreamy Vibes 💭
 * Ethereal, floating, dream-like atmosphere
 */
export const dreamyVibesPreset: LoFiPreset = {
  id: 'dreamy-vibes',
  name: 'Dreamy Vibes',
  emoji: '💭',
  description: 'Ethereal and floating dream-like atmosphere',
  effects: {
    lofi: { enabled: true, bitDepth: 10, sampleRate: 17000, lowpassFreq: 7000 },
    reverb: { enabled: true, roomSize: 0.8, dampening: 0.3, wet: 0.5 },
    delay: { enabled: true, delayTime: 0.35, feedback: 0.4, wet: 0.25 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: -2 },
    lowpass: { enabled: true, frequency: 7000 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.87 },
  },
};

/**
 * Nostalgic 🎵
 * Warm, sentimental, memory-inducing
 */
export const nostalgicPreset: LoFiPreset = {
  id: 'nostalgic',
  name: 'Nostalgic',
  emoji: '🎵',
  description: 'Warm and sentimental, memory-inducing',
  effects: {
    lofi: { enabled: true, bitDepth: 9, sampleRate: 15000, lowpassFreq: 6000 },
    reverb: { enabled: true, roomSize: 0.6, dampening: 0.45, wet: 0.35 },
    delay: { enabled: true, delayTime: 0.25, feedback: 0.3, wet: 0.18 },
    distortion: { enabled: true, amount: 0.1 },
    pitch: { enabled: false, semitones: -1 },
    lowpass: { enabled: true, frequency: 6000 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.89 },
  },
};

/**
 * Warm & Cozy 🔥
 * Extra warm, comforting, like a fireplace
 */
export const warmCozyPreset: LoFiPreset = {
  id: 'warm-cozy',
  name: 'Warm & Cozy',
  emoji: '🔥',
  description: 'Extra warm and comforting like a fireplace',
  effects: {
    lofi: { enabled: true, bitDepth: 10, sampleRate: 16000, lowpassFreq: 5800 },
    reverb: { enabled: true, roomSize: 0.4, dampening: 0.5, wet: 0.22 },
    delay: { enabled: false, delayTime: 0, feedback: 0, wet: 0 },
    distortion: { enabled: true, amount: 0.2 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 5800 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.94 },
  },
};

/**
 * All Lo-Fi Presets
 */
export const allLoFiPresets: LoFiPreset[] = [
  coffeeShopPreset,
  rainyDayPreset,
  midnightStudyPreset,
  vintageVinylPreset,
  tapeCassettePreset,
  bedroomBeatsPreset,
  chillLofiPreset,
  dreamyVibesPreset,
  nostalgicPreset,
  warmCozyPreset,
];

