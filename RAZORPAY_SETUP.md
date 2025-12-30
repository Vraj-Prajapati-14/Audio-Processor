# Razorpay Payment Gateway Setup Guide

This application uses **Razorpay** as the default payment gateway, with Stripe code kept intact for future switching.

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Payment Gateway Selection (default: razorpay)
PAYMENT_GATEWAY=razorpay

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Razorpay Plan IDs (create these in Razorpay Dashboard)
RAZORPAY_PRO_MONTHLY_PLAN_ID=plan_xxxxxxxxxxxxx
RAZORPAY_PRO_QUARTERLY_PLAN_ID=plan_xxxxxxxxxxxxx
RAZORPAY_PRO_YEARLY_PLAN_ID=plan_xxxxxxxxxxxxx
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=plan_xxxxxxxxxxxxx
RAZORPAY_PREMIUM_QUARTERLY_PLAN_ID=plan_xxxxxxxxxxxxx
RAZORPAY_PREMIUM_YEARLY_PLAN_ID=plan_xxxxxxxxxxxxx

# Stripe Configuration (optional - kept for future switching)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# ... (other Stripe env vars)
```

## Razorpay Setup Steps

### 1. Create Razorpay Account
1. Sign up at https://razorpay.com
2. Complete KYC verification
3. Activate test/live mode

### 2. Get API Keys
1. Go to **Settings** → **API Keys**
2. Generate **Key ID** and **Key Secret**
3. Add them to `.env.local`

### 3. Create Subscription Plans

In Razorpay Dashboard → **Products** → **Subscriptions** → **Plans**:

#### Pro Plan
- **Monthly**: ₹199.00/month
- **Quarterly**: ₹537.30 (₹179.10/month × 3, 10% discount)
- **Yearly**: ₹1,914.00 (₹159.50/month × 12, 20% discount)

#### Premium Plan
- **Monthly**: ₹499.00/month
- **Quarterly**: ₹1,347.30 (₹449.10/month × 3, 10% discount)
- **Yearly**: ₹4,790.40 (₹399.20/month × 12, 20% discount)

After creating each plan, copy the **Plan ID** (starts with `plan_`) and add to `.env.local`.

### 4. Configure Webhook

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/subscription/webhook`
3. Select events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.updated`
   - `subscription.cancelled`
   - `subscription.paused`
   - `subscription.resumed`
   - `payment.failed`
4. Copy the **Webhook Secret** and add to `.env.local`

### 5. Database Migration

Run the migration to add Razorpay fields:

```bash
npx prisma migrate dev --name add_razorpay_fields
```

## Switching Between Gateways

To switch between Razorpay and Stripe, simply change:

```env
PAYMENT_GATEWAY=razorpay  # or 'stripe'
```

The system will automatically use the configured gateway.

## Architecture

- **Payment Gateway Config**: `lib/payment-gateway-config.ts` - Determines which gateway to use
- **Razorpay Utils**: `lib/razorpay.ts` - Razorpay initialization and plans
- **Stripe Utils**: `lib/stripe.ts` - Stripe initialization (kept for future use)
- **Checkout**: `app/api/subscription/checkout/route.ts` - Supports both gateways
- **Webhook**: `app/api/subscription/webhook/route.ts` - Handles both gateway webhooks
- **Cancel**: `app/api/subscription/cancel/route.ts` - Supports both gateways

## Frontend Integration

You'll need to create a Razorpay checkout page that:
1. Receives subscription details from the checkout API
2. Opens Razorpay payment modal
3. Handles payment success/failure
4. Redirects to success page

Example Razorpay checkout integration:

```typescript
// Install: npm install razorpay
import Razorpay from 'razorpay';

const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  subscription_id: subscriptionId,
  name: 'AudioFX Pro',
  description: 'Subscription Payment',
  handler: function (response: any) {
    // Handle successful payment
    router.push('/subscription/success');
  },
  prefill: {
    email: userEmail,
    name: userName,
  },
  theme: {
    color: '#667eea',
  },
};

const razorpayInstance = new Razorpay(options);
razorpayInstance.open();
```

## Testing

Use Razorpay test mode:
- Test cards: https://razorpay.com/docs/payments/test-cards/
- Test mode automatically enabled with test API keys

## Troubleshooting

- **Webhook not received**: Check webhook URL is publicly accessible (use ngrok for local testing)
- **Subscription not activating**: Verify webhook events are configured correctly
- **Payment failed**: Check Razorpay dashboard for error details

