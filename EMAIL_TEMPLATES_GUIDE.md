# Email Templates System Guide

This guide explains the email template system and how to add new email templates.

## Architecture

The email system is modular and consists of:

1. **`lib/email-templates.ts`** - Contains all email templates
2. **`lib/email.ts`** - Handles email sending using nodemailer
3. **API Routes** - Call email functions when needed

## Current Email Templates

### 1. Welcome Email
- **Function**: `getWelcomeEmailTemplate()`
- **Sent**: When user signs up
- **Contains**: Welcome message, account confirmation, getting started guide
- **Style**: Professional, clean design

### 2. Password Reset Email
- **Function**: `getPasswordResetEmailTemplate()`
- **Sent**: When user requests password reset
- **Contains**: Reset link with 5-minute expiry
- **Style**: Professional security-focused design

### 3. Password Reset Success Email
- **Function**: `getPasswordResetSuccessEmailTemplate()`
- **Sent**: After password is successfully reset
- **Contains**: Confirmation message and security notice
- **Style**: Professional confirmation design

## How to Add a New Email Template

### Step 1: Create Template Function

Add a new function in `lib/email-templates.ts`:

```typescript
export function getYourNewEmailTemplate(options: { 
  email: string;
  // Add other options as needed
}) {
  const content = `
    ${getEmailHeader()}
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
          Your Email Title
        </h2>
        
        <p style="color: #333333; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
          Your email content here...
        </p>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
  
  const textVersion = `
Your Email Title

Your email content in plain text format...
  `.trim();
  
  return {
    html: getEmailWrapper(content),
    text: textVersion,
    subject: 'Your Email Subject',
  };
}
```

### Step 2: Add Email Sending Function

Add a function in `lib/email.ts`:

```typescript
export async function sendYourNewEmail(email: string, ...otherParams) {
  try {
    const template = getYourNewEmailTemplate({ email, ...otherParams });
    return await sendEmail(email, template.subject, template.html, template.text);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error; // or return { success: false } if non-critical
  }
}
```

### Step 3: Import and Use

Import and call from your API route or function:

```typescript
import { sendYourNewEmail } from '@/lib/email';

// In your route handler
await sendYourNewEmail(email, ...params);
```

## Template Structure

All templates use:

- **Header**: `getEmailHeader()` - Branded header with gradient
- **Footer**: `getEmailFooter()` - Company info and copyright
- **Wrapper**: `getEmailWrapper()` - Consistent styling and responsive layout

## Design Guidelines

When creating new templates:

1. **No Emojis**: Keep emails professional
2. **Consistent Colors**: Use brand gradient (#667eea to #764ba2)
3. **Clear Typography**: 16px body text, clear hierarchy
4. **Mobile Responsive**: Tables for email client compatibility
5. **Plain Text Version**: Always include text version for accessibility

## Email Sending Behavior

### Development Mode (No SMTP)
- Emails are logged to console
- Signup/reset still works
- Check server logs for email content

### Production Mode (SMTP Configured)
- Emails sent via configured SMTP
- Errors are logged
- Critical emails (password reset) throw errors
- Non-critical emails (welcome) don't block operations

## Current Email Flow

```
Sign Up → ✅ Welcome Email (non-blocking)
Sign In → ❌ No Email
Google OAuth → ❌ No Email
Forgot Password → ✅ Password Reset Email (critical)
Reset Password → ✅ Password Reset Success Email (non-blocking)
```

## Testing

1. **Development**: Check console logs for email content
2. **Production**: Use real SMTP credentials and check inbox
3. **Template Preview**: Use email preview tools or email testing services

## Example: Adding a Subscription Confirmation Email

```typescript
// In email-templates.ts
export function getSubscriptionConfirmationEmailTemplate(options: {
  email: string;
  planName: string;
  amount: number;
}) {
  const content = `
    ${getEmailHeader()}
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
          Subscription Confirmed
        </h2>
        
        <p style="color: #333333; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
          Your subscription to ${options.planName} has been confirmed.
        </p>
        <!-- More content -->
      </td>
    </tr>
    ${getEmailFooter()}
  `;
  
  return {
    html: getEmailWrapper(content),
    text: `Subscription Confirmed...`,
    subject: 'Subscription Confirmed - AudioFX Pro',
  };
}

// In email.ts
export async function sendSubscriptionConfirmationEmail(
  email: string,
  planName: string,
  amount: number
) {
  try {
    const template = getSubscriptionConfirmationEmailTemplate({ email, planName, amount });
    return await sendEmail(email, template.subject, template.html, template.text);
  } catch (error) {
    console.error('Failed to send subscription confirmation email:', error);
    return { success: false };
  }
}

// In subscription webhook or checkout route
import { sendSubscriptionConfirmationEmail } from '@/lib/email';
await sendSubscriptionConfirmationEmail(userEmail, planName, amount);
```

This modular approach makes it easy to add new email templates while maintaining consistency and professionalism.

