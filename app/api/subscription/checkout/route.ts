import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isRazorpay } from '@/lib/payment-gateway-config';
import { TRIAL_DAYS, USAGE_LIMITS } from '@/lib/stripe';

// Razorpay imports
import { razorpay, RAZORPAY_PLANS } from '@/lib/razorpay';

// Stripe imports (kept for future switching)
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { plan, billingPeriod } = await request.json();

    if (!plan || !billingPeriod) {
      return NextResponse.json(
        { error: 'Plan and billing period are required' },
        { status: 400 }
      );
    }

    if (!['pro', 'premium'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    if (!['monthly', 'quarterly', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Invalid billing period' },
        { status: 400 }
      );
    }

    // Use Razorpay by default, fallback to Stripe if configured
    if (isRazorpay) {
      return await handleRazorpayCheckout(session.user.id, session.user.email, session.user.name, plan, billingPeriod, request);
    } else {
      return await handleStripeCheckout(session.user.id, session.user.email, session.user.name, plan, billingPeriod, request);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    console.error('Checkout error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Razorpay checkout handler
async function handleRazorpayCheckout(
  userId: string,
  email: string | null | undefined,
  name: string | null | undefined,
  plan: string,
  billingPeriod: string,
  request: NextRequest
) {
  if (!razorpay) {
    return NextResponse.json(
      { error: 'Razorpay is not configured' },
      { status: 500 }
    );
  }

  const planConfig = RAZORPAY_PLANS[plan as 'pro' | 'premium'][billingPeriod as 'monthly' | 'quarterly' | 'yearly'];
  
  if (!planConfig.planId) {
    return NextResponse.json(
      { error: 'Razorpay plan ID not configured' },
      { status: 500 }
    );
  }

  // Get or create Razorpay customer
  let customerId: string;
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existingSubscription?.razorpayCustomerId) {
    customerId = existingSubscription.razorpayCustomerId;
  } else {
    // Create Razorpay customer
    const customer = await razorpay.customers.create({
      name: name || undefined,
      email: email || undefined,
      notes: {
        userId: userId,
      },
    });
    customerId = customer.id;

    // Create or update subscription record
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId: userId,
        razorpayCustomerId: customerId,
        paymentGateway: 'razorpay',
        plan: plan,
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      },
      update: {
        razorpayCustomerId: customerId,
        paymentGateway: 'razorpay',
      },
    });
  }

  // Create Razorpay subscription
  const subscription = await razorpay.subscriptions.create({
    plan_id: planConfig.planId,
    customer_notify: 1,
    total_count: 9999, // For recurring subscriptions
    start_at: Math.floor((Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000) / 1000), // Start after trial
    notes: {
      userId: userId,
      plan: plan,
      billingPeriod: billingPeriod,
    },
  });

  // Update subscription record with Razorpay subscription ID
  await prisma.subscription.update({
    where: { userId },
    data: {
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: planConfig.planId,
      plan: plan,
      status: 'trialing',
      trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  // Return checkout details (Razorpay handles payment via frontend)
  return NextResponse.json({
    subscriptionId: subscription.id,
    amount: planConfig.amount,
    currency: 'INR',
    customerId: customerId,
    planId: planConfig.planId,
    redirectUrl: `${request.nextUrl.origin}/subscription/razorpay-checkout?subscription_id=${subscription.id}`,
  });
}

// Stripe checkout handler (kept for future switching)
async function handleStripeCheckout(
  userId: string,
  email: string | null | undefined,
  name: string | null | undefined,
  plan: string,
  billingPeriod: string,
  request: NextRequest
) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const priceConfig = SUBSCRIPTION_PLANS[plan as 'pro' | 'premium'][billingPeriod as 'monthly' | 'quarterly' | 'yearly'];
  
  if (!priceConfig.priceId) {
    return NextResponse.json(
      { error: 'Price ID not configured' },
      { status: 500 }
    );
  }

  // Get or create Stripe customer
  let customerId: string;
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existingSubscription?.stripeCustomerId) {
    customerId = existingSubscription.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      email: email || undefined,
      name: name || undefined,
      metadata: {
        userId: userId,
      },
    });
    customerId = customer.id;

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId: userId,
        stripeCustomerId: customerId,
        paymentGateway: 'stripe',
        plan: plan,
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      },
      update: {
        stripeCustomerId: customerId,
        paymentGateway: 'stripe',
      },
    });
  }

  // Create checkout session with trial
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceConfig.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: {
        userId: userId,
        plan: plan,
      },
    },
    success_url: `${request.nextUrl.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.nextUrl.origin}/pricing`,
    metadata: {
      userId: userId,
      plan: plan,
      billingPeriod: billingPeriod,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
