import styles from '../Home.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Guide | How to Use AudioFX Pro Audio Processor',
  description: 'Complete guide on how to use AudioFX Pro to process audio files with professional effects. Learn how to add lofi, reverb, delay, and more.',
  alternates: {
    canonical: 'https://www.audiofxpro.com/guide',
  },
};

export default function GuidePage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>User Guide</h1>
        <p className={styles.subtitle}>
          Learn how to use AudioFX Pro to transform your audio files with professional effects.
        </p>
      </section>

      <section className={styles.section}>
        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Getting Started</h2>
          <div className={styles.text}>
            <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
              <li>Click the "Choose Audio File" button to select an audio file from your device</li>
              <li>Supported formats include MP3, MPEG, M4A, WAV, OGG, FLAC, AAC, WMA, OPUS, WEBM, 3GP, AMR, AIFF, AU, RA, and more</li>
              <li>Once selected, you'll see the file name and size displayed</li>
              <li>Use the effect controls to customize your audio processing</li>
              <li>Click "Process Audio" to apply the effects</li>
              <li>Preview the processed audio using the built-in player</li>
              <li>Download your processed audio file when satisfied</li>
            </ol>
          </div>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Audio Effects Explained</h2>
          <div className={styles.grid}>
            <div>
              <h3 className={styles.featureTitle}>Lofi Effect</h3>
              <p className={styles.text}>
                Creates a warm, nostalgic lo-fi sound by applying a lowpass filter. Adjust the frequency cutoff 
                to control how much high-end is removed. Lower frequencies (around 2000-4000 Hz) create that 
                classic vintage cassette tape sound.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Reverb</h3>
              <p className={styles.text}>
                Adds spatial depth to your audio, simulating the sound of a room or hall. Room size controls 
                the space's dimensions, while wet level controls how much of the reverb effect is mixed with 
                the original signal.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Delay</h3>
              <p className={styles.text}>
                Creates echo effects by repeating the audio signal after a specified delay time. Use delay 
                time to control how long between echoes, and feedback to control how many repetitions occur.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Distortion</h3>
              <p className={styles.text}>
                Adds grit and character to your audio by clipping and shaping the waveform. Higher amounts 
                create more aggressive, overdriven sounds. Great for guitars, synths, or adding edge to any audio.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Pitch Shift</h3>
              <p className={styles.text}>
                Changes the pitch of your audio without affecting playback speed. Adjust in semitones 
                (musical half-steps) from -12 (one octave down) to +12 (one octave up). Perfect for 
                creating harmonies or correcting pitch.
              </p>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Filters</h3>
              <p className={styles.text}>
                Lowpass filters remove high frequencies (above the cutoff), while highpass filters remove 
                low frequencies (below the cutoff). Use filters to shape tone, remove unwanted frequencies, 
                or create creative effects.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Tips for Best Results</h2>
          <div className={styles.text}>
            <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
              <li><strong>Combine effects:</strong> You can enable multiple effects simultaneously for unique sound combinations</li>
              <li><strong>Start subtle:</strong> Begin with lower effect amounts and adjust to taste</li>
              <li><strong>Use volume control:</strong> Processed audio may have different levels - adjust volume as needed</li>
              <li><strong>Process in stages:</strong> For complex effects, you can process the file multiple times</li>
              <li><strong>File size:</strong> Larger files take longer to process - be patient with high-quality sources</li>
              <li><strong>Format:</strong> Output is always WAV format for best quality and compatibility</li>
            </ul>
          </div>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Troubleshooting</h2>
          <div className={styles.text}>
            <p><strong>Audio won't play:</strong> Make sure you've clicked "Process Audio" first. The original file is not automatically processed.</p>
            <p><strong>Processing takes too long:</strong> Large files (50MB+) may take a minute or more. This is normal and processing happens entirely in your browser.</p>
            <p><strong>No sound after processing:</strong> Check that at least one effect is enabled and that volume is not set to 0.</p>
            <p><strong>Browser compatibility:</strong> AudioFX Pro works best in modern browsers (Chrome, Firefox, Safari, Edge). Update your browser if you experience issues.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

