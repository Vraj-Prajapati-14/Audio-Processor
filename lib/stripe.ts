import Stripe from 'stripe';

// Stripe is optional - only initialize if configured (for future switching)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  pro: {
    monthly: {
      priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
      amount: 19900, // $199 in cents
      name: 'Pro Monthly',
      interval: 'month',
    },
    quarterly: {
      priceId: process.env.STRIPE_PRO_QUARTERLY_PRICE_ID || '',
      amount: 53730, // $179.10/month * 3 = $537.30 (10% discount)
      name: 'Pro Quarterly',
      interval: 'month',
      intervalCount: 3,
    },
    yearly: {
      priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
      amount: 191400, // $159.50/month * 12 = $1914 (20% discount)
      name: 'Pro Yearly',
      interval: 'year',
    },
  },
  premium: {
    monthly: {
      priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
      amount: 49900, // $499 in cents
      name: 'Premium Monthly',
      interval: 'month',
    },
    quarterly: {
      priceId: process.env.STRIPE_PREMIUM_QUARTERLY_PRICE_ID || '',
      amount: 134730, // $449.10/month * 3 = $1347.30 (10% discount)
      name: 'Premium Quarterly',
      interval: 'month',
      intervalCount: 3,
    },
    yearly: {
      priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
      amount: 479040, // $399.20/month * 12 = $4790.40 (20% discount)
      name: 'Premium Yearly',
      interval: 'year',
    },
  },
} as const;

export const USAGE_LIMITS = {
  free: { songs: 0 }, // No downloads allowed without subscription
  pro: { songs: 20 },
  premium: { songs: -1 }, // Unlimited
} as const;

export const TRIAL_DAYS = 7;

