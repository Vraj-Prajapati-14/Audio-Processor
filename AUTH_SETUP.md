# Authentication Setup Guide

This guide will help you set up the complete authentication system including password reset functionality.

## Features

✅ **Sign Up** - User registration with email/password  
✅ **Sign In** - Email/password authentication  
✅ **Google OAuth** - Sign in with Google (optional)  
✅ **Forgot Password** - Request password reset via email  
✅ **Reset Password** - Reset password with secure token (5-minute expiry)  
✅ **Session Management** - Secure JWT-based sessions  

## Environment Variables

Add these to your `.env.local` file in the `audio-processor` directory:

### Required

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/AudioProcessor?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Stripe (for subscriptions)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Optional - Email Configuration (Required for Password Reset)

For password reset emails to work, you need to configure SMTP:

#### Gmail Setup

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

**Important:** For Gmail, you need to:
1. Enable 2-Step Verification on your Google Account
2. Generate an "App Password" (not your regular password)
3. Use the app password in `SMTP_PASSWORD`

#### Other SMTP Providers

```env
# For SendGrid
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"

# For Mailgun
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-mailgun-username"
SMTP_PASSWORD="your-mailgun-password"
SMTP_FROM="noreply@yourdomain.com"
```

### Optional - Google OAuth

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Development Mode (No Email Setup)

If you don't configure SMTP in development, password reset links will be logged to the console instead of being sent via email. Check your server logs for the reset link.

## Password Reset Flow

1. User clicks "Forgot password?" on the sign-in page
2. User enters their email address
3. System generates a secure token (valid for 5 minutes)
4. Email is sent with reset link
5. User clicks link and is taken to reset password page
6. User enters new password
7. Password is updated and token is invalidated
8. User can sign in with new password

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt (10 rounds)
- **Token Expiry**: Reset tokens expire after 5 minutes
- **Single Use Tokens**: Tokens are deleted after use (cannot be reused)
- **Email Enumeration Prevention**: System doesn't reveal if email exists
- **Secure Token Generation**: Uses crypto.randomBytes for token generation
- **HTTPS Required**: In production, ensure NEXTAUTH_URL uses https

## Edge Cases Handled

✅ Expired tokens are automatically cleaned up  
✅ Invalid tokens show appropriate error messages  
✅ Tokens can only be used once  
✅ Email validation on both client and server  
✅ Password strength requirements (minimum 6 characters)  
✅ Password confirmation matching  
✅ Proper error messages for all failure scenarios  

## Testing the Flow

1. **Sign Up**: Create a new account at `/auth/signup`
2. **Sign In**: Test authentication at `/auth/signin`
3. **Forgot Password**: Request reset at `/auth/forgot-password`
4. **Check Email/Console**: Get the reset link (email or console in dev mode)
5. **Reset Password**: Use the link to reset password
6. **Sign In Again**: Verify new password works

## Troubleshooting

### "Email service not configured" error
- Make sure SMTP environment variables are set in `.env.local`
- Restart your dev server after adding environment variables
- For development, check console logs for reset links

### "Invalid or expired reset token"
- Tokens expire after 5 minutes
- Tokens can only be used once
- Request a new password reset if token expired

### Emails not being sent
- Verify SMTP credentials are correct
- Check firewall/network settings
- For Gmail, ensure you're using an App Password, not regular password
- Check server logs for detailed error messages

### Database connection errors
- Ensure PostgreSQL is running
- Verify DATABASE_URL is correct (escape special characters in password)
- Run `npx prisma migrate dev` to ensure schema is up to date

