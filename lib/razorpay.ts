import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
}

export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// Subscription plans configuration for Razorpay
// Amounts are in paise (INR smallest unit) - 1 INR = 100 paise
export const RAZORPAY_PLANS = {
  pro: {
    monthly: {
      planId: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID || '',
      amount: 19900, // ₹199.00 in paise
      name: 'Pro Monthly',
      interval: 'monthly',
      intervalCount: 1,
    },
    quarterly: {
      planId: process.env.RAZORPAY_PRO_QUARTERLY_PLAN_ID || '',
      amount: 53730, // ₹537.30 (10% discount on ₹597)
      name: 'Pro Quarterly',
      interval: 'monthly',
      intervalCount: 3,
    },
    yearly: {
      planId: process.env.RAZORPAY_PRO_YEARLY_PLAN_ID || '',
      amount: 191400, // ₹1914.00 (20% discount on ₹2388)
      name: 'Pro Yearly',
      interval: 'yearly',
      intervalCount: 1,
    },
  },
  premium: {
    monthly: {
      planId: process.env.RAZORPAY_PREMIUM_MONTHLY_PLAN_ID || '',
      amount: 49900, // ₹499.00 in paise
      name: 'Premium Monthly',
      interval: 'monthly',
      intervalCount: 1,
    },
    quarterly: {
      planId: process.env.RAZORPAY_PREMIUM_QUARTERLY_PLAN_ID || '',
      amount: 134730, // ₹1347.30 (10% discount on ₹1497)
      name: 'Premium Quarterly',
      interval: 'monthly',
      intervalCount: 3,
    },
    yearly: {
      planId: process.env.RAZORPAY_PREMIUM_YEARLY_PLAN_ID || '',
      amount: 479040, // ₹4790.40 (20% discount on ₹5988)
      name: 'Premium Yearly',
      interval: 'yearly',
      intervalCount: 1,
    },
  },
} as const;

// Export usage limits and trial days (same as Stripe)
export { USAGE_LIMITS, TRIAL_DAYS } from './stripe';

