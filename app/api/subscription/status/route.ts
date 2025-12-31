import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subscriptionService } from '@/lib/services/subscription-service';
import { ERROR_CODES, getErrorMessage } from '@/lib/constants/error-codes';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('[Subscription Status API] No session or user ID');
      return NextResponse.json(
        { 
          error: getErrorMessage(ERROR_CODES.UNAUTHORIZED),
          code: ERROR_CODES.UNAUTHORIZED,
        },
        { status: 401 }
      );
    }

    try {
      const subscription = await subscriptionService.getSubscriptionStatus(session.user.id);
      return NextResponse.json(subscription);
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';
      console.error('[Subscription Status API] Service error:', errorMessage, serviceError);
      
      // Return a default "free" subscription status instead of error
      // This allows the frontend to show "No Subscription" gracefully
      return NextResponse.json({
        plan: 'free',
        status: 'inactive',
        isActive: false,
        isTrialing: false,
        trialEndsAt: null,
        currentPeriodEnd: null,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Subscription Status API] Unexpected error:', errorMessage, error);
    
    // Return a default "free" subscription status instead of error
    return NextResponse.json({
      plan: 'free',
      status: 'inactive',
      isActive: false,
      isTrialing: false,
      trialEndsAt: null,
      currentPeriodEnd: null,
    });
  }
}

