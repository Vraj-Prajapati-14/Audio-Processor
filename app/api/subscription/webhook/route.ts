/**
 * Webhook API Route
 * Handles Razorpay and Stripe webhook events with comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { isRazorpay } from '@/lib/payment-gateway-config';
import { razorpay } from '@/lib/razorpay';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import crypto from 'crypto';
import { webhookService } from '@/lib/services/webhook-service';
import { ERROR_CODES, getErrorMessage } from '@/lib/constants/error-codes';
import { PAYMENT_GATEWAYS } from '@/lib/constants/subscription-status';

const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Determine which gateway to use based on headers or config
    const razorpaySignature = request.headers.get('x-razorpay-signature');
    const stripeSignature = request.headers.get('stripe-signature');

    // Razorpay webhook
    if (isRazorpay || razorpaySignature) {
      return await handleRazorpayWebhook(request);
    }

    // Stripe webhook (kept for future switching)
    if (stripeSignature) {
      return await handleStripeWebhook(request);
    }

    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.WEBHOOK_EVENT_UNKNOWN),
        code: ERROR_CODES.WEBHOOK_EVENT_UNKNOWN,
      },
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Webhook API] Error processing webhook:', errorMessage);
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.WEBHOOK_PROCESSING_FAILED),
        code: ERROR_CODES.WEBHOOK_PROCESSING_FAILED,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle Razorpay webhook
 */
async function handleRazorpayWebhook(request: NextRequest) {
  if (!razorpay) {
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED),
        code: ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED,
      },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!signature || !razorpayWebhookSecret) {
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.WEBHOOK_SECRET_NOT_CONFIGURED),
        code: ERROR_CODES.WEBHOOK_SECRET_NOT_CONFIGURED,
      },
      { status: 400 }
    );
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', razorpayWebhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('[Webhook API] Razorpay webhook signature verification failed');
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.WEBHOOK_SIGNATURE_INVALID),
        code: ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
      },
      { status: 400 }
    );
  }

  try {
    const event = JSON.parse(body);

    // Process webhook using webhook service
    await webhookService.processRazorpayWebhook(event);

    return NextResponse.json({ 
      received: true,
      event: event.event,
      eventId: event.id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Webhook handler failed';
    console.error('[Webhook API] Razorpay webhook handler error:', errorMessage);
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.WEBHOOK_PROCESSING_FAILED),
        code: ERROR_CODES.WEBHOOK_PROCESSING_FAILED,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle Stripe webhook (kept for future switching)
 */
async function handleStripeWebhook(request: NextRequest) {
  if (!stripe || !stripeWebhookSecret) {
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED),
        code: ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED,
      },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (err: any) {
    console.error('[Webhook API] Stripe webhook signature verification failed:', err.message);
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.WEBHOOK_SIGNATURE_INVALID),
        code: ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
        details: err.message,
      },
      { status: 400 }
    );
  }

  try {
    // Create webhook record
    const webhook = await webhookService.createWebhook({
      eventType: event.type,
      eventId: event.id,
      paymentGateway: PAYMENT_GATEWAYS.STRIPE,
      payload: body,
      signature: signature,
    });

    await webhookService.logWebhookEvent(
      webhook.id,
      'info',
      `Processing Stripe webhook: ${event.type}`,
      { eventId: event.id, eventType: event.type }
    );

    // Handle Stripe events (basic implementation - can be extended)
    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        // These would be handled by webhook service if we extend it for Stripe
        await webhookService.logWebhookEvent(
          webhook.id,
          'info',
          `Stripe event ${event.type} received`,
          { eventType: event.type }
        );
        break;

      default:
        await webhookService.logWebhookEvent(
          webhook.id,
          'warning',
          `Unhandled Stripe webhook event: ${event.type}`,
          { eventType: event.type }
        );
    }

    await webhookService.markWebhookProcessed(webhook.id);

    return NextResponse.json({ 
      received: true,
      event: event.type,
      eventId: event.id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Webhook handler failed';
    console.error('[Webhook API] Stripe webhook handler error:', errorMessage);
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.WEBHOOK_PROCESSING_FAILED),
        code: ERROR_CODES.WEBHOOK_PROCESSING_FAILED,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
