import nodemailer from 'nodemailer';

// Create reusable transporter
const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    // For development, create a test account transporter
    // In production, SMTP credentials are required
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  SMTP credentials not found. Using test account transporter.');
      console.warn('⚠️  Password reset emails will not be sent in development without SMTP configuration.');
    }
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const transporter = getTransporter();

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  if (!transporter) {
    // In development, log the reset link instead of sending email
    if (process.env.NODE_ENV === 'development') {
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
      console.log('\n📧 [DEV MODE] Password Reset Email would be sent to:', email);
      console.log('🔗 Reset Link:', resetUrl);
      console.log('⚠️  To actually send emails, configure SMTP settings in .env.local\n');
      return { success: true, messageId: 'dev-mode' };
    }
    throw new Error('Email service not configured. Please set SMTP_USER and SMTP_PASSWORD environment variables.');
  }

  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Reset Your AudioFX Pro Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AudioFX Pro</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p>You requested to reset your password for your AudioFX Pro account.</p>
            <p>Click the button below to reset your password. This link will expire in <strong>5 minutes</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #667eea; word-break: break-all; font-size: 12px; background: #f0f0f0; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will not be changed.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">
              This link expires in 5 minutes for security reasons.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Reset Your AudioFX Pro Password

      You requested to reset your password for your AudioFX Pro account.

      Click the link below to reset your password. This link will expire in 5 minutes:

      ${resetUrl}

      If you didn't request this password reset, please ignore this email. Your password will not be changed.

      This link expires in 5 minutes for security reasons.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}

export async function verifyEmailTransport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return false;
  }

  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email transport verification failed:', error);
    return false;
  }
}

