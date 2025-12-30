/**
 * Payment Gateway Configuration
 * 
 * This file allows you to switch between Razorpay and Stripe.
 * Change the PAYMENT_GATEWAY constant to switch providers.
 */

export const PAYMENT_GATEWAY = (process.env.PAYMENT_GATEWAY || 'razorpay').toLowerCase() as 'razorpay' | 'stripe';

export const isRazorpay = PAYMENT_GATEWAY === 'razorpay';
export const isStripe = PAYMENT_GATEWAY === 'stripe';

