/**
 * Subscription Validation Utilities
 * Helper functions for validating subscription-related data
 */

import { 
  SUBSCRIPTION_PLANS,
  BILLING_PERIODS,
  type SubscriptionPlan,
  type BillingPeriod,
} from '../constants/subscription-status';
import { ERROR_CODES, getErrorMessage } from '../constants/error-codes';

/**
 * Validate subscription plan
 */
export function validatePlan(plan: string): plan is SubscriptionPlan {
  return Object.values(SUBSCRIPTION_PLANS).includes(plan as SubscriptionPlan);
}

/**
 * Validate billing period
 */
export function validateBillingPeriod(billingPeriod: string): billingPeriod is BillingPeriod {
  return Object.values(BILLING_PERIODS).includes(billingPeriod as BillingPeriod);
}

/**
 * Validate plan and billing period combination
 */
export function validatePlanAndBillingPeriod(plan: string, billingPeriod: string): {
  valid: boolean;
  error?: string;
  errorCode?: string;
} {
  if (!validatePlan(plan)) {
    return {
      valid: false,
      error: getErrorMessage(ERROR_CODES.INVALID_PLAN),
      errorCode: ERROR_CODES.INVALID_PLAN,
    };
  }

  if (plan === SUBSCRIPTION_PLANS.FREE) {
    return {
      valid: false,
      error: 'Free plan does not require subscription',
      errorCode: ERROR_CODES.INVALID_PLAN,
    };
  }

  if (!validateBillingPeriod(billingPeriod)) {
    return {
      valid: false,
      error: getErrorMessage(ERROR_CODES.INVALID_BILLING_PERIOD),
      errorCode: ERROR_CODES.INVALID_BILLING_PERIOD,
    };
  }

  return { valid: true };
}

/**
 * Validate amount (must be positive)
 */
export function validateAmount(amount: number): {
  valid: boolean;
  error?: string;
  errorCode?: string;
} {
  if (amount <= 0) {
    return {
      valid: false,
      error: getErrorMessage(ERROR_CODES.INVALID_AMOUNT),
      errorCode: ERROR_CODES.INVALID_AMOUNT,
    };
  }

  return { valid: true };
}

