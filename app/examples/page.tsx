import styles from '../Home.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Examples | AudioFX Pro - Audio Effect Examples',
  description: 'See examples of how to use AudioFX Pro for different use cases. Learn how to create lofi music, add reverb to vocals, and more.',
  alternates: {
    canonical: 'https://www.audiofxpro.com/examples',
  },
};

export default function ExamplesPage() {
  const examples = [
    {
      title: 'Creating Lofi Hip-Hop',
      description: 'Perfect for creating that chill, nostalgic lofi sound',
      steps: [
        'Upload your music track',
        'Enable the Lofi effect',
        'Set lowpass frequency to around 3000-4000 Hz',
        'Add subtle reverb (room size: 0.3-0.5, wet: 0.2-0.3)',
        'Optionally add light delay (delay time: 0.2s, feedback: 0.2, wet: 0.2)',
        'Process and enjoy your lofi track',
      ],
    },
    {
      title: 'Adding Reverb to Vocals',
      description: 'Give your vocals depth and space',
      steps: [
        'Upload your vocal recording',
        'Enable the Reverb effect',
        'Set room size to 0.6-0.8 for larger spaces',
        'Adjust wet level to 0.2-0.4 for subtle reverb (higher for more dramatic effect)',
        'Process and download',
      ],
    },
    {
      title: 'Creating Echo/Delay Effects',
      description: 'Add rhythmic echoes to your audio',
      steps: [
        'Upload your audio file',
        'Enable the Delay effect',
        'Set delay time (0.3-0.5s for quick echoes, 0.8-1.5s for slower repeats)',
        'Adjust feedback to control how many repetitions occur',
        'Set wet level to blend the echo with the original',
        'Process to hear the delay effect',
      ],
    },
    {
      title: 'Pitch Correction',
      description: 'Fine-tune the pitch of vocals or instruments',
      steps: [
        'Upload your audio file',
        'Enable the Pitch Shift effect',
        'Adjust semitones (+1 to +3 for higher pitch, -1 to -3 for lower)',
        'Process and preview',
        'Fine-tune as needed',
      ],
    },
    {
      title: 'Distorted Guitar Sound',
      description: 'Add grit and edge to your guitar recordings',
      steps: [
        'Upload your guitar recording',
        'Enable the Distortion effect',
        'Start with amount around 0.3-0.5',
        'Add a lowpass filter (frequency: 5000-8000 Hz) to tame harsh highs',
        'Adjust volume if needed',
        'Process for your distorted guitar sound',
      ],
    },
    {
      title: 'Podcast Audio Enhancement',
      description: 'Clean and enhance podcast recordings',
      steps: [
        'Upload your podcast audio',
        'Enable Highpass filter (frequency: 80-120 Hz) to remove low-end rumble',
        'Enable Lowpass filter (frequency: 8000-12000 Hz) to reduce harshness',
        'Add subtle reverb for warmth (wet: 0.1-0.2)',
        'Adjust volume to optimal levels',
        'Process for clean, professional podcast audio',
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Usage Examples</h1>
        <p className={styles.subtitle}>
          Learn how to use AudioFX Pro for different audio processing scenarios.
        </p>
      </section>

      <section className={styles.section}>
        {examples.map((example, index) => (
          <div key={index} className="glass-card">
            <h2 className={styles.sectionTitle} style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              {example.title}
            </h2>
            <p className={styles.text} style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
              {example.description}
            </p>
            <div className={styles.text}>
              <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
                {example.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        ))}

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Experiment and Create</h2>
          <p className={styles.text}>
            These examples are just starting points. Don't be afraid to experiment with different 
            effect combinations and parameter settings. Each audio file is unique, and the best 
            settings will depend on your source material and desired outcome.
          </p>
          <p className={styles.text}>
            Remember, you can always process a file multiple times - apply effects in stages or 
            create unique sound combinations by processing the output of one effect chain through 
            another set of effects.
          </p>
        </div>
      </section>
    </div>
  );
}

