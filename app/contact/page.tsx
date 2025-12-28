import styles from '../Home.module.css';
import { Metadata } from 'next';
import { Mail, MessageSquare, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | AudioFX Pro',
  description: 'Contact AudioFX Pro for questions, feedback, or support. We are here to help!',
  alternates: {
    canonical: 'https://www.audiofxpro.com/contact',
  },
};

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          Have questions, feedback, or need help? We'd love to hear from you!
        </p>
      </section>

      <section className={styles.section}>
        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Get in Touch</h2>
          <p className={styles.text}>
            We're here to help! Whether you have questions about using AudioFX Pro, found a bug, 
            have a feature request, or just want to share your feedback, please don't hesitate to 
            reach out.
          </p>
        </div>

        <div className={styles.grid}>
          <div className="glass-card">
            <div style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}>
              <Mail size={32} />
            </div>
            <h3 className={styles.featureTitle}>Email Support</h3>
            <p className={styles.text}>
              For general inquiries, support questions, or feedback, please send us an email. 
              We'll do our best to respond within 24-48 hours.
            </p>
            <p className={styles.text} style={{ marginTop: '16px' }}>
              <a href="mailto:support@audiofxpro.com" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                support@audiofxpro.com
              </a>
            </p>
          </div>

          <div className="glass-card">
            <div style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}>
              <HelpCircle size={32} />
            </div>
            <h3 className={styles.featureTitle}>Need Help?</h3>
            <p className={styles.text}>
              Check out our{' '}
              <a href="/guide" style={{ color: 'var(--accent-primary)' }}>
                user guide
              </a>{' '}
              for detailed instructions on how to use AudioFX Pro, or visit our{' '}
              <a href="/examples" style={{ color: 'var(--accent-primary)' }}>
                examples page
              </a>{' '}
              for use case scenarios.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}>
              <MessageSquare size={32} />
            </div>
            <h3 className={styles.featureTitle}>Feedback</h3>
            <p className={styles.text}>
              Your feedback helps us improve AudioFX Pro. If you have suggestions for new features, 
              improvements, or encounter any issues, please let us know. We value your input!
            </p>
          </div>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <p className={styles.text}>
            Before contacting us, you might find answers to common questions on our homepage FAQ section. 
            We've compiled answers to the most frequently asked questions about AudioFX Pro, including 
            supported formats, privacy concerns, and usage tips.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Report Issues</h2>
          <p className={styles.text}>
            If you encounter any bugs or technical issues while using AudioFX Pro, please report them 
            via email. When reporting issues, please include:
          </p>
          <ul style={{ marginLeft: '20px', lineHeight: '2', marginTop: '16px' }}>
            <li>Your browser and version</li>
            <li>Your operating system</li>
            <li>A description of the issue</li>
            <li>Steps to reproduce the problem (if applicable)</li>
            <li>Any error messages you see</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

