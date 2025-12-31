# Subscription System Implementation Guide

## Overview

This document describes the production-ready subscription system implementation with Razorpay integration, comprehensive logging, and error tracking.

## Database Schema

### New Tables

1. **Charge Table**
   - Tracks all payments/charges
   - Stores Razorpay and Stripe payment IDs
   - Records payment status, amount, currency, and failure details
   - Linked to subscriptions for tracking payment history

2. **Webhook Table**
   - Stores all incoming webhook events
   - Tracks processing status and retry count
   - Links to subscriptions when applicable
   - Stores full payload and signature for audit

3. **WebhookLog Table**
   - Detailed logs for each webhook processing attempt
   - Supports multiple log levels (info, warning, error, debug)
   - Stores error stack traces and contextual data

### Enhanced Subscription Table

- Added `billingPeriod` field (monthly, quarterly, yearly)
- Added `canceledAt` and `cancelAtPeriodEnd` fields
- Added `expired` status
- Enhanced indexes for better query performance

## Architecture

### Constants (`lib/constants/`)

- **subscription-status.ts**: Subscription statuses, plans, billing periods
- **webhook-events.ts**: All Razorpay and Stripe webhook events
- **charge-status.ts**: Payment/charge status constants
- **error-codes.ts**: Standardized error codes and messages

### Services (`lib/services/`)

- **subscription-service.ts**: Core subscription management
  - Create/update subscriptions
  - Cancel subscriptions
  - Get subscription status
  - Create Razorpay customers and subscriptions

- **charge-service.ts**: Payment tracking
  - Create charge records
  - Update charge status
  - Track payments by subscription/user
  - Process Razorpay payments

- **webhook-service.ts**: Webhook processing
  - Create webhook records
  - Log webhook events
  - Process all Razorpay webhook events
  - Handle subscription lifecycle events
  - Handle payment events

### API Routes (`app/api/subscription/`)

- **checkout/route.ts**: Create subscription checkout
  - Validates plan and billing period
  - Creates Razorpay customer if needed
  - Creates Razorpay subscription
  - Returns checkout details

- **webhook/route.ts**: Handle webhook events
  - Verifies webhook signatures
  - Processes all Razorpay events
  - Comprehensive logging
  - Error handling

- **cancel/route.ts**: Cancel subscriptions
  - Supports immediate or end-of-period cancellation
  - Updates subscription status
  - Handles Razorpay cancellation

- **status/route.ts**: Get subscription status
  - Returns current subscription details
  - Includes trial and period end information

## Webhook Events Handled

### Subscription Events
- `subscription.activated` - Subscription activated
- `subscription.charged` - Subscription charged
- `subscription.updated` - Subscription updated
- `subscription.cancelled` - Subscription cancelled
- `subscription.paused` - Subscription paused
- `subscription.resumed` - Subscription resumed
- `subscription.completed` - Subscription completed
- `subscription.expired` - Subscription expired

### Payment Events
- `payment.authorized` - Payment authorized
- `payment.captured` - Payment captured
- `payment.failed` - Payment failed
- `payment.refunded` - Payment refunded
- `payment.partially_refunded` - Payment partially refunded

## Database Migration

Run the following command to apply the database schema changes:

```bash
cd audio-processor
npx prisma migrate dev --name add_subscription_tracking_tables
```

Or for production:

```bash
npx prisma migrate deploy
```

## Environment Variables

Ensure these are set in your `.env.local`:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Plan IDs (create these in Razorpay Dashboard)
RAZORPAY_PRO_MONTHLY_PLAN_ID=plan_xxxxx
RAZORPAY_PRO_QUARTERLY_PLAN_ID=plan_xxxxx
RAZORPAY_PRO_YEARLY_PLAN_ID=plan_xxxxx
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=plan_xxxxx
RAZORPAY_PREMIUM_QUARTERLY_PLAN_ID=plan_xxxxx
RAZORPAY_PREMIUM_YEARLY_PLAN_ID=plan_xxxxx
```

## Webhook Configuration

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/subscription/webhook`
3. Select all subscription and payment events
4. Copy the webhook secret to `.env.local`

## Usage Examples

### Get Subscription Status

```typescript
import { subscriptionService } from '@/lib/services/subscription-service';

const status = await subscriptionService.getSubscriptionStatus(userId);
```

### Create Subscription

```typescript
const subscription = await subscriptionService.upsertSubscription({
  userId,
  plan: 'pro',
  billingPeriod: 'monthly',
  paymentGateway: 'razorpay',
  razorpayCustomerId: customerId,
  razorpaySubscriptionId: subscriptionId,
  razorpayPlanId: planId,
  status: 'trialing',
});
```

### Track Payment

```typescript
import { chargeService } from '@/lib/services/charge-service';

const charge = await chargeService.processRazorpayPayment(
  payment,
  subscriptionId,
  userId
);
```

### Query Webhooks

```typescript
import { prisma } from '@/lib/prisma';

// Get webhooks for a subscription
const webhooks = await prisma.webhook.findMany({
  where: { subscriptionId },
  include: { logs: true },
  orderBy: { createdAt: 'desc' },
});

// Get failed webhooks
const failedWebhooks = await prisma.webhook.findMany({
  where: {
    processed: false,
    retryCount: { lt: 3 },
  },
});
```

## Error Handling

All services use standardized error codes from `lib/constants/error-codes.ts`. Errors are logged with context and stored in webhook logs for debugging.

## Logging

- All webhook events are logged with full payload
- Payment failures are tracked with error codes and messages
- Subscription status changes are logged
- All errors include stack traces in webhook logs

## Monitoring

Query the database to monitor:

1. **Failed Payments**: `SELECT * FROM Charge WHERE status = 'failed'`
2. **Failed Webhooks**: `SELECT * FROM Webhook WHERE processed = false`
3. **Subscription Status**: `SELECT * FROM Subscription WHERE status IN ('past_due', 'expired')`
4. **Recent Charges**: `SELECT * FROM Charge ORDER BY createdAt DESC LIMIT 100`

## Testing

1. Use Razorpay test mode
2. Test webhook events using Razorpay webhook simulator
3. Check webhook logs in database
4. Verify charges are created correctly
5. Test subscription cancellation flow

## Production Checklist

- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] Webhook URL configured in Razorpay
- [ ] Webhook secret set
- [ ] All plan IDs configured
- [ ] Test webhook events received
- [ ] Payment flow tested
- [ ] Error logging verified
- [ ] Monitoring queries set up

