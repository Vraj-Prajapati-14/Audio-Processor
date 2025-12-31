import { NextRequest, NextResponse } from 'next/server';
import { generatePasswordResetToken } from '@/lib/password-reset';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    try {
      console.log('🔄 Starting password reset process for:', email);
      const result = await generatePasswordResetToken(email.trim().toLowerCase());
      console.log('✅ Password reset token generated successfully for:', email);
      console.log('✅ Result:', result);
      // Always return success to prevent email enumeration
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });
      // Still return success to prevent information leakage
      // But log the actual error for debugging
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

