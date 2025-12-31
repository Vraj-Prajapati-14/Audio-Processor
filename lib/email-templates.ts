/**
 * Email Templates System
 * 
 * This file contains all email templates used in the application.
 * Templates are designed to be professional, clean, and consistent.
 * 
 * To add a new email template:
 * 1. Add a new template function below
 * 2. Export it from this file
 * 3. Import and use it in lib/email.ts
 * 4. Call it from the appropriate API route or function
 */

interface EmailTemplateOptions {
  [key: string]: string | number | undefined;
}

/**
 * Base email wrapper - consistent styling for all emails
 */
function getEmailWrapper(contents: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 0; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                ${contents}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Email header with logo/branding
 */
function getEmailHeader() {
  return `
    <tr>
      <td style="background-color: #ffffff; padding: 40px 40px 32px 40px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <h1 style="color: #1a1a1a; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            AudioFX Pro
          </h1>
        </div>
        <div style="height: 3px; width: 80px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); margin: 0 auto;"></div>
      </td>
    </tr>
  `;
}

/**
 * Email footer with company info and unsubscribe
 */
function getEmailFooter() {
  return `
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafbfc;">
          <tr>
            <td style="padding: 40px 40px 24px 40px; border-top: 1px solid #e8eaed;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                          <p style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; line-height: 1.5;">
                            Contact Us
                          </p>
                          <p style="margin: 0 0 8px 0; color: #5f6368; font-size: 13px; line-height: 1.6;">
                            If you have any questions, please contact our support team
                          </p>
                          <p style="margin: 0; color: #5f6368; font-size: 13px; line-height: 1.6;">
                            support@audiofxpro.com
                          </p>
                        </td>
                        <td style="width: 50%; vertical-align: top; padding-left: 20px;">
                          <p style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 14px; font-weight: 600; line-height: 1.5;">
                            Follow Us
                          </p>
                          <table role="presentation" style="border-collapse: collapse;">
                            <tr>
                              <td style="padding-right: 12px;">
                                <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #1a1a1a; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none;">
                                  <span style="color: #ffffff; font-size: 14px; font-weight: 600;">f</span>
                                </a>
                              </td>
                              <td style="padding-right: 12px;">
                                <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #1a1a1a; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none;">
                                  <span style="color: #ffffff; font-size: 14px; font-weight: 600;">X</span>
                                </a>
                              </td>
                              <td style="padding-right: 12px;">
                                <a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #1a1a1a; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none;">
                                  <span style="color: #ffffff; font-size: 14px; font-weight: 600;">in</span>
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #e8eaed; padding-top: 24px; text-align: center;">
                    <p style="margin: 0 0 12px 0; color: #5f6368; font-size: 12px; line-height: 1.6;">
                      © ${new Date().getFullYear()} AudioFX Pro. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #9aa0a6; font-size: 11px; line-height: 1.5;">
                      If you prefer not to receive emails like this, you may <a href="#" style="color: #667eea; text-decoration: underline;">unsubscribe here</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Welcome Email Template
 * Sent when a new user signs up
 */
export function getWelcomeEmailTemplate(options: { name?: string | null; email: string }) {
  const userName = options.name || 'there';
  
  const content = `
    ${getEmailHeader()}
    <tr>
      <td style="padding: 0 40px 40px 40px;">
        <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 28px; font-weight: 600; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          Welcome to AudioFX Pro
        </h2>
        
        <p style="color: #5f6368; margin: 0 0 24px 0; font-size: 16px; line-height: 1.7;">
          Hello ${userName},
        </p>
        
        <p style="color: #3c4043; margin: 0 0 24px 0; font-size: 16px; line-height: 1.7;">
          Thank you for joining AudioFX Pro. We are delighted to have you as part of our community of audio professionals and creators.
        </p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px 24px; margin: 32px 0; border-radius: 4px;">
          <p style="color: #3c4043; margin: 0; font-size: 15px; line-height: 1.6;">
            <strong style="color: #1a1a1a; font-weight: 600;">Account Email:</strong><br>
            <span style="color: #667eea; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all;">${options.email}</span>
          </p>
        </div>
        
        <table role="presentation" style="width: 100%; margin: 36px 0;">
          <tr>
            <td align="center">
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="background-color: #667eea; border-radius: 4px;">
                    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" 
                       style="display: inline-block; padding: 14px 36px; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 15px; border-radius: 4px; letter-spacing: 0.2px;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #f8f9fa; padding: 28px 24px; margin: 36px 0; border-radius: 4px;">
          <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
            Getting Started
          </h3>
          <ul style="color: #3c4043; margin: 0; padding-left: 24px; font-size: 15px; line-height: 1.8;">
            <li style="margin-bottom: 10px;">Upload your audio files and begin processing immediately</li>
            <li style="margin-bottom: 10px;">Explore our comprehensive suite of professional audio effects and tools</li>
            <li>Create exceptional audio content with our advanced features and capabilities</li>
          </ul>
        </div>
        
        <p style="color: #5f6368; margin: 36px 0 24px 0; font-size: 15px; line-height: 1.7;">
          If you have any questions or require assistance, our support team is ready to help you make the most of AudioFX Pro.
        </p>
        
        <p style="color: #3c4043; margin: 0; font-size: 16px; line-height: 1.7;">
          Best regards,<br>
          <strong style="color: #1a1a1a; font-weight: 600;">The AudioFX Pro Team</strong>
        </p>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
  
  const textVersion = `
Welcome to AudioFX Pro

Hello ${userName},

Thank you for joining AudioFX Pro! We're excited to have you on board.

Your account has been successfully created with the email address: ${options.email}

Get started: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}

What's Next?
- Upload your audio files and start processing
- Explore our professional audio effects and tools
- Create amazing audio content with our advanced features

If you have any questions or need assistance, don't hesitate to reach out to our support team.

Best regards,
The AudioFX Pro Team

© ${new Date().getFullYear()} AudioFX Pro. All rights reserved.
  `.trim();
  
  return {
    html: getEmailWrapper(content),
    text: textVersion,
    subject: 'Welcome to AudioFX Pro',
  };
}

/**
 * Password Reset Email Template
 * Sent when user requests password reset
 */
export function getPasswordResetEmailTemplate(options: { resetToken: string; email: string }) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${options.resetToken}`;
  
  const content = `
    ${getEmailHeader()}
    <tr>
      <td style="padding: 0 40px 40px 40px;">
        <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 28px; font-weight: 600; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          Reset Your Password
        </h2>
        
        <p style="color: #3c4043; margin: 0 0 20px 0; font-size: 16px; line-height: 1.7;">
          We received a request to reset the password for your AudioFX Pro account.
        </p>
        
        <p style="color: #5f6368; margin: 0 0 32px 0; font-size: 15px; line-height: 1.7;">
          Click the button below to proceed with resetting your password. This link will expire in <strong style="color: #1a1a1a; font-weight: 600;">5 minutes</strong> for security purposes.
        </p>
        
        <table role="presentation" style="width: 100%; margin: 36px 0;">
          <tr>
            <td align="center">
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="background-color: #667eea; border-radius: 4px;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 14px 36px; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 15px; border-radius: 4px; letter-spacing: 0.2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #fffbf0; border-left: 4px solid #fbbc04; padding: 18px 24px; margin: 36px 0; border-radius: 4px;">
          <p style="color: #ea8600; margin: 0; font-size: 14px; line-height: 1.7;">
            <strong style="color: #ea8600; font-weight: 600;">Security Notice:</strong> This password reset link expires in 5 minutes. If you did not request this password reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px 24px; margin: 32px 0; border-radius: 4px;">
          <p style="color: #5f6368; margin: 0 0 12px 0; font-size: 13px; line-height: 1.6;">
            If the button above does not work, copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; word-break: break-all; font-size: 12px; font-family: 'Courier New', monospace; background: #ffffff; padding: 12px; border-radius: 4px; margin: 0; border: 1px solid #e8eaed;">
            ${resetUrl}
          </p>
        </div>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
  
  const textVersion = `
Reset Your AudioFX Pro Password

You requested to reset your password for your AudioFX Pro account.

Click the link below to reset your password. This link will expire in 5 minutes:

${resetUrl}

Security Notice: This link expires in 5 minutes. If you didn't request this password reset, please ignore this email and your password will remain unchanged.

© ${new Date().getFullYear()} AudioFX Pro. All rights reserved.
  `.trim();
  
  return {
    html: getEmailWrapper(content),
    text: textVersion,
    subject: 'Reset Your AudioFX Pro Password',
  };
}

/**
 * Password Reset Success Email Template
 * Sent after password is successfully reset
 */
export function getPasswordResetSuccessEmailTemplate(options: { email: string }) {
  const content = `
    ${getEmailHeader()}
    <tr>
      <td style="padding: 0 40px 40px 40px;">
        <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 28px; font-weight: 600; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          Password Reset Successful
        </h2>
        
        <p style="color: #3c4043; margin: 0 0 24px 0; font-size: 16px; line-height: 1.7;">
          Your password has been successfully reset for your AudioFX Pro account.
        </p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px 24px; margin: 32px 0; border-radius: 4px;">
          <p style="color: #3c4043; margin: 0; font-size: 15px; line-height: 1.6;">
            <strong style="color: #1a1a1a; font-weight: 600;">Account:</strong><br>
            <span style="color: #667eea; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all;">${options.email}</span>
          </p>
        </div>
        
        <div style="background-color: #e8f5e9; border-left: 4px solid #34a853; padding: 18px 24px; margin: 32px 0; border-radius: 4px;">
          <p style="color: #137333; margin: 0; font-size: 15px; line-height: 1.7;">
            <strong style="color: #137333; font-weight: 600;">Success:</strong> You can now sign in to your account using your new password.
          </p>
        </div>
        
        <table role="presentation" style="width: 100%; margin: 36px 0;">
          <tr>
            <td align="center">
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="background-color: #667eea; border-radius: 4px;">
                    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin" 
                       style="display: inline-block; padding: 14px 36px; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 15px; border-radius: 4px; letter-spacing: 0.2px;">
                      Sign In to Your Account
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #fffbf0; border-left: 4px solid #fbbc04; padding: 18px 24px; margin: 32px 0; border-radius: 4px;">
          <p style="color: #ea8600; margin: 0; font-size: 14px; line-height: 1.7;">
            <strong style="color: #ea8600; font-weight: 600;">Security Notice:</strong> If you did not reset your password, please contact our support team immediately to secure your account.
          </p>
        </div>
        
        <p style="color: #3c4043; margin: 24px 0 0 0; font-size: 16px; line-height: 1.7;">
          Best regards,<br>
          <strong style="color: #1a1a1a; font-weight: 600;">The AudioFX Pro Team</strong>
        </p>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
  
  const textVersion = `
Password Reset Successful

Your password has been successfully reset for your AudioFX Pro account.

Account: ${options.email}

You can now sign in to your account using your new password.

Sign in: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin

Security Notice: If you did not reset your password, please contact our support team immediately to secure your account.

Best regards,
The AudioFX Pro Team

© ${new Date().getFullYear()} AudioFX Pro. All rights reserved.
  `.trim();
  
  return {
    html: getEmailWrapper(content),
    text: textVersion,
    subject: 'Password Reset Successful - AudioFX Pro',
  };
}

