# Payment Gateway Management

This application supports **Razorpay** (default) and **Stripe** payment gateways, with easy switching between them.

## Quick Setup

### 1. Install Dependencies (Already Done ✅)
```bash
npm install razorpay
```

### 2. Run Database Migration

You need to add Razorpay fields to the database. Stop your dev server first, then run:

```bash
npx prisma migrate dev --name add_razorpay_fields
```

Or if you prefer to create and review the migration first:

```bash
npx prisma migrate dev --create-only --name add_razorpay_fields
# Review the migration file, then:
npx prisma migrate dev
```

After migration, generate Prisma client:
```bash
npx prisma generate
```

### 3. Configure Environment Variables

Add to `.env.local`:

```env
# Payment Gateway Selection
PAYMENT_GATEWAY=razorpay  # or 'stripe' to switch

# Razorpay (Required for default setup)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Razorpay Plan IDs (create in Razorpay dashboard)
RAZORPAY_PRO_MONTHLY_PLAN_ID=plan_xxxxx
RAZORPAY_PRO_QUARTERLY_PLAN_ID=plan_xxxxx
RAZORPAY_PRO_YEARLY_PLAN_ID=plan_xxxxx
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=plan_xxxxx
RAZORPAY_PREMIUM_QUARTERLY_PLAN_ID=plan_xxxxx
RAZORPAY_PREMIUM_YEARLY_PLAN_ID=plan_xxxxx

# Stripe (Optional - kept for future use)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

## Switching Gateways

Simply change the `PAYMENT_GATEWAY` environment variable:

- `PAYMENT_GATEWAY=razorpay` - Use Razorpay (default)
- `PAYMENT_GATEWAY=stripe` - Use Stripe

The system automatically uses the configured gateway for:
- Checkout sessions
- Webhook processing
- Subscription cancellation
- Payment processing

## Architecture

### Files Structure

```
lib/
  ├── payment-gateway-config.ts  # Gateway selection logic
  ├── razorpay.ts                # Razorpay initialization & plans
  └── stripe.ts                  # Stripe initialization (kept intact)

app/api/subscription/
  ├── checkout/route.ts          # Supports both gateways
  ├── webhook/route.ts           # Handles both webhooks
  └── cancel/route.ts            # Supports both gateways
```

### How It Works

1. **Configuration**: `payment-gateway-config.ts` reads `PAYMENT_GATEWAY` env var
2. **Routing**: API routes check `isRazorpay` or `isStripe` flags
3. **Dual Support**: Each route has separate handlers for both gateways
4. **Database**: Schema stores IDs for both gateways (with `paymentGateway` field to track which is active)

## Database Schema

The `Subscription` model now includes:

```prisma
model Subscription {
  // ... existing fields ...
  
  // Stripe fields (kept for future switching)
  stripeCustomerId      String?
  stripeSubscriptionId  String?
  stripePriceId         String?
  stripeCurrentPeriodEnd DateTime?
  
  // Razorpay fields
  razorpayCustomerId    String?
  razorpaySubscriptionId String?
  razorpayPlanId        String?
  razorpayCurrentPeriodEnd DateTime?
  
  // Track which gateway is used
  paymentGateway        String @default("razorpay")
  
  // ... rest of fields ...
}
```

## Next Steps

1. **Create Razorpay Plans**: Follow `RAZORPAY_SETUP.md` to create plans in Razorpay dashboard
2. **Frontend Integration**: Create Razorpay checkout component (see `RAZORPAY_SETUP.md`)
3. **Test**: Use Razorpay test mode to verify payments
4. **Webhook**: Configure webhook URL in Razorpay dashboard

## Notes

- All Stripe code is preserved and functional
- Switching gateways only requires changing one environment variable
- Both gateways can coexist in the database (one active per subscription)
- The system gracefully handles missing gateway configuration

