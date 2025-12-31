'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import styles from '../subscription.module.css';

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription status
    if (sessionId) {
      // The webhook will handle the subscription update
      setTimeout(() => {
        router.refresh();
      }, 2000);
    }
  }, [sessionId, router]);

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 24px' }} />
        <h1 className={styles.title}>Subscription Activated!</h1>
        <p className={styles.text}>
          Thank you for subscribing! Your 7-day free trial has started.
          You can now access all features of your plan.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' }}>
          <Link href="/" className={styles.upgradeButton}>
            Start Processing
          </Link>
          <Link href="/subscription" className={styles.button} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
            View Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card} style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}

