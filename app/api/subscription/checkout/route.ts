/**
 * Checkout API Route
 * Handles subscription checkout with proper error handling and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isRazorpay } from '@/lib/payment-gateway-config';
import { TRIAL_DAYS } from '@/lib/stripe';
import { razorpay, RAZORPAY_PLANS } from '@/lib/razorpay';
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { subscriptionService } from '@/lib/services/subscription-service';
import { 
  SUBSCRIPTION_PLANS as PLAN_CONSTANTS,
  BILLING_PERIODS,
  PAYMENT_GATEWAYS,
  type SubscriptionPlan,
  type BillingPeriod,
} from '@/lib/constants/subscription-status';
import { ERROR_CODES, getErrorMessage } from '@/lib/constants/error-codes';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          error: getErrorMessage(ERROR_CODES.UNAUTHORIZED),
          code: ERROR_CODES.UNAUTHORIZED,
        },
        { status: 401 }
      );
    }

    const { plan, billingPeriod } = await request.json();

    // Validation
    if (!plan || !billingPeriod) {
      return NextResponse.json(
        { 
          error: getErrorMessage(ERROR_CODES.MISSING_REQUIRED_FIELD),
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
          details: 'Plan and billing period are required',
        },
        { status: 400 }
      );
    }

    if (!Object.values(PLAN_CONSTANTS).includes(plan as SubscriptionPlan) || plan === PLAN_CONSTANTS.FREE) {
      return NextResponse.json(
        { 
          error: getErrorMessage(ERROR_CODES.INVALID_PLAN),
          code: ERROR_CODES.INVALID_PLAN,
        },
        { status: 400 }
      );
    }

    if (!Object.values(BILLING_PERIODS).includes(billingPeriod as BillingPeriod)) {
      return NextResponse.json(
        { 
          error: getErrorMessage(ERROR_CODES.INVALID_BILLING_PERIOD),
          code: ERROR_CODES.INVALID_BILLING_PERIOD,
        },
        { status: 400 }
      );
    }

    // Use Razorpay by default, fallback to Stripe if configured
    if (isRazorpay) {
      return await handleRazorpayCheckout(
        session.user.id,
        session.user.email,
        session.user.name,
        plan as SubscriptionPlan,
        billingPeriod as BillingPeriod,
        request
      );
    } else {
      return await handleStripeCheckout(
        session.user.id,
        session.user.email,
        session.user.name,
        plan as SubscriptionPlan,
        billingPeriod as BillingPeriod,
        request
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    console.error('[Checkout API] Error:', errorMessage);
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.INTERNAL_ERROR),
        code: ERROR_CODES.INTERNAL_ERROR,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Razorpay checkout handler
 */
async function handleRazorpayCheckout(
  userId: string,
  email: string | null | undefined,
  name: string | null | undefined,
  plan: SubscriptionPlan,
  billingPeriod: BillingPeriod,
  request: NextRequest
) {
  if (!razorpay) {
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED),
        code: ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED,
      },
      { status: 500 }
    );
  }

  // Type guard: ensure plan is 'pro' or 'premium' (not 'free')
  if (plan !== 'pro' && plan !== 'premium') {
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.INVALID_PLAN),
        code: ERROR_CODES.INVALID_PLAN,
        details: 'Only pro and premium plans are available',
      },
      { status: 400 }
    );
  }

  // Now TypeScript knows plan is 'pro' | 'premium'
  const planConfig = RAZORPAY_PLANS[plan][billingPeriod];
  
  if (!planConfig.planId) {
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.PLAN_NOT_CONFIGURED),
        code: ERROR_CODES.PLAN_NOT_CONFIGURED,
        details: `Plan ID not configured for ${plan} ${billingPeriod}`,
      },
      { status: 500 }
    );
  }

  try {
    // Get or create subscription
    const existingSubscription = await subscriptionService.getSubscriptionByUserId(userId);
    
    let customerId: string;
    
    if (existingSubscription?.razorpayCustomerId) {
      customerId = existingSubscription.razorpayCustomerId;
    } else {
      // Create Razorpay customer
      const customer = await subscriptionService.createRazorpayCustomer(userId, email, name);
      customerId = customer.id;

      // Create subscription record
      await subscriptionService.upsertSubscription({
        userId,
        plan,
        billingPeriod,
        paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
        razorpayCustomerId: customerId,
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      });
    }

    // Create Razorpay subscription
    const razorpaySubscription = await subscriptionService.createRazorpaySubscription(
      customerId,
      planConfig.planId,
      userId,
      plan,
      billingPeriod
    );

    // Update subscription record with Razorpay subscription ID
    await subscriptionService.upsertSubscription({
      userId,
      plan,
      billingPeriod,
      paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
      razorpayCustomerId: customerId,
      razorpaySubscriptionId: razorpaySubscription.id,
      razorpayPlanId: planConfig.planId,
      status: 'trialing',
      trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
    });

    // Return checkout details (Razorpay handles payment via frontend)
    return NextResponse.json({
      subscriptionId: razorpaySubscription.id,
      amount: planConfig.amount,
      currency: 'INR',
      customerId: customerId,
      planId: planConfig.planId,
      redirectUrl: `${request.nextUrl.origin}/subscription/razorpay-checkout?subscription_id=${razorpaySubscription.id}`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Checkout API] Razorpay checkout error:', errorMessage);
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_ERROR),
        code: ERROR_CODES.PAYMENT_GATEWAY_ERROR,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Stripe checkout handler (kept for future switching)
 */
async function handleStripeCheckout(
  userId: string,
  email: string | null | undefined,
  name: string | null | undefined,
  plan: SubscriptionPlan,
  billingPeriod: BillingPeriod,
  request: NextRequest
) {
  if (!stripe) {
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED),
        code: ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED,
      },
      { status: 500 }
    );
  }

  // Type guard: ensure plan is 'pro' or 'premium' (not 'free')
  if (plan !== 'pro' && plan !== 'premium') {
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.INVALID_PLAN),
        code: ERROR_CODES.INVALID_PLAN,
        details: 'Only pro and premium plans are available',
      },
      { status: 400 }
    );
  }

  // Now TypeScript knows plan is 'pro' | 'premium'
  const priceConfig = SUBSCRIPTION_PLANS[plan][billingPeriod];
  
  if (!priceConfig.priceId) {
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.PLAN_NOT_CONFIGURED),
        code: ERROR_CODES.PLAN_NOT_CONFIGURED,
      },
      { status: 500 }
    );
  }

  try {
    // Get or create Stripe customer
    const existingSubscription = await subscriptionService.getSubscriptionByUserId(userId);
    
    let customerId: string;
    
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

      await subscriptionService.upsertSubscription({
        userId,
        plan,
        billingPeriod,
        paymentGateway: PAYMENT_GATEWAYS.STRIPE,
        stripeCustomerId: customerId,
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Checkout API] Stripe checkout error:', errorMessage);
    return NextResponse.json(
      { 
        error: getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_ERROR),
        code: ERROR_CODES.PAYMENT_GATEWAY_ERROR,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
