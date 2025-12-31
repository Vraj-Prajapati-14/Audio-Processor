# Storage Verification - What We're Storing

## ✅ Complete Storage Verification

### 1. **Webhook Responses** ✅
**Table: `Webhook`**
- ✅ Full webhook payload (JSON) stored in `payload` field
- ✅ Webhook signature stored in `signature` field
- ✅ Event type (`eventType`) - subscription.activated, payment.failed, etc.
- ✅ Event ID (`eventId`) - unique Razorpay/Stripe event ID
- ✅ Payment gateway (`paymentGateway`) - razorpay or stripe
- ✅ Processing status (`processed`, `processingError`, `retryCount`)
- ✅ **Linked to User via `subscriptionId` → `Subscription` → `userId`**
- ✅ **Linked directly via `subscriptionId` to Subscription table**

**Table: `WebhookLog`**
- ✅ Detailed logs for each webhook processing attempt
- ✅ Log level (info, warning, error, debug)
- ✅ Log message and contextual data
- ✅ Error stack traces stored in `error` field
- ✅ Linked to Webhook via `webhookId`

### 2. **API Responses** ✅
**Table: `ApiLog`** (NEW - Just Added)
- ✅ Full API request payload stored in `requestPayload` (JSON)
- ✅ Full API response payload stored in `responsePayload` (JSON)
- ✅ HTTP method (`method`) - GET, POST, PUT, DELETE
- ✅ API endpoint (`endpoint`) - e.g., "/subscriptions", "/customers"
- ✅ HTTP status code (`statusCode`)
- ✅ Success/failure status (`success`)
- ✅ Error messages (`error`) if API call failed
- ✅ Duration in milliseconds (`duration`)
- ✅ **Direct link to User via `userId`**
- ✅ **Linked to Subscription via `subscriptionId`**
- ✅ **Linked to Charge via `chargeId`**
- ✅ Payment gateway tracked (`paymentGateway`)

### 3. **Subscriptions** ✅
**Table: `Subscription`**
- ✅ **Direct link to User via `userId` (unique)**
- ✅ Plan type (`plan`) - free, pro, premium
- ✅ Billing period (`billingPeriod`) - monthly, quarterly, yearly
- ✅ Subscription status (`status`) - active, canceled, past_due, trialing, paused, expired
- ✅ **Next billing date** (`razorpayCurrentPeriodEnd` or `stripeCurrentPeriodEnd`)
- ✅ Trial end date (`trialEndsAt`)
- ✅ **Cancellation tracking**:
  - `canceledAt` - when subscription was canceled
  - `cancelAtPeriodEnd` - whether to cancel at period end
  - `status` - includes 'canceled' status
- ✅ Razorpay IDs: `razorpayCustomerId`, `razorpaySubscriptionId`, `razorpayPlanId`
- ✅ Stripe IDs: `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`
- ✅ Payment gateway used (`paymentGateway`)
- ✅ Created and updated timestamps

### 4. **Charges/Payments** ✅
**Table: `Charge`**
- ✅ **Direct link to User via `userId`**
- ✅ **Linked to Subscription via `subscriptionId`**
- ✅ Payment amount (`amount`) - in smallest currency unit (paise/cents)
- ✅ Currency (`currency`) - INR, USD, etc.
- ✅ Payment status (`status`) - succeeded, pending, failed, **refunded**, **partially_refunded**
- ✅ **Refunded status tracked** via `status` field (refunded/partially_refunded)
- ✅ Payment method (`paymentMethod`) - card, netbanking, upi, wallet, etc.
- ✅ **Error tracking**:
  - `failureCode` - error code if payment failed
  - `failureMessage` - detailed error message
- ✅ Razorpay payment IDs: `razorpayPaymentId`, `razorpayOrderId`
- ✅ Stripe payment IDs: `stripePaymentIntentId`, `stripeChargeId`
- ✅ Description and metadata (JSON)
- ✅ Created and updated timestamps

### 5. **Billing Information** ✅
**In Subscription Table:**
- ✅ **Next billing date**: `razorpayCurrentPeriodEnd` or `stripeCurrentPeriodEnd`
- ✅ **Billing period**: `billingPeriod` (monthly, quarterly, yearly)
- ✅ Trial end date: `trialEndsAt`

**In Charge Table:**
- ✅ Payment date: `createdAt`
- ✅ Amount and currency for each charge

### 6. **Error & Reason Tracking** ✅
**In Charge Table:**
- ✅ `failureCode` - specific error code
- ✅ `failureMessage` - detailed error reason

**In Webhook Table:**
- ✅ `processingError` - error when processing webhook
- ✅ `retryCount` - number of retry attempts

**In ApiLog Table:**
- ✅ `error` - error message for failed API calls
- ✅ `success` - boolean indicating success/failure

**In WebhookLog Table:**
- ✅ `error` - error stack traces
- ✅ `level` - log level (error, warning, etc.)
- ✅ `message` - error messages

### 7. **User ID Linking** ✅
**All tables properly linked to User:**
- ✅ `Subscription.userId` → `User.id` (direct, unique)
- ✅ `Charge.userId` → `User.id` (direct)
- ✅ `Webhook.subscriptionId` → `Subscription.id` → `Subscription.userId` → `User.id` (via subscription)
- ✅ `ApiLog.userId` → `User.id` (direct)
- ✅ `ApiLog.subscriptionId` → `Subscription.id` → `Subscription.userId` → `User.id` (via subscription)
- ✅ `ApiLog.chargeId` → `Charge.id` → `Charge.userId` → `User.id` (via charge)

### 8. **Cancellation Tracking** ✅
**In Subscription Table:**
- ✅ `status` - can be 'canceled'
- ✅ `canceledAt` - timestamp when canceled
- ✅ `cancelAtPeriodEnd` - boolean for end-of-period cancellation

### 9. **Refund Tracking** ✅
**In Charge Table:**
- ✅ `status` - can be 'refunded' or 'partially_refunded'
- ✅ Full payment details stored for refund tracking

## Summary

✅ **Webhook responses**: Stored with full payload, signature, linked to user  
✅ **API responses**: Stored with request/response payloads, linked to user  
✅ **Subscriptions**: Stored separately with all details, linked to user  
✅ **Charges**: Stored separately with payment details, linked to user  
✅ **Billing date**: Next billing date tracked in subscription  
✅ **Errors & reasons**: Tracked in charges, webhooks, and API logs  
✅ **Next billing**: Tracked in subscription (razorpayCurrentPeriodEnd/stripeCurrentPeriodEnd)  
✅ **Refunded status**: Tracked in charge status (refunded/partially_refunded)  
✅ **Subscription cancelled**: Tracked with canceledAt, cancelAtPeriodEnd, and status  
✅ **User ID linking**: All tables properly linked to user directly or via relations  

**Everything is stored perfectly with proper relationships and indexing!** 🎯

