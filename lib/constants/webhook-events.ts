/**
 * Webhook Event Constants
 * All Razorpay and Stripe webhook events handled by the system
 */

// Razorpay Webhook Events
export const RAZORPAY_WEBHOOK_EVENTS = {
  // Subscription Events
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_CHARGED: 'subscription.charged',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_PAUSED: 'subscription.paused',
  SUBSCRIPTION_RESUMED: 'subscription.resumed',
  SUBSCRIPTION_COMPLETED: 'subscription.completed',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  
  // Payment Events
  PAYMENT_AUTHORIZED: 'payment.authorized',
  PAYMENT_CAPTURED: 'payment.captured',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_PARTIALLY_REFUNDED: 'payment.partially_refunded',
  
  // Order Events
  ORDER_PAID: 'order.paid',
  ORDER_PAYMENT_FAILED: 'order.payment_failed',
} as const;

export type RazorpayWebhookEvent = typeof RAZORPAY_WEBHOOK_EVENTS[keyof typeof RAZORPAY_WEBHOOK_EVENTS];

// Stripe Webhook Events (for future use)
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CHARGE_SUCCEEDED: 'charge.succeeded',
  CHARGE_FAILED: 'charge.failed',
  CHARGE_REFUNDED: 'charge.refunded',
} as const;

export type StripeWebhookEvent = typeof STRIPE_WEBHOOK_EVENTS[keyof typeof STRIPE_WEBHOOK_EVENTS];

/**
 * All webhook events (union type)
 */
export type WebhookEvent = RazorpayWebhookEvent | StripeWebhookEvent;

/**
 * Check if event is a subscription event
 */
export function isSubscriptionEvent(event: string): boolean {
  return event.startsWith('subscription.') || 
         event.startsWith('customer.subscription.');
}

/**
 * Check if event is a payment event
 */
export function isPaymentEvent(event: string): boolean {
  return event.startsWith('payment.') || 
         event.startsWith('invoice.') || 
         event.startsWith('charge.') ||
         event.startsWith('order.');
}

