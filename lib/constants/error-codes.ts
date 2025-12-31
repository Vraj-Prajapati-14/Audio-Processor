/**
 * Error Code Constants
 * Standardized error codes for subscription system
 */

export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Subscription Errors
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  SUBSCRIPTION_ALREADY_EXISTS: 'SUBSCRIPTION_ALREADY_EXISTS',
  INVALID_SUBSCRIPTION_STATUS: 'INVALID_SUBSCRIPTION_STATUS',
  SUBSCRIPTION_CANCELED: 'SUBSCRIPTION_CANCELED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  
  // Payment Errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  
  // Webhook Errors
  WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
  WEBHOOK_EVENT_UNKNOWN: 'WEBHOOK_EVENT_UNKNOWN',
  WEBHOOK_PROCESSING_FAILED: 'WEBHOOK_PROCESSING_FAILED',
  
  // Validation Errors
  INVALID_PLAN: 'INVALID_PLAN',
  INVALID_BILLING_PERIOD: 'INVALID_BILLING_PERIOD',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Configuration Errors
  PAYMENT_GATEWAY_NOT_CONFIGURED: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
  PLAN_NOT_CONFIGURED: 'PLAN_NOT_CONFIGURED',
  WEBHOOK_SECRET_NOT_CONFIGURED: 'WEBHOOK_SECRET_NOT_CONFIGURED',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  USAGE_LIMIT_EXCEEDED: 'USAGE_LIMIT_EXCEEDED',
  
  // General Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
  SUBSCRIPTION_ALREADY_EXISTS: 'Subscription already exists',
  INVALID_SUBSCRIPTION_STATUS: 'Invalid subscription status',
  SUBSCRIPTION_CANCELED: 'Subscription has been canceled',
  SUBSCRIPTION_EXPIRED: 'Subscription has expired',
  PAYMENT_FAILED: 'Payment processing failed',
  PAYMENT_NOT_FOUND: 'Payment not found',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  PAYMENT_GATEWAY_ERROR: 'Payment gateway error',
  WEBHOOK_SIGNATURE_INVALID: 'Webhook signature verification failed',
  WEBHOOK_EVENT_UNKNOWN: 'Unknown webhook event type',
  WEBHOOK_PROCESSING_FAILED: 'Failed to process webhook',
  INVALID_PLAN: 'Invalid subscription plan',
  INVALID_BILLING_PERIOD: 'Invalid billing period',
  INVALID_AMOUNT: 'Invalid payment amount',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  PAYMENT_GATEWAY_NOT_CONFIGURED: 'Payment gateway is not configured',
  PLAN_NOT_CONFIGURED: 'Subscription plan is not configured',
  WEBHOOK_SECRET_NOT_CONFIGURED: 'Webhook secret is not configured',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  USAGE_LIMIT_EXCEEDED: 'Usage limit exceeded',
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  EXTERNAL_API_ERROR: 'External API error',
};

/**
 * Get error message for error code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR;
}

