-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "billingPeriod" TEXT,
ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canceledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpayOrderId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "description" TEXT,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT,
    "paymentGateway" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "signature" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "subscriptionId" TEXT,
    "chargeId" TEXT,
    "paymentGateway" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "requestPayload" TEXT,
    "responsePayload" TEXT,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Charge_razorpayPaymentId_key" ON "Charge"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Charge_stripePaymentIntentId_key" ON "Charge"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Charge_stripeChargeId_key" ON "Charge"("stripeChargeId");

-- CreateIndex
CREATE INDEX "Charge_subscriptionId_idx" ON "Charge"("subscriptionId");

-- CreateIndex
CREATE INDEX "Charge_userId_idx" ON "Charge"("userId");

-- CreateIndex
CREATE INDEX "Charge_razorpayPaymentId_idx" ON "Charge"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Charge_razorpayOrderId_idx" ON "Charge"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "Charge_stripePaymentIntentId_idx" ON "Charge"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Charge_stripeChargeId_idx" ON "Charge"("stripeChargeId");

-- CreateIndex
CREATE INDEX "Charge_status_idx" ON "Charge"("status");

-- CreateIndex
CREATE INDEX "Charge_createdAt_idx" ON "Charge"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_eventId_key" ON "Webhook"("eventId");

-- CreateIndex
CREATE INDEX "Webhook_subscriptionId_idx" ON "Webhook"("subscriptionId");

-- CreateIndex
CREATE INDEX "Webhook_eventType_idx" ON "Webhook"("eventType");

-- CreateIndex
CREATE INDEX "Webhook_eventId_idx" ON "Webhook"("eventId");

-- CreateIndex
CREATE INDEX "Webhook_paymentGateway_idx" ON "Webhook"("paymentGateway");

-- CreateIndex
CREATE INDEX "Webhook_processed_idx" ON "Webhook"("processed");

-- CreateIndex
CREATE INDEX "Webhook_createdAt_idx" ON "Webhook"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookLog_webhookId_idx" ON "WebhookLog"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookLog_level_idx" ON "WebhookLog"("level");

-- CreateIndex
CREATE INDEX "WebhookLog_createdAt_idx" ON "WebhookLog"("createdAt");

-- CreateIndex
CREATE INDEX "ApiLog_userId_idx" ON "ApiLog"("userId");

-- CreateIndex
CREATE INDEX "ApiLog_subscriptionId_idx" ON "ApiLog"("subscriptionId");

-- CreateIndex
CREATE INDEX "ApiLog_chargeId_idx" ON "ApiLog"("chargeId");

-- CreateIndex
CREATE INDEX "ApiLog_paymentGateway_idx" ON "ApiLog"("paymentGateway");

-- CreateIndex
CREATE INDEX "ApiLog_success_idx" ON "ApiLog"("success");

-- CreateIndex
CREATE INDEX "ApiLog_createdAt_idx" ON "ApiLog"("createdAt");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_paymentGateway_idx" ON "Subscription"("paymentGateway");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiLog" ADD CONSTRAINT "ApiLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiLog" ADD CONSTRAINT "ApiLog_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiLog" ADD CONSTRAINT "ApiLog_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
