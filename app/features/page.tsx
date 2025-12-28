import styles from '../Home.module.css';
import { Metadata } from 'next';
import { Music, Zap, Shield, Download, Sliders, Headphones } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features | AudioFX Pro - Audio Effects Processor',
  description: 'Explore all features of AudioFX Pro. Professional audio effects, instant processing, complete privacy, and more.',
  alternates: {
    canonical: 'https://www.audiofxpro.com/features',
  },
};

export default function FeaturesPage() {
  const features = [
    {
      icon: <Music size={32} />,
      title: '8 Professional Effects',
      description: 'Access lofi, reverb, delay, distortion, pitch shift, lowpass filter, highpass filter, and volume control. Create the perfect sound for any project.',
    },
    {
      icon: <Sliders size={32} />,
      title: 'Precise Control',
      description: 'Adjust every parameter with intuitive sliders and controls. Fine-tune your effects to achieve the exact sound you want.',
    },
    {
      icon: <Zap size={32} />,
      title: 'Instant Processing',
      description: 'Process your audio files instantly using advanced Web Audio API technology. No waiting for uploads or server processing.',
    },
    {
      icon: <Shield size={32} />,
      title: '100% Private',
      description: 'All processing happens in your browser. Your audio files never leave your device, ensuring complete privacy and security.',
    },
    {
      icon: <Download size={32} />,
      title: 'High-Quality Output',
      description: 'Download your processed audio in high-quality WAV format. Maintains original sample rate and quality.',
    },
    {
      icon: <Headphones size={32} />,
      title: 'Built-in Player',
      description: 'Preview your processed audio before downloading. Built-in player with play/pause controls and time display.',
    },
  ];

  const effects = [
    {
      name: 'Lofi Effect',
      description: 'Create warm, nostalgic lo-fi sounds with adjustable lowpass filtering',
    },
    {
      name: 'Reverb',
      description: 'Add spatial depth and room ambience with configurable room size and wet/dry mix',
    },
    {
      name: 'Delay',
      description: 'Echo effects with adjustable delay time, feedback, and mix levels',
    },
    {
      name: 'Distortion',
      description: 'Add grit and character with wave-shaping distortion',
    },
    {
      name: 'Pitch Shift',
      description: 'Change pitch by semitones (-12 to +12) while maintaining audio quality',
    },
    {
      name: 'Filters',
      description: 'Lowpass and highpass filters for precise frequency control',
    },
    {
      name: 'Volume Control',
      description: 'Adjust gain from 0x to 2x for perfect levels',
    },
  ];

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Features</h1>
        <p className={styles.subtitle}>
          Powerful features to transform your audio files effortlessly.
        </p>
      </section>

      <section className={styles.section}>
        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Core Features</h2>
          <div className={styles.grid}>
            {features.map((feature, index) => (
              <div key={index} style={{ padding: '20px' }}>
                <div style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.text}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Available Audio Effects</h2>
          <div className={styles.grid}>
            {effects.map((effect, index) => (
              <div key={index} style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                <h3 className={styles.featureTitle} style={{ fontSize: '1.125rem', marginBottom: '8px' }}>
                  {effect.name}
                </h3>
                <p className={styles.text} style={{ fontSize: '0.875rem', margin: 0 }}>
                  {effect.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Why Choose AudioFX Pro?</h2>
          <p className={styles.text}>
            AudioFX Pro is designed for anyone who needs professional-quality audio processing without 
            the complexity of traditional audio software. Whether you're a musician, podcaster, content 
            creator, or just experimenting with sound, our tool makes it simple to achieve professional 
            results. All processing happens instantly in your browser, with no software installation, 
            no file size limits (within browser constraints), and complete privacy.
          </p>
          <p className={styles.text}>
            The tool is completely free to use for both personal and commercial projects. There are no 
            watermarks, no hidden fees, and no registration required. Just upload, process, and download.
          </p>
        </div>
      </section>
    </div>
  );
}

