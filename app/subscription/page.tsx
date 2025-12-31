'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, X, Calendar, Music, CreditCard, AlertCircle } from 'lucide-react';
import styles from './subscription.module.css';
import Link from 'next/link';

interface SubscriptionStatus {
  plan: 'free' | 'pro' | 'premium';
  status: string;
  isActive: boolean;
  isTrialing: boolean;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
}

interface UsageInfo {
  currentUsage: number;
  limit: number;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchSubscriptionStatus();
      fetchUsage();
    }
  }, [status, router]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      
      if (!response.ok) {
        // Handle unauthorized - redirect to login
        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }
        
        // Try to get error message from response
        let errorMessage = 'Failed to fetch subscription status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // If JSON parsing fails, use default message
        }
        
        console.error('Failed to fetch subscription status:', errorMessage);
        // Set subscription to null to show "No Subscription" state
        setSubscription(null);
        return;
      }
      
      const data = await response.json();
      // Ensure we have a valid subscription object with plan
      if (data && data.plan) {
        setSubscription(data);
      } else {
        // If no plan, treat as no subscription
        setSubscription(null);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      // Set subscription to null to show "No Subscription" state
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'songs' }),
      });
      const data = await response.json();
      if (data.currentUsage !== undefined) {
        setUsage({ currentUsage: data.currentUsage, limit: data.limit });
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.')) {
      return;
    }

    setCanceling(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Subscription will be canceled at the end of the current period.');
        fetchSubscriptionStatus();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!subscription || !subscription.plan) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>No Subscription</h1>
          <p className={styles.text}>You don't have an active subscription.</p>
          <div className={styles.ctaSection}>
            <Link href="/pricing" className={styles.upgradeButton}>
              View Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = subscription.isActive;
  const isTrial = subscription.isTrialing;
  const planName = subscription.plan 
    ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
    : 'Free';

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Subscription Management</h1>

      <div className={styles.card}>
        <div className={styles.statusHeader}>
          <div>
            <h2 className={styles.planName}>{planName} Plan</h2>
            <div className={styles.statusBadge}>
              {isTrial && (
                <span className={styles.trialBadge}>
                  <Calendar size={16} />
                  Trial
                </span>
              )}
              <span className={`${styles.status} ${isActive ? styles.active : styles.inactive}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {usage && (
          <div className={styles.usageSection}>
            <h3 className={styles.sectionTitle}>
              <Music size={20} />
              Usage This Period
            </h3>
            <div className={styles.usageBar}>
              <div
                className={styles.usageFill}
                style={{
                  width: usage.limit === -1
                    ? '100%'
                    : `${Math.min((usage.currentUsage / usage.limit) * 100, 100)}%`,
                }}
              />
            </div>
            <p className={styles.usageText}>
              {usage.limit === -1
                ? `Unlimited songs (${usage.currentUsage} used)`
                : `${usage.currentUsage} of ${usage.limit} songs used`}
            </p>
          </div>
        )}

        {subscription.currentPeriodEnd && (
          <div className={styles.infoRow}>
            <Calendar size={20} />
            <div>
              <p className={styles.infoLabel}>
                {isTrial ? 'Trial ends' : 'Next billing date'}
              </p>
              <p className={styles.infoValue}>
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {subscription.plan === 'free' ? (
          <div className={styles.ctaSection}>
            <p className={styles.ctaText}>Upgrade to unlock all features</p>
            <Link href="/pricing" className={styles.upgradeButton}>
              View Plans
            </Link>
          </div>
        ) : (
          <div className={styles.actions}>
            {isActive && (
              <button
                onClick={handleCancel}
                className={styles.cancelButton}
                disabled={canceling}
              >
                {canceling ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            )}
            {!isActive && (
              <Link href="/pricing" className={styles.upgradeButton}>
                Reactivate Subscription
              </Link>
            )}
          </div>
        )}
      </div>

      <div className={styles.featuresCard}>
        <h3 className={styles.sectionTitle}>Plan Features</h3>
        <div className={styles.features}>
          {subscription.plan === 'pro' ? (
            <>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>20 songs per month</span>
              </div>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>All audio effects</span>
              </div>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>Lofi generator</span>
              </div>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>Advanced editing tools</span>
              </div>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>Priority support</span>
              </div>
            </>
          ) : subscription.plan === 'premium' ? (
            <>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>Unlimited songs</span>
              </div>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>All audio effects</span>
              </div>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>Lofi generator</span>
              </div>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>Advanced editing tools</span>
              </div>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>Priority support</span>
              </div>
              <div className={styles.feature}>
                <Check size={20} className={styles.checkIcon} />
                <span>Commercial license</span>
              </div>
            </>
          ) : (
            <div className={styles.noFeatures}>
              <AlertCircle size={20} />
              <span>No active subscription</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

