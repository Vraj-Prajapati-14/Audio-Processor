import nodemailer from 'nodemailer';
import {
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
  getPasswordResetSuccessEmailTemplate,
} from './email-templates';

/**
 * Email Service
 * 
 * This file handles email sending using nodemailer.
 * All email templates are defined in email-templates.ts
 */

// Create reusable transporter with lazy initialization
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  // Always recreate transporter to ensure env vars are fresh
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    // For development, create a test account transporter
    // In production, SMTP credentials are required
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  SMTP credentials not found. Email sending disabled.');
      console.warn('⚠️  SMTP_USER:', process.env.SMTP_USER ? '✓ Set' : '✗ Not set');
      console.warn('⚠️  SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✓ Set' : '✗ Not set');
      console.warn('⚠️  Emails will be logged to console in development mode.');
    }
    return null;
  }

  try {
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    console.log('📧 Creating SMTP transporter with config:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      passwordSet: !!config.auth.pass,
    });

    return nodemailer.createTransport(config);
  } catch (error) {
    console.error('❌ Failed to create SMTP transporter:', error);
    return null;
  }
};

/**
 * Generic email sending function
 */
async function sendEmail(to: string, subject: string, html: string, text: string) {
  console.log('📧 sendEmail function called');
  
  // Get fresh transporter each time
  transporter = getTransporter();
  
  console.log('📧 Transporter status:', {
    isNull: transporter === null,
    transporterType: transporter ? 'created' : 'null',
  });
  
  if (!transporter) {
    // In development, log the email instead of sending
    console.warn('⚠️  Transporter is null - checking environment...');
    console.warn('⚠️  SMTP_USER:', process.env.SMTP_USER ? `Set (${process.env.SMTP_USER.substring(0, 3)}...)` : 'NOT SET');
    console.warn('⚠️  SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? 'Set (hidden)' : 'NOT SET');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 [DEV MODE - NO SMTP] Email would be sent:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      
      // Extract reset URL from text version
      const resetUrlMatch = text.match(/https?:\/\/[^\s]+/);
      if (resetUrlMatch) {
        console.log(`\n🔗 Reset Link: ${resetUrlMatch[0]}`);
      }
      
      console.log(`\nText Version:\n${text}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  To actually send emails, configure SMTP settings in .env.local');
      console.log('⚠️  Required: SMTP_USER, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return { success: true, messageId: 'dev-mode' };
    }
    throw new Error('Email service not configured. Please set SMTP_USER and SMTP_PASSWORD environment variables.');
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  };

  try {
    console.log('📧 Attempting to send email...', { to, subject, from: mailOptions.from });
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!', { messageId: info.messageId, response: info.response });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message,
    });
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('SMTP authentication failed. Please check your SMTP_USER and SMTP_PASSWORD. For Gmail, you may need to use an App Password instead of your regular password.');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      throw new Error(`Could not connect to SMTP server. Please check SMTP_HOST and SMTP_PORT. Error: ${error.message}`);
    } else if (error.response) {
      throw new Error(`SMTP server error: ${error.response} (Code: ${error.responseCode})`);
    }
    
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name?: string | null) {
  try {
    const template = getWelcomeEmailTemplate({ email, name });
    return await sendEmail(email, template.subject, template.html, template.text);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - welcome email failure shouldn't block signup
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  console.log('📧 sendPasswordResetEmail called:', { email, hasToken: !!resetToken });
  console.log('📧 Environment check:', {
    hasSMTP_USER: !!process.env.SMTP_USER,
    hasSMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    NODE_ENV: process.env.NODE_ENV,
  });
  
  try {
    const template = getPasswordResetEmailTemplate({ email, resetToken });
    console.log('📧 Template generated, attempting to send email...');
    const result = await sendEmail(email, template.subject, template.html, template.text);
    console.log('📧 Email sending result:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Failed to send password reset email:', error);
    console.error('❌ Error stack:', error?.stack);
    throw error; // This should fail - password reset requires email
  }
}

/**
 * Send password reset success confirmation email
 */
export async function sendPasswordResetSuccessEmail(email: string) {
  try {
    const template = getPasswordResetSuccessEmailTemplate({ email });
    return await sendEmail(email, template.subject, template.html, template.text);
  } catch (error) {
    console.error('Failed to send password reset success email:', error);
    // Don't throw - success email failure shouldn't block password reset
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Verify email transport connection
 */
export async function verifyEmailTransport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return false;
  }

  if (!transporter) {
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
