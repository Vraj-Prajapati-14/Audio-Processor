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
  longDescription?: string;
  effects: Partial<AudioEffects>;
  tags: string[];
  useCase?: string;
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
  longDescription: 'Perfect for studying or working. Creates a warm, inviting atmosphere reminiscent of your favorite coffee shop.',
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
  tags: ['study', 'cozy', 'warm', 'work', 'focus'],
  useCase: 'Perfect for studying or working in a cozy environment',
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
  longDescription: 'Creates a peaceful, contemplative atmosphere perfect for reflection and relaxation on quiet days.',
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
  tags: ['relax', 'melancholic', 'peaceful', 'rain', 'calm'],
  useCase: 'Great for relaxation and contemplative moments',
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
  longDescription: 'Designed for deep focus during late-night study sessions. Minimal distractions with a calming atmosphere.',
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
  tags: ['study', 'focus', 'night', 'calm', 'minimal'],
  useCase: 'Perfect for late-night study sessions and deep focus',
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
  longDescription: 'Recreates the warm, analog sound of vintage vinyl records with authentic crackle and warmth.',
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
  tags: ['vintage', 'nostalgic', 'warm', 'retro', 'analog'],
  useCase: 'Perfect for creating nostalgic, retro vibes',
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
  longDescription: 'Emulates the warm, saturated sound of cassette tapes with subtle wow and flutter effects.',
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
  tags: ['tape', 'warm', 'saturation', 'nostalgic', 'retro'],
  useCase: 'Great for adding warm, analog character to your audio',
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
  longDescription: 'Creates an intimate, personal atmosphere perfect for bedroom production and relaxed listening.',
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
  tags: ['intimate', 'personal', 'bedroom', 'relax', 'cozy'],
  useCase: 'Perfect for intimate, personal listening experiences',
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
  longDescription: 'The quintessential Lo-Fi hip-hop sound - perfect for studying, relaxing, or just chilling out.',
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
  tags: ['chill', 'hip-hop', 'classic', 'study', 'relax'],
  useCase: 'The classic Lo-Fi sound for any chill moment',
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
  longDescription: 'Creates an ethereal, floating soundscape perfect for meditation, daydreaming, or ambient listening.',
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
  tags: ['dreamy', 'ethereal', 'ambient', 'float', 'meditation'],
  useCase: 'Perfect for meditation, daydreaming, and ambient listening',
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
  longDescription: 'Evokes feelings of nostalgia and sentimentality, perfect for reflective moments and memories.',
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
  tags: ['nostalgic', 'sentimental', 'warm', 'memories', 'reflective'],
  useCase: 'Great for creating sentimental, memory-evoking atmospheres',
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
  longDescription: 'Provides extra warmth and comfort, like sitting by a cozy fireplace on a cold evening.',
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
  tags: ['warm', 'cozy', 'comfort', 'fireplace', 'comforting'],
  useCase: 'Perfect for creating a warm, comforting atmosphere',
};

/**
 * Sunset Vibes 🌅
 * Warm, golden hour atmosphere
 */
export const sunsetVibesPreset: LoFiPreset = {
  id: 'sunset-vibes',
  name: 'Sunset Vibes',
  emoji: '🌅',
  description: 'Warm, golden hour atmosphere perfect for evening relaxation',
  longDescription: 'Captures the warm, golden glow of sunset with a soothing, relaxed atmosphere perfect for unwinding.',
  effects: {
    lofi: { enabled: true, bitDepth: 10, sampleRate: 16500, lowpassFreq: 7200 },
    reverb: { enabled: true, roomSize: 0.55, dampening: 0.35, wet: 0.32 },
    delay: { enabled: true, delayTime: 0.22, feedback: 0.22, wet: 0.16 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 7200 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.93 },
  },
  tags: ['sunset', 'warm', 'golden', 'evening', 'relax'],
  useCase: 'Perfect for evening relaxation and golden hour vibes',
};

/**
 * City Lights 🌃
 * Urban nightlife, ambient city sounds
 */
export const cityLightsPreset: LoFiPreset = {
  id: 'city-lights',
  name: 'City Lights',
  emoji: '🌃',
  description: 'Urban nightlife with ambient city atmosphere',
  longDescription: 'Evokes the energy and ambiance of city nights with urban vibes and modern atmosphere.',
  effects: {
    lofi: { enabled: true, bitDepth: 9, sampleRate: 17500, lowpassFreq: 6800 },
    reverb: { enabled: true, roomSize: 0.6, dampening: 0.4, wet: 0.38 },
    delay: { enabled: true, delayTime: 0.25, feedback: 0.28, wet: 0.18 },
    distortion: { enabled: true, amount: 0.08 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 6800 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.91 },
  },
  tags: ['urban', 'city', 'night', 'modern', 'ambient'],
  useCase: 'Great for urban vibes and city night atmosphere',
};

/**
 * Forest Walk 🌲
 * Nature-inspired, peaceful and organic
 */
export const forestWalkPreset: LoFiPreset = {
  id: 'forest-walk',
  name: 'Forest Walk',
  emoji: '🌲',
  description: 'Nature-inspired, peaceful and organic sounds',
  longDescription: 'Brings the tranquility of nature indoors with organic, earthy tones perfect for mindfulness.',
  effects: {
    lofi: { enabled: true, bitDepth: 10, sampleRate: 15500, lowpassFreq: 6400 },
    reverb: { enabled: true, roomSize: 0.65, dampening: 0.45, wet: 0.4 },
    delay: { enabled: true, delayTime: 0.28, feedback: 0.25, wet: 0.19 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: -0.5 },
    lowpass: { enabled: true, frequency: 6400 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.9 },
  },
  tags: ['nature', 'forest', 'peaceful', 'organic', 'mindfulness'],
  useCase: 'Perfect for mindfulness, meditation, and nature-inspired moments',
};

/**
 * Study Session 📚
 * Focused, minimal distraction
 */
export const studySessionPreset: LoFiPreset = {
  id: 'study-session',
  name: 'Study Session',
  emoji: '📚',
  description: 'Focused and minimal, designed for deep concentration',
  longDescription: 'Optimized for maximum focus with minimal distractions, perfect for long study sessions.',
  effects: {
    lofi: { enabled: true, bitDepth: 11, sampleRate: 14500, lowpassFreq: 7100 },
    reverb: { enabled: true, roomSize: 0.35, dampening: 0.55, wet: 0.2 },
    delay: { enabled: true, delayTime: 0.12, feedback: 0.1, wet: 0.08 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 7100 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.94 },
  },
  tags: ['study', 'focus', 'concentration', 'minimal', 'academic'],
  useCase: 'Ideal for focused study sessions and deep work',
};

/**
 * Beach Waves 🏖️
 * Relaxing, ocean-inspired
 */
export const beachWavesPreset: LoFiPreset = {
  id: 'beach-waves',
  name: 'Beach Waves',
  emoji: '🏖️',
  description: 'Relaxing ocean-inspired vibes with calming atmosphere',
  longDescription: 'Brings the soothing sounds of the ocean to your audio with a calm, beachy atmosphere.',
  effects: {
    lofi: { enabled: true, bitDepth: 9, sampleRate: 17000, lowpassFreq: 6600 },
    reverb: { enabled: true, roomSize: 0.75, dampening: 0.3, wet: 0.45 },
    delay: { enabled: true, delayTime: 0.32, feedback: 0.35, wet: 0.22 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: -1 },
    lowpass: { enabled: true, frequency: 6600 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.88 },
  },
  tags: ['beach', 'ocean', 'relax', 'calm', 'waves'],
  useCase: 'Perfect for relaxation and beach-inspired moments',
};

/**
 * Winter Morning ❄️
 * Crisp, cozy, fresh
 */
export const winterMorningPreset: LoFiPreset = {
  id: 'winter-morning',
  name: 'Winter Morning',
  emoji: '❄️',
  description: 'Crisp and cozy, like a fresh winter morning',
  longDescription: 'Combines the crisp freshness of winter mornings with cozy warmth, perfect for seasonal vibes.',
  effects: {
    lofi: { enabled: true, bitDepth: 10, sampleRate: 15000, lowpassFreq: 6200 },
    reverb: { enabled: true, roomSize: 0.5, dampening: 0.5, wet: 0.3 },
    delay: { enabled: true, delayTime: 0.2, feedback: 0.2, wet: 0.14 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 6200 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.92 },
  },
  tags: ['winter', 'crisp', 'cozy', 'fresh', 'seasonal'],
  useCase: 'Great for winter vibes and cozy morning atmospheres',
};

/**
 * Retro Arcade 🕹️
 * Nostalgic gaming vibes
 */
export const retroArcadePreset: LoFiPreset = {
  id: 'retro-arcade',
  name: 'Retro Arcade',
  emoji: '🕹️',
  description: 'Nostalgic gaming vibes with retro character',
  longDescription: 'Recreates the nostalgic sound of retro arcade games with authentic 8-bit character.',
  effects: {
    lofi: { enabled: true, bitDepth: 7, sampleRate: 10000, lowpassFreq: 4800 },
    reverb: { enabled: true, roomSize: 0.3, dampening: 0.65, wet: 0.15 },
    delay: { enabled: false, delayTime: 0, feedback: 0, wet: 0 },
    distortion: { enabled: true, amount: 0.3 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 4800 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.86 },
  },
  tags: ['retro', 'arcade', 'gaming', '8-bit', 'nostalgic'],
  useCase: 'Perfect for retro gaming vibes and 8-bit nostalgia',
};

/**
 * Library Ambience 📖
 * Quiet, scholarly atmosphere
 */
export const libraryAmbiencePreset: LoFiPreset = {
  id: 'library-ambience',
  name: 'Library Ambience',
  emoji: '📖',
  description: 'Quiet, scholarly atmosphere perfect for reading',
  longDescription: 'Creates the quiet, focused atmosphere of a library, ideal for reading and scholarly work.',
  effects: {
    lofi: { enabled: true, bitDepth: 11, sampleRate: 14000, lowpassFreq: 6900 },
    reverb: { enabled: true, roomSize: 0.4, dampening: 0.6, wet: 0.24 },
    delay: { enabled: true, delayTime: 0.15, feedback: 0.12, wet: 0.09 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 6900 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.93 },
  },
  tags: ['library', 'quiet', 'scholarly', 'reading', 'focused'],
  useCase: 'Ideal for reading, research, and quiet study',
};

/**
 * Train Journey 🚂
 * Rhythmic, traveling vibes
 */
export const trainJourneyPreset: LoFiPreset = {
  id: 'train-journey',
  name: 'Train Journey',
  emoji: '🚂',
  description: 'Rhythmic, traveling vibes with motion feel',
  longDescription: 'Captures the rhythmic motion of train travel, perfect for creating a sense of movement and journey.',
  effects: {
    lofi: { enabled: true, bitDepth: 9, sampleRate: 16000, lowpassFreq: 6300 },
    reverb: { enabled: true, roomSize: 0.45, dampening: 0.4, wet: 0.26 },
    delay: { enabled: true, delayTime: 0.2, feedback: 0.22, wet: 0.13 },
    distortion: { enabled: true, amount: 0.12 },
    pitch: { enabled: false, semitones: 0 },
    lowpass: { enabled: true, frequency: 6300 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.91 },
  },
  tags: ['train', 'travel', 'rhythmic', 'motion', 'journey'],
  useCase: 'Great for creating rhythmic, traveling atmospheres',
};

/**
 * Sunny Afternoon ☀️
 * Bright, cheerful, uplifting
 */
export const sunnyAfternoonPreset: LoFiPreset = {
  id: 'sunny-afternoon',
  name: 'Sunny Afternoon',
  emoji: '☀️',
  description: 'Bright, cheerful, and uplifting vibes',
  longDescription: 'Brings the brightness and cheer of a sunny afternoon with uplifting, positive energy.',
  effects: {
    lofi: { enabled: true, bitDepth: 10, sampleRate: 18000, lowpassFreq: 7800 },
    reverb: { enabled: true, roomSize: 0.5, dampening: 0.3, wet: 0.3 },
    delay: { enabled: true, delayTime: 0.18, feedback: 0.2, wet: 0.14 },
    distortion: { enabled: false, amount: 0 },
    pitch: { enabled: false, semitones: 1 },
    lowpass: { enabled: true, frequency: 7800 },
    highpass: { enabled: false, frequency: 80 },
    volume: { enabled: true, gain: 0.95 },
  },
  tags: ['sunny', 'bright', 'cheerful', 'uplifting', 'positive'],
  useCase: 'Perfect for bright, cheerful, and uplifting moments',
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
  sunsetVibesPreset,
  cityLightsPreset,
  forestWalkPreset,
  studySessionPreset,
  beachWavesPreset,
  winterMorningPreset,
  retroArcadePreset,
  libraryAmbiencePreset,
  trainJourneyPreset,
  sunnyAfternoonPreset,
];

