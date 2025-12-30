'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import styles from './pricing.module.css';
import Link from 'next/link';

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: 'pro' | 'premium', billingPeriod: 'monthly' | 'quarterly' | 'yearly') => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callback=pricing');
      return;
    }

    setLoading(`${plan}-${billingPeriod}`);
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingPeriod }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
        setLoading(null);
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
      setLoading(null);
    }
  };

  const plans = [
    {
      name: 'Pro',
      icon: <Sparkles size={32} />,
      description: 'Perfect for creators and musicians',
      price: { monthly: 199, quarterly: 179, yearly: 159 },
      features: [
        '20 songs per month',
        'All audio effects',
        'Lofi generator',
        'Advanced editing tools',
        'Priority support',
        '7-day free trial',
      ],
      planId: 'pro' as const,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      name: 'Premium',
      icon: <Crown size={32} />,
      description: 'For professionals and studios',
      price: { monthly: 499, quarterly: 449, yearly: 399 },
      features: [
        'Unlimited songs',
        'All audio effects',
        'Lofi generator',
        'Advanced editing tools',
        'Priority support',
        '7-day free trial',
        'Commercial license',
      ],
      planId: 'premium' as const,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      featured: true,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Choose Your Plan</h1>
        <p className={styles.subtitle}>
          Start with a 7-day free trial. Cancel anytime.
        </p>
      </div>

      <div className={styles.plans}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`${styles.planCard} ${plan.featured ? styles.featured : ''}`}
          >
            {plan.featured && (
              <div className={styles.badge}>Most Popular</div>
            )}
            <div className={styles.planHeader}>
              <div className={styles.icon} style={{ background: plan.gradient }}>
                {plan.icon}
              </div>
              <h2 className={styles.planName}>{plan.name}</h2>
              <p className={styles.planDescription}>{plan.description}</p>
            </div>

            <div className={styles.pricing}>
              <div className={styles.priceRow}>
                <div className={styles.priceGroup}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{plan.price.monthly}</span>
                  <span className={styles.period}>/month</span>
                </div>
                <button
                  className={styles.priceButton}
                  onClick={() => handleCheckout(plan.planId, 'monthly')}
                  disabled={loading !== null}
                  style={{ background: plan.gradient }}
                >
                  {loading === `${plan.planId}-monthly` ? 'Loading...' : 'Start Trial'}
                </button>
              </div>

              <div className={styles.priceRow}>
                <div className={styles.priceGroup}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{plan.price.quarterly}</span>
                  <span className={styles.period}>/month</span>
                  <span className={styles.billingNote}>(billed quarterly)</span>
                </div>
                <button
                  className={styles.priceButton}
                  onClick={() => handleCheckout(plan.planId, 'quarterly')}
                  disabled={loading !== null}
                  style={{ background: plan.gradient }}
                >
                  {loading === `${plan.planId}-quarterly` ? 'Loading...' : 'Start Trial'}
                </button>
              </div>

              <div className={styles.priceRow}>
                <div className={styles.priceGroup}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{plan.price.yearly}</span>
                  <span className={styles.period}>/month</span>
                  <span className={styles.billingNote}>(billed yearly, save 20%)</span>
                </div>
                <button
                  className={styles.priceButton}
                  onClick={() => handleCheckout(plan.planId, 'yearly')}
                  disabled={loading !== null}
                  style={{ background: plan.gradient }}
                >
                  {loading === `${plan.planId}-yearly` ? 'Loading...' : 'Start Trial'}
                </button>
              </div>
            </div>

            <ul className={styles.features}>
              {plan.features.map((feature, index) => (
                <li key={index} className={styles.feature}>
                  <Check size={20} className={styles.checkIcon} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>
          All plans include a 7-day free trial. No credit card required during trial.
          You can cancel anytime.
        </p>
        <p>
          <Link href="/terms" className={styles.link}>Terms of Service</Link> •{' '}
          <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

