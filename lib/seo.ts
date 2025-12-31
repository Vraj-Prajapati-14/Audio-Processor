import { Metadata } from 'next';

/**
 * SEO Utilities for Audio Presets and Pages
 */

export interface PresetSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
}

/**
 * Generate metadata for Lo-Fi preset page
 */
export function generatePresetPageMetadata(baseUrl: string = 'https://www.audiofxpro.com'): Metadata {
  return {
    title: 'Lo-Fi Audio Presets - Transform Your Sound | AudioFX Pro',
    description: 'Discover 20+ professional Lo-Fi audio presets including Coffee Shop, Rainy Day, Sunset Vibes, and more. One-click presets for instant chill vibes, perfect for studying, relaxing, or creating nostalgic sounds.',
    keywords: [
      'lofi presets',
      'lo-fi audio presets',
      'audio effects presets',
      'chill lofi',
      'coffee shop lofi',
      'rainy day audio',
      'study music presets',
      'relaxing audio presets',
      'vintage audio effects',
      'audio processing',
      'lofi hip hop presets',
      'ambient audio presets',
    ],
    alternates: {
      canonical: `${baseUrl}/#lofi-presets`,
    },
    openGraph: {
      title: 'Lo-Fi Audio Presets - Transform Your Sound',
      description: '20+ professional Lo-Fi presets for instant chill vibes. Perfect for studying, relaxing, or creating nostalgic sounds.',
      url: `${baseUrl}/#lofi-presets`,
      siteName: 'AudioFX Pro',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Lo-Fi Audio Presets - Transform Your Sound',
      description: '20+ professional Lo-Fi presets for instant chill vibes.',
    },
  };
}

/**
 * Generate Schema.org structured data for audio presets
 */
export function generatePresetSchema(baseUrl: string = 'https://www.audiofxpro.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Lo-Fi Audio Presets',
    description: 'Collection of professional Lo-Fi audio effect presets',
    url: `${baseUrl}/#lofi-presets`,
    numberOfItems: 20,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Coffee Shop Lo-Fi Preset',
        description: 'Warm and cozy vibes perfect for studying',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Rainy Day Lo-Fi Preset',
        description: 'Soft and melancholic, like a gentle rain',
      },
      // Add more items as needed
    ],
  };
}

/**
 * Generate preset-specific schema for individual presets
 */
export function generateIndividualPresetSchema(preset: {
  name: string;
  description: string;
  id: string;
  baseUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${preset.name} Lo-Fi Preset`,
    description: preset.description,
    applicationCategory: 'AudioProcessingApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    url: `${preset.baseUrl || 'https://www.audiofxpro.com'}/#lofi-presets/${preset.id}`,
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ schema for preset page
 */
export function generatePresetFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are Lo-Fi audio presets?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lo-Fi audio presets are pre-configured audio effect settings that instantly transform your audio into a warm, nostalgic, chill sound. They combine effects like bit crushing, lowpass filtering, reverb, and delay to create the characteristic Lo-Fi hip-hop sound.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I use Lo-Fi presets?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply upload your audio file, click on any Lo-Fi preset card, and the effects will be instantly applied. You can preview the result and download the processed audio.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the presets free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all Lo-Fi presets are completely free to use. There are no watermarks, no limits, and no registration required.',
        },
      },
    ],
  };
}

/**
 * Generate Schema.org structured data for Lo-Fi generator
 */
export function generateLofiGeneratorSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Lo-Fi Music Generator',
    description: 'Generate seamless, professional Lo-Fi tracks from 1 hour to 24 hours with advanced controls for customization.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Custom Duration (1 hour to 24 hours)',
      'BPM Control (60-120 BPM)',
      'Musical Key Selection',
      'Scale Selection (Major/Minor)',
      'Style Presets (Ambient, Chill, Jazz, Study)',
      'Variation Levels',
      'Advanced Sound Design Controls',
      'Effects Processing',
      'EQ Controls',
      'Volume Control',
    ],
  };
}

/**
 * Generate Schema.org structured data for Audio Effects section
 */
export function generateEffectsSchema(baseUrl: string = 'https://www.audiofxpro.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Professional Audio Effects Suite',
    description: 'Complete collection of professional audio effects including dynamics, time-based effects, modulation, distortion, filters, and spatial effects. Transform your audio with industry-standard processing tools.',
    applicationCategory: 'AudioProcessingApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Dynamics Processing (Compressor, Limiter, Noise Gate, Sidechain)',
      'Time-Based Effects (Reverb, Delay, Chorus, Flanger, Phaser)',
      'Modulation Effects (Tremolo, Vibrato, Auto-Pan, Ring Modulator)',
      'Distortion Effects (Distortion, Bit Crusher, Tape Saturation, Wah-Wah)',
      'Filter Effects (Lowpass, Highpass, Bandpass, Multi-band EQ)',
      'Spatial Effects (Stereo Widener, Pan, Auto-Pan)',
      'Pitch Effects (Pitch Shift, Vibrato)',
      'Special Effects (Lo-Fi, Exciter, Granular)',
      'Real-time Preview',
      'Effect Chain Visualization',
      'Professional Parameter Controls',
      'Preset System',
    ],
    url: `${baseUrl}/#effects`,
    keywords: [
      'audio effects',
      'audio processing',
      'audio effects suite',
      'professional audio effects',
      'reverb',
      'delay',
      'compressor',
      'distortion',
      'audio filters',
      'modulation effects',
      'audio mixing',
      'audio mastering',
    ],
  };
}

