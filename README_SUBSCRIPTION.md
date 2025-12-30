# Subscription System Setup Guide

This guide will help you set up the subscription system for AudioFX Pro.

## Prerequisites

1. **PostgreSQL Database** - You'll need a PostgreSQL database. You can use:
   - Local PostgreSQL installation
   - Supabase (free tier available)
   - Railway, Render, or any PostgreSQL provider

2. **Stripe Account** - Sign up at https://stripe.com

3. **Google OAuth (Optional)** - For Google sign-in

## Step-by-Step Setup

### 1. Database Setup

1. Create a PostgreSQL database
2. Copy `.env.example` to `.env.local`
3. Update `DATABASE_URL` in `.env.local` with your database connection string

```env
DATABASE_URL="postgresql://user:password@localhost:5432/audiofx_pro?schema=public"
```

4. Run Prisma migrations:
```bash
cd audio-processor
npm install
npx prisma migrate dev --name init
```

This will create all the necessary database tables.

### 2. NextAuth Setup

1. Generate a secret for NextAuth:
```bash
openssl rand -base64 32
```

2. Add to `.env.local`:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
```

3. For Google OAuth (optional):
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Add credentials to `.env.local`

### 3. Stripe Setup

1. **Get API Keys:**
   - Go to Stripe Dashboard > Developers > API keys
   - Copy your test Secret Key
   - Add to `.env.local`: `STRIPE_SECRET_KEY="sk_test_..."`

2. **Create Products and Prices:**
   
   Go to Stripe Dashboard > Products and create:

   **Pro Plan:**
   - Name: "Pro Plan"
   - Create 3 prices:
     - Monthly: $199/month (recurring, monthly)
     - Quarterly: $537.30/3 months (recurring, every 3 months) 
     - Yearly: $1914/year (recurring, yearly)
   - Copy the Price IDs (starts with `price_...`)

   **Premium Plan:**
   - Name: "Premium Plan"
   - Create 3 prices:
     - Monthly: $499/month (recurring, monthly)
     - Quarterly: $1347.30/3 months (recurring, every 3 months)
     - Yearly: $4790.40/year (recurring, yearly)
   - Copy the Price IDs

3. **Add Price IDs to `.env.local`:**
```env
STRIPE_PRO_MONTHLY_PRICE_ID="price_xxxxx"
STRIPE_PRO_QUARTERLY_PRICE_ID="price_xxxxx"
STRIPE_PRO_YEARLY_PRICE_ID="price_xxxxx"
STRIPE_PREMIUM_MONTHLY_PRICE_ID="price_xxxxx"
STRIPE_PREMIUM_QUARTERLY_PRICE_ID="price_xxxxx"
STRIPE_PREMIUM_YEARLY_PRICE_ID="price_xxxxx"
```

4. **Set up Webhook:**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/subscription/webhook`
   - For local testing: Use Stripe CLI (see below)
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the Webhook Signing Secret to `.env.local`: `STRIPE_WEBHOOK_SECRET="whsec_..."`

5. **Local Webhook Testing (Optional):**
   Install Stripe CLI:
   ```bash
   # Windows
   # Download from: https://stripe.com/docs/stripe-cli

   # macOS
   brew install stripe/stripe-cli/stripe

   # Login
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/subscription/webhook
   ```
   Use the webhook secret from the CLI output.

### 4. Install Dependencies

```bash
cd audio-processor
npm install
```

### 5. Run the Application

```bash
npm run dev
```

## Features

### Subscription Tiers

- **Free:** No downloads allowed (requires sign-in)
- **Pro:** 20 songs per month - $199/month (or $179/quarter, $159/year)
- **Premium:** Unlimited songs - $499/month (or $449/quarter, $399/year)

### Trial Period

- All paid plans include a 7-day free trial
- Users can cancel anytime during trial
- No charges until trial ends

### Usage Tracking

- Songs are counted on download
- Monthly reset based on subscription period
- Premium users have unlimited downloads

## Testing

1. **Test Sign Up/In:**
   - Go to `/auth/signup` or `/auth/signin`
   - Create an account or sign in

2. **Test Subscription:**
   - Sign in to your account
   - Go to `/pricing`
   - Click "Start Trial" on any plan
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date and any CVC

3. **Test Usage Limits:**
   - Process and download audio files
   - Check usage at `/subscription`
   - Pro plan should limit to 20 downloads per month

## Production Deployment

1. Update `NEXTAUTH_URL` to your production domain
2. Use production Stripe keys
3. Update webhook URL in Stripe dashboard
4. Set up environment variables in your hosting platform (Vercel, Railway, etc.)
5. Run migrations: `npx prisma migrate deploy`

## Security Notes

- Never commit `.env.local` to version control
- Use strong `NEXTAUTH_SECRET` in production
- Enable HTTPS in production
- Regularly update dependencies
- Monitor Stripe webhook logs for issues

## Support

For issues or questions, check:
- Stripe Documentation: https://stripe.com/docs
- NextAuth Documentation: https://next-auth.js.org
- Prisma Documentation: https://www.prisma.io/docs

