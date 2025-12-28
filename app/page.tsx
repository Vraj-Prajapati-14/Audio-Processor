import AudioProcessor from '@/components/AudioProcessor';
import styles from './Home.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AudioFX Pro - Free Online Audio Effects Processor | Lofi, Reverb, Delay & More',
  description: 'Transform your audio files with professional effects. Add lofi, reverb, delay, distortion, and more. Fast, free, and completely private - all processing happens in your browser.',
  alternates: {
    canonical: 'https://www.audiofxpro.com',
  },
  openGraph: {
    title: 'AudioFX Pro - Free Online Audio Effects Processor',
    description: 'Transform your audio files with professional effects. Lofi, reverb, delay, and more.',
    url: 'https://www.audiofxpro.com',
    siteName: 'AudioFX Pro',
    locale: 'en_US',
    type: 'website',
  },
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AudioFX Pro',
    url: 'https://www.audiofxpro.com',
    description: 'A free online tool to process audio files with professional effects including lofi, reverb, delay, distortion, and more.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Lofi Audio Effect',
      'Reverb Effect',
      'Delay/Echo Effect',
      'Distortion',
      'Pitch Shifting',
      'Lowpass Filter',
      'Highpass Filter',
      'Volume Control',
      'Client-Side Processing',
      'Free Audio Processing'
    ]
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Transform Your Audio with Professional Effects
        </h1>
        <p className={styles.subtitle}>
          Add lofi, reverb, delay, distortion, and more to your audio files. Fast, free, and completely private - all processing happens in your browser.
        </p>
      </section>

      <AudioProcessor />

      <section className={styles.section}>
        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Why Choose AudioFX Pro?</h2>
          <div className={styles.grid}>
            <div>
              <h3 className={styles.featureTitle}>🎵 Professional Effects</h3>
              <p className={styles.text}>
                Access a wide range of audio effects including lofi, reverb, delay, distortion, pitch shifting, and filters. Create the perfect sound for your projects.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>⚡ Instant Processing</h3>
              <p className={styles.text}>
                Process your audio files instantly using advanced Web Audio API technology. No waiting for uploads or server processing.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>🔒 Complete Privacy</h3>
              <p className={styles.text}>
                All audio processing happens locally in your browser. Your files never leave your device, ensuring complete privacy and security.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>🆓 100% Free</h3>
              <p className={styles.text}>
                Use all features completely free, with no watermarks, no limits, and no registration required. Process as many files as you want.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>📱 Works Everywhere</h3>
              <p className={styles.text}>
                Fully responsive design that works seamlessly on desktop, tablet, and mobile devices. Process audio on any device, anywhere.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>🎛️ Real-time Controls</h3>
              <p className={styles.text}>
                Adjust effect parameters in real-time with intuitive sliders and controls. Preview your changes before processing.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>What audio formats are supported?</h4>
              <p className={styles.text}>
                AudioFX Pro supports a wide range of audio formats including MP3, MPEG, M4A, WAV, OGG, FLAC, AAC, WMA, OPUS, WEBM, 3GP, AMR, AIFF, AU, RA, and more. Your browser will handle the format conversion automatically using the Web Audio API.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Is my audio data secure?</h4>
              <p className={styles.text}>
                Yes! All audio processing happens entirely in your browser using Web Audio API. Your files never leave your device and are never uploaded to any server.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Can I combine multiple effects?</h4>
              <p className={styles.text}>
                Absolutely! You can enable and combine multiple effects at the same time. For example, you can add lofi, reverb, and delay all together for unique sound combinations.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>What is the lofi effect?</h4>
              <p className={styles.text}>
                The lofi effect simulates the warm, nostalgic sound of lo-fi music by applying a lowpass filter to reduce high frequencies, creating that characteristic "vintage" sound.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Are there any file size limits?</h4>
              <p className={styles.text}>
                The processing is limited by your browser's memory capabilities. Generally, files up to 50-100MB work well, but performance may vary based on your device.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Can I use this for commercial projects?</h4>
              <p className={styles.text}>
                Yes, AudioFX Pro is free to use for both personal and commercial projects. There are no restrictions on how you use the processed audio files.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

