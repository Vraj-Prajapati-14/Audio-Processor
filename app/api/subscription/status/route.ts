import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subscriptionService } from '@/lib/services/subscription-service';
import { ERROR_CODES, getErrorMessage } from '@/lib/constants/error-codes';

export async function GET() {
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

    const subscription = await subscriptionService.getSubscriptionStatus(session.user.id);
    return NextResponse.json(subscription);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Subscription Status API] Error:', errorMessage);
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

