import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRazorpay } from '@/lib/payment-gateway-config';

// Razorpay imports
import { razorpay } from '@/lib/razorpay';
import crypto from 'crypto';

// Stripe imports (kept for future switching)
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  // Determine which gateway to use based on headers or config
  const contentType = request.headers.get('content-type') || '';
  
  // Razorpay webhook
  if (isRazorpay || request.headers.get('x-razorpay-signature')) {
    return await handleRazorpayWebhook(request);
  }
  
  // Stripe webhook (kept for future switching)
  if (request.headers.get('stripe-signature')) {
    return await handleStripeWebhook(request);
  }

  return NextResponse.json(
    { error: 'Unknown webhook source' },
    { status: 400 }
  );
}

// Razorpay webhook handler
async function handleRazorpayWebhook(request: NextRequest) {
  if (!razorpay) {
    return NextResponse.json(
      { error: 'Razorpay is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!signature || !razorpayWebhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 400 }
    );
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', razorpayWebhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Razorpay webhook signature verification failed');
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    const event = JSON.parse(body);
    const eventType = event.event;

    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged':
        await handleRazorpaySubscriptionActivated(event.payload.subscription.entity);
        break;

      case 'subscription.updated':
        await handleRazorpaySubscriptionUpdated(event.payload.subscription.entity);
        break;

      case 'subscription.cancelled':
      case 'subscription.paused':
        await handleRazorpaySubscriptionCancelled(event.payload.subscription.entity);
        break;

      case 'subscription.resumed':
        await handleRazorpaySubscriptionResumed(event.payload.subscription.entity);
        break;

      case 'payment.failed':
        await handleRazorpayPaymentFailed(event.payload.payment.entity);
        break;

      default:
        console.log(`Unhandled Razorpay webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Webhook handler failed';
    console.error('Razorpay webhook handler error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function handleRazorpaySubscriptionActivated(subscription: any) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer_id;
  const planId = subscription.plan_id;
  const notes = subscription.notes || {};

  const dbSubscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { razorpaySubscriptionId: subscriptionId },
        { razorpayCustomerId: customerId },
      ],
    },
  });

  if (dbSubscription) {
    const status = subscription.status === 'active' ? 'active' : subscription.status === 'authenticated' ? 'trialing' : 'active';
    const currentPeriodEnd = subscription.end_at ? new Date(subscription.end_at * 1000) : null;

    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        razorpaySubscriptionId: subscriptionId,
        razorpayCustomerId: customerId,
        razorpayPlanId: planId,
        razorpayCurrentPeriodEnd: currentPeriodEnd,
        plan: notes.plan || dbSubscription.plan,
        status: status,
        paymentGateway: 'razorpay',
      },
    });
  }
}

async function handleRazorpaySubscriptionUpdated(subscription: any) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer_id;

  const dbSubscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { razorpaySubscriptionId: subscriptionId },
        { razorpayCustomerId: customerId },
      ],
    },
  });

  if (dbSubscription) {
    const status = subscription.status === 'active' ? 'active' : subscription.status === 'cancelled' ? 'canceled' : 'active';
    const currentPeriodEnd = subscription.end_at ? new Date(subscription.end_at * 1000) : null;

    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        razorpayPlanId: subscription.plan_id,
        razorpayCurrentPeriodEnd: currentPeriodEnd,
        status: status,
      },
    });
  }
}

async function handleRazorpaySubscriptionCancelled(subscription: any) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer_id;

  await prisma.subscription.updateMany({
    where: {
      OR: [
        { razorpaySubscriptionId: subscriptionId },
        { razorpayCustomerId: customerId },
      ],
    },
    data: {
      status: 'canceled',
    },
  });
}

async function handleRazorpaySubscriptionResumed(subscription: any) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer_id;

  await prisma.subscription.updateMany({
    where: {
      OR: [
        { razorpaySubscriptionId: subscriptionId },
        { razorpayCustomerId: customerId },
      ],
    },
    data: {
      status: 'active',
    },
  });
}

async function handleRazorpayPaymentFailed(payment: any) {
  const subscriptionId = payment.subscription_id;
  
  if (subscriptionId) {
    await prisma.subscription.updateMany({
      where: { razorpaySubscriptionId: subscriptionId },
      data: {
        status: 'past_due',
      },
    });
  }
}

// Stripe webhook handler (kept for future switching)
async function handleStripeWebhook(request: NextRequest) {
  if (!stripe || !stripeWebhookSecret) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const plan = session.metadata?.plan || 'pro';

        await prisma.subscription.upsert({
          where: { stripeCustomerId: customerId },
          create: {
            userId: session.metadata?.userId || '',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            paymentGateway: 'stripe',
            plan: plan,
            status: subscription.status === 'trialing' ? 'trialing' : 'active',
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          },
          update: {
            stripeSubscriptionId: subscriptionId,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            plan: plan,
            status: subscription.status === 'trialing' ? 'trialing' : 'active',
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (dbSubscription) {
          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              status: subscription.status === 'trialing' ? 'trialing' : 'active',
              trialEndsAt: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : null,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: 'canceled',
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;

          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              status: 'active',
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;

          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              status: 'past_due',
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Webhook handler failed';
    console.error('Stripe webhook handler error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
