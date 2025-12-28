import styles from '../Home.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AudioFX Pro',
  description: 'Privacy policy for AudioFX Pro. Learn how we handle your data and protect your privacy.',
  alternates: {
    canonical: 'https://www.audiofxpro.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>
          Last updated: December 2024
        </p>
      </section>

      <section className={styles.section}>
        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Introduction</h2>
          <p className={styles.text}>
            At AudioFX Pro, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, and protect your information when you use our audio processing tool.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Data Collection</h2>
          <p className={styles.text}>
            <strong>We do not collect, store, or transmit any of your audio files or processed audio.</strong> 
            All audio processing happens entirely in your browser (client-side) using Web Audio API. 
            Your audio files never leave your device - they are processed locally and only exist in your 
            browser's memory during processing.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>No Server Uploads</h2>
          <p className={styles.text}>
            Unlike many other online audio processors, AudioFX Pro does not upload your files to any server. 
            The entire processing pipeline runs in your browser, ensuring complete privacy and security of 
            your audio content.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Analytics</h2>
          <p className={styles.text}>
            We may use anonymous analytics to understand how our tool is used. This includes general 
            usage statistics like page views and browser types. No personal information or audio data 
            is collected. These analytics help us improve the tool and understand user needs.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Cookies</h2>
          <p className={styles.text}>
            We may use essential cookies to ensure the website functions properly. These cookies do not 
            track personal information or browsing behavior across other websites. You can disable cookies 
            in your browser settings, though some features may not work correctly.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Third-Party Services</h2>
          <p className={styles.text}>
            Our website may include links to third-party websites. We are not responsible for the 
            privacy practices of these external sites. We encourage you to review the privacy policies 
            of any third-party sites you visit.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Children's Privacy</h2>
          <p className={styles.text}>
            AudioFX Pro is not intended for children under 13 years of age. We do not knowingly collect 
            any information from children under 13. If you are a parent or guardian and believe your child 
            has provided us with information, please contact us.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
          <p className={styles.text}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
            advised to review this Privacy Policy periodically for any changes.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Contact Us</h2>
          <p className={styles.text}>
            If you have any questions about this Privacy Policy, please contact us through our{' '}
            <a href="/contact" style={{ color: 'var(--accent-primary)' }}>
              contact page
            </a>.
          </p>
        </div>
      </section>
    </div>
  );
}

