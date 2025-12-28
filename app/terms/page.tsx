import styles from '../Home.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | AudioFX Pro',
  description: 'Terms of service for AudioFX Pro. Read our terms and conditions for using the audio processing tool.',
  alternates: {
    canonical: 'https://www.audiofxpro.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.subtitle}>
          Last updated: December 2024
        </p>
      </section>

      <section className={styles.section}>
        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
          <p className={styles.text}>
            By accessing and using AudioFX Pro, you accept and agree to be bound by the terms and 
            provision of this agreement. If you do not agree to these terms, please do not use the service.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Use License</h2>
          <p className={styles.text}>
            Permission is granted to temporarily use AudioFX Pro for personal, non-commercial, and 
            commercial purposes. This is the grant of a license, not a transfer of title, and under 
            this license you may:
          </p>
          <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
            <li>Use the tool to process audio files</li>
            <li>Use processed audio files for any purpose, including commercial projects</li>
            <li>Share processed audio files</li>
          </ul>
          <p className={styles.text} style={{ marginTop: '16px' }}>
            Under this license you may not:
          </p>
          <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
            <li>Modify or copy the website code or functionality</li>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to reverse engineer or decompile the service</li>
          </ul>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Disclaimer</h2>
          <p className={styles.text}>
            The materials on AudioFX Pro are provided on an 'as is' basis. AudioFX Pro makes no warranties, 
            expressed or implied, and hereby disclaims and negates all other warranties including, without 
            limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, 
            or non-infringement of intellectual property or other violation of rights.
          </p>
          <p className={styles.text}>
            Further, AudioFX Pro does not warrant or make any representations concerning the accuracy, 
            likely results, or reliability of the use of the materials on its website or otherwise relating 
            to such materials or on any sites linked to this site.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Limitations</h2>
          <p className={styles.text}>
            In no event shall AudioFX Pro or its suppliers be liable for any damages (including, without 
            limitation, damages for loss of data or profit, or due to business interruption) arising out 
            of the use or inability to use the materials on AudioFX Pro, even if AudioFX Pro or an authorized 
            representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Accuracy of Materials</h2>
          <p className={styles.text}>
            The materials appearing on AudioFX Pro could include technical, typographical, or photographic 
            errors. AudioFX Pro does not warrant that any of the materials on its website are accurate, 
            complete, or current. AudioFX Pro may make changes to the materials contained on its website 
            at any time without notice.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Links</h2>
          <p className={styles.text}>
            AudioFX Pro has not reviewed all of the sites linked to its website and is not responsible 
            for the contents of any such linked site. The inclusion of any link does not imply endorsement 
            by AudioFX Pro of the site. Use of any such linked website is at the user's own risk.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Modifications</h2>
          <p className={styles.text}>
            AudioFX Pro may revise these terms of service for its website at any time without notice. 
            By using this website you are agreeing to be bound by the then current version of these 
            terms of service.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Governing Law</h2>
          <p className={styles.text}>
            These terms and conditions are governed by and construed in accordance with applicable laws, 
            and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </div>

        <div className="glass-card">
          <h2 className={styles.sectionTitle}>Contact Information</h2>
          <p className={styles.text}>
            If you have any questions about these Terms of Service, please contact us through our{' '}
            <a href="/contact" style={{ color: 'var(--accent-primary)' }}>
              contact page
            </a>.
          </p>
        </div>
      </section>
    </div>
  );
}

