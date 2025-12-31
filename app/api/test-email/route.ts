import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailTransport, sendPasswordResetEmail } from '@/lib/email';

/**
 * Test endpoint to check SMTP configuration and send a test email
 * Access at: /api/test-email?email=your@email.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testEmail = searchParams.get('email');

    // Check environment variables
    const envCheck = {
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
      SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com (default)',
      SMTP_PORT: process.env.SMTP_PORT || '587 (default)',
      SMTP_SECURE: process.env.SMTP_SECURE || 'false (default)',
      SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || 'Not set',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Verify transport connection
    let transportVerified = false;
    let transportError = null;
    try {
      transportVerified = await verifyEmailTransport();
    } catch (error: any) {
      transportError = error.message;
    }

    // Try sending test email if email parameter provided
    let testEmailResult = null;
    if (testEmail) {
      try {
        // Generate a test token
        const testToken = 'test-token-' + Date.now();
        const result = await sendPasswordResetEmail(testEmail, testToken);
        testEmailResult = {
          success: true,
          messageId: result.messageId,
          message: 'Test email sent successfully!',
        };
      } catch (error: any) {
        testEmailResult = {
          success: false,
          error: error.message,
          details: error,
        };
      }
    }

    return NextResponse.json({
      environment: envCheck,
      transportVerification: {
        verified: transportVerified,
        error: transportError,
      },
      testEmail: testEmailResult || {
        message: 'Add ?email=your@email.com to test email sending',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Test failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

