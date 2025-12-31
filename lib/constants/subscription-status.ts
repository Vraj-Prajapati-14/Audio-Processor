/**
 * Subscription Status Constants
 * All possible subscription statuses in the system
 */

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  PAUSED: 'paused',
  EXPIRED: 'expired',
  INACTIVE: 'inactive',
} as const;

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium',
} as const;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];

export const BILLING_PERIODS = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
} as const;

export type BillingPeriod = typeof BILLING_PERIODS[keyof typeof BILLING_PERIODS];

export const PAYMENT_GATEWAYS = {
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
} as const;

export type PaymentGateway = typeof PAYMENT_GATEWAYS[keyof typeof PAYMENT_GATEWAYS];

/**
 * Check if subscription status is considered active
 */
export function isActiveStatus(status: string): boolean {
  return status === SUBSCRIPTION_STATUS.ACTIVE || status === SUBSCRIPTION_STATUS.TRIALING;
}

/**
 * Check if subscription status allows usage
 */
export function allowsUsage(status: string): boolean {
  return isActiveStatus(status) || status === SUBSCRIPTION_STATUS.PAST_DUE;
}

