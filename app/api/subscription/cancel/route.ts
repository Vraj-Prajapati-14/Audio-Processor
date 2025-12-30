import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isRazorpay } from '@/lib/payment-gateway-config';

// Razorpay imports
import { razorpay } from '@/lib/razorpay';

// Stripe imports (kept for future switching)
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Determine which gateway was used
    const paymentGateway = subscription.paymentGateway || (isRazorpay ? 'razorpay' : 'stripe');

    if (paymentGateway === 'razorpay') {
      return await handleRazorpayCancel(subscription);
    } else {
      return await handleStripeCancel(subscription);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
    console.error('Cancel subscription error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Razorpay cancel handler
async function handleRazorpayCancel(subscription: any) {
  if (!razorpay) {
    return NextResponse.json(
      { error: 'Razorpay is not configured' },
      { status: 500 }
    );
  }

  if (!subscription.razorpaySubscriptionId) {
    return NextResponse.json(
      { error: 'No active Razorpay subscription found' },
      { status: 404 }
    );
  }

  try {
    // Cancel Razorpay subscription immediately
    await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
      },
    });

    return NextResponse.json({ message: 'Subscription canceled successfully' });
  } catch (error: any) {
    console.error('Razorpay cancel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel Razorpay subscription' },
      { status: 500 }
    );
  }
}

// Stripe cancel handler (kept for future switching)
async function handleStripeCancel(subscription: any) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  if (!subscription.stripeSubscriptionId) {
    return NextResponse.json(
      { error: 'No active Stripe subscription found' },
      { status: 404 }
    );
  }

  // Cancel subscription at period end
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  return NextResponse.json({ message: 'Subscription will be canceled at period end' });
}
