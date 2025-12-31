/**
 * Cancel Subscription API Route
 * Handles subscription cancellation with proper error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subscriptionService } from '@/lib/services/subscription-service';
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

    const { cancelAtPeriodEnd } = await request.json().catch(() => ({}));

    const result = await subscriptionService.cancelSubscription(
      session.user.id,
      cancelAtPeriodEnd === true
    );

    return NextResponse.json({ 
      success: true,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be canceled at the end of the current period'
        : 'Subscription canceled successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
    console.error('[Cancel Subscription API] Error:', errorMessage);
    
    // Check if it's a known error code
    const errorCode = error instanceof Error && error.message.includes('SUBSCRIPTION')
      ? ERROR_CODES.SUBSCRIPTION_NOT_FOUND
      : ERROR_CODES.INTERNAL_ERROR;

    return NextResponse.json(
      { 
        error: getErrorMessage(errorCode),
        code: errorCode,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
