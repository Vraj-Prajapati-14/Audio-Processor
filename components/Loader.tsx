'use client';

import styles from './Loader.module.css';

interface LoaderProps {
  message?: string;
  show?: boolean;
}

export default function Loader({ message = 'Processing...', show = true }: LoaderProps) {
  if (!show) return null;

  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderContent}>
        <div className={styles.spinner}>
          <div className={styles.spinnerCircle}></div>
          <div className={styles.spinnerCircle}></div>
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderMessage}>{message}</p>
      </div>
    </div>
  );
}

