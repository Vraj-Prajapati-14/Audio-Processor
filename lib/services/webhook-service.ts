/**
 * Webhook Service
 * Handles webhook processing, logging, and tracking
 */

import { prisma } from '../prisma';
import { 
  RAZORPAY_WEBHOOK_EVENTS,
  type RazorpayWebhookEvent,
} from '../constants/webhook-events';
import { ERROR_CODES, getErrorMessage } from '../constants/error-codes';
import { PAYMENT_GATEWAYS } from '../constants/subscription-status';
import { subscriptionService } from './subscription-service';
import { chargeService } from './charge-service';

export class WebhookService {
  /**
   * Create webhook record
   */
  async createWebhook(data: {
    eventType: string;
    eventId?: string;
    paymentGateway: string;
    payload: string;
    signature?: string;
    subscriptionId?: string;
  }) {
    try {
      const webhook = await prisma.webhook.create({
        data: {
          eventType: data.eventType,
          eventId: data.eventId || null,
          paymentGateway: data.paymentGateway,
          payload: data.payload,
          signature: data.signature || null,
          subscriptionId: data.subscriptionId || null,
          processed: false,
        },
      });

      return webhook;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[WebhookService] Error creating webhook:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.DATABASE_ERROR));
    }
  }

  /**
   * Log webhook event
   */
  async logWebhookEvent(
    webhookId: string,
    level: 'info' | 'warning' | 'error' | 'debug',
    message: string,
    data?: Record<string, unknown>,
    error?: Error
  ) {
    try {
      await prisma.webhookLog.create({
        data: {
          webhookId,
          level,
          message,
          data: data ? JSON.stringify(data) : null,
          error: error ? error.stack || error.message : null,
        },
      });
    } catch (logError) {
      // Don't throw - logging should not break the flow
      console.error(`[WebhookService] Error logging webhook event:`, logError);
    }
  }

  /**
   * Mark webhook as processed
   */
  async markWebhookProcessed(webhookId: string, error?: string) {
    try {
      await prisma.webhook.update({
        where: { id: webhookId },
        data: {
          processed: true,
          processingError: error || null,
          updatedAt: new Date(),
        },
      });
    } catch (updateError) {
      const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error';
      console.error(`[WebhookService] Error marking webhook as processed:`, errorMessage);
    }
  }

  /**
   * Increment webhook retry count
   */
  async incrementWebhookRetry(webhookId: string) {
    try {
      const webhook = await prisma.webhook.findUnique({
        where: { id: webhookId },
      });

      if (webhook) {
        await prisma.webhook.update({
          where: { id: webhookId },
          data: {
            retryCount: webhook.retryCount + 1,
            updatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[WebhookService] Error incrementing webhook retry:`, errorMessage);
    }
  }

  /**
   * Process Razorpay webhook event
   */
  async processRazorpayWebhook(event: any) {
    const eventType = event.event as RazorpayWebhookEvent;
    const payload = event.payload || {};
    
    // Create webhook record
    const webhook = await this.createWebhook({
      eventType,
      eventId: event.id || undefined,
      paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
      payload: JSON.stringify(event),
      signature: event.signature || undefined,
    });

    try {
      await this.logWebhookEvent(webhook.id, 'info', `Processing Razorpay webhook: ${eventType}`, {
        eventId: event.id,
        eventType,
      });

      // Handle different event types
      switch (eventType) {
        case RAZORPAY_WEBHOOK_EVENTS.SUBSCRIPTION_ACTIVATED:
        case RAZORPAY_WEBHOOK_EVENTS.SUBSCRIPTION_CHARGED:
          await this.handleSubscriptionActivated(payload.subscription?.entity, webhook.id);
          break;

        case RAZORPAY_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
          await this.handleSubscriptionUpdated(payload.subscription?.entity, webhook.id);
          break;

        case RAZORPAY_WEBHOOK_EVENTS.SUBSCRIPTION_CANCELLED:
        case RAZORPAY_WEBHOOK_EVENTS.SUBSCRIPTION_PAUSED:
          await this.handleSubscriptionCancelled(payload.subscription?.entity, webhook.id);
          break;

        case RAZORPAY_WEBHOOK_EVENTS.SUBSCRIPTION_RESUMED:
          await this.handleSubscriptionResumed(payload.subscription?.entity, webhook.id);
          break;

        case RAZORPAY_WEBHOOK_EVENTS.SUBSCRIPTION_COMPLETED:
        case RAZORPAY_WEBHOOK_EVENTS.SUBSCRIPTION_EXPIRED:
          await this.handleSubscriptionExpired(payload.subscription?.entity, webhook.id);
          break;

        case RAZORPAY_WEBHOOK_EVENTS.PAYMENT_AUTHORIZED:
        case RAZORPAY_WEBHOOK_EVENTS.PAYMENT_CAPTURED:
          await this.handlePaymentCaptured(payload.payment?.entity, webhook.id);
          break;

        case RAZORPAY_WEBHOOK_EVENTS.PAYMENT_FAILED:
          await this.handlePaymentFailed(payload.payment?.entity, webhook.id);
          break;

        case RAZORPAY_WEBHOOK_EVENTS.PAYMENT_REFUNDED:
        case RAZORPAY_WEBHOOK_EVENTS.PAYMENT_PARTIALLY_REFUNDED:
          await this.handlePaymentRefunded(payload.payment?.entity, webhook.id);
          break;

        default:
          await this.logWebhookEvent(
            webhook.id,
            'warning',
            `Unhandled Razorpay webhook event: ${eventType}`,
            { eventType, payload }
          );
      }

      await this.markWebhookProcessed(webhook.id);
      await this.logWebhookEvent(webhook.id, 'info', `Successfully processed webhook: ${eventType}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logWebhookEvent(webhook.id, 'error', `Error processing webhook: ${errorMessage}`, {}, error as Error);
      await this.markWebhookProcessed(webhook.id, errorMessage);
      throw error;
    }
  }

  /**
   * Handle subscription activated/charged
   */
  private async handleSubscriptionActivated(subscription: any, webhookId: string) {
    if (!subscription) {
      throw new Error('Subscription data missing in webhook payload');
    }

    const subscriptionId = subscription.id;
    const customerId = subscription.customer_id;
    const planId = subscription.plan_id;
    const notes = subscription.notes || {};

    await this.logWebhookEvent(webhookId, 'info', 'Handling subscription activated', {
      subscriptionId,
      customerId,
      planId,
    });

    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { razorpaySubscriptionId: subscriptionId },
          { razorpayCustomerId: customerId },
        ],
      },
    });

    if (!dbSubscription) {
      await this.logWebhookEvent(webhookId, 'warning', 'Subscription not found in database', {
        subscriptionId,
        customerId,
      });
      return;
    }

    const status = subscription.status === 'active' 
      ? 'active' 
      : subscription.status === 'authenticated' 
      ? 'trialing' 
      : 'active';
    
    const currentPeriodEnd = subscription.end_at 
      ? new Date(subscription.end_at * 1000) 
      : null;

    await subscriptionService.updateSubscriptionStatus(
      dbSubscription.id,
      status as any,
      { currentPeriodEnd: currentPeriodEnd || undefined }
    );

    // Update webhook with subscription ID
    await prisma.webhook.update({
      where: { id: webhookId },
      data: { subscriptionId: dbSubscription.id },
    });

    await this.logWebhookEvent(webhookId, 'info', 'Subscription activated successfully', {
      subscriptionId: dbSubscription.id,
      status,
    });
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(subscription: any, webhookId: string) {
    if (!subscription) {
      throw new Error('Subscription data missing in webhook payload');
    }

    const subscriptionId = subscription.id;
    const customerId = subscription.customer_id;

    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { razorpaySubscriptionId: subscriptionId },
          { razorpayCustomerId: customerId },
        ],
      },
    });

    if (!dbSubscription) {
      await this.logWebhookEvent(webhookId, 'warning', 'Subscription not found for update', {
        subscriptionId,
        customerId,
      });
      return;
    }

    const status = subscription.status === 'active' 
      ? 'active' 
      : subscription.status === 'cancelled' 
      ? 'canceled' 
      : subscription.status === 'paused'
      ? 'paused'
      : 'active';
    
    const currentPeriodEnd = subscription.end_at 
      ? new Date(subscription.end_at * 1000) 
      : null;

    await subscriptionService.updateSubscriptionStatus(
      dbSubscription.id,
      status as any,
      { currentPeriodEnd: currentPeriodEnd || undefined }
    );

    await this.logWebhookEvent(webhookId, 'info', 'Subscription updated successfully', {
      subscriptionId: dbSubscription.id,
      status,
    });
  }

  /**
   * Handle subscription cancelled/paused
   */
  private async handleSubscriptionCancelled(subscription: any, webhookId: string) {
    if (!subscription) {
      throw new Error('Subscription data missing in webhook payload');
    }

    const subscriptionId = subscription.id;
    const customerId = subscription.customer_id;

    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { razorpaySubscriptionId: subscriptionId },
          { razorpayCustomerId: customerId },
        ],
      },
    });

    if (!dbSubscription) {
      await this.logWebhookEvent(webhookId, 'warning', 'Subscription not found for cancellation', {
        subscriptionId,
        customerId,
      });
      return;
    }

    await subscriptionService.updateSubscriptionStatus(
      dbSubscription.id,
      'canceled',
      { canceledAt: new Date() }
    );

    await this.logWebhookEvent(webhookId, 'info', 'Subscription cancelled successfully', {
      subscriptionId: dbSubscription.id,
    });
  }

  /**
   * Handle subscription resumed
   */
  private async handleSubscriptionResumed(subscription: any, webhookId: string) {
    if (!subscription) {
      throw new Error('Subscription data missing in webhook payload');
    }

    const subscriptionId = subscription.id;
    const customerId = subscription.customer_id;

    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { razorpaySubscriptionId: subscriptionId },
          { razorpayCustomerId: customerId },
        ],
      },
    });

    if (!dbSubscription) {
      await this.logWebhookEvent(webhookId, 'warning', 'Subscription not found for resume', {
        subscriptionId,
        customerId,
      });
      return;
    }

    const currentPeriodEnd = subscription.end_at 
      ? new Date(subscription.end_at * 1000) 
      : null;

    await subscriptionService.updateSubscriptionStatus(
      dbSubscription.id,
      'active',
      { currentPeriodEnd: currentPeriodEnd || undefined }
    );

    await this.logWebhookEvent(webhookId, 'info', 'Subscription resumed successfully', {
      subscriptionId: dbSubscription.id,
    });
  }

  /**
   * Handle subscription expired
   */
  private async handleSubscriptionExpired(subscription: any, webhookId: string) {
    if (!subscription) {
      throw new Error('Subscription data missing in webhook payload');
    }

    const subscriptionId = subscription.id;
    const customerId = subscription.customer_id;

    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { razorpaySubscriptionId: subscriptionId },
          { razorpayCustomerId: customerId },
        ],
      },
    });

    if (!dbSubscription) {
      await this.logWebhookEvent(webhookId, 'warning', 'Subscription not found for expiration', {
        subscriptionId,
        customerId,
      });
      return;
    }

    await subscriptionService.updateSubscriptionStatus(
      dbSubscription.id,
      'expired'
    );

    await this.logWebhookEvent(webhookId, 'info', 'Subscription expired successfully', {
      subscriptionId: dbSubscription.id,
    });
  }

  /**
   * Handle payment captured
   */
  private async handlePaymentCaptured(payment: any, webhookId: string) {
    if (!payment) {
      throw new Error('Payment data missing in webhook payload');
    }

    const subscriptionId = payment.subscription_id;
    if (!subscriptionId) {
      await this.logWebhookEvent(webhookId, 'warning', 'Payment captured but no subscription ID', {
        paymentId: payment.id,
      });
      return;
    }

    const dbSubscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: subscriptionId },
    });

    if (!dbSubscription) {
      await this.logWebhookEvent(webhookId, 'warning', 'Subscription not found for payment', {
        subscriptionId,
        paymentId: payment.id,
      });
      return;
    }

    // Create or update charge
    await chargeService.processRazorpayPayment(payment, dbSubscription.id, dbSubscription.userId);

    await this.logWebhookEvent(webhookId, 'info', 'Payment captured successfully', {
      paymentId: payment.id,
      subscriptionId: dbSubscription.id,
    });
  }

  /**
   * Handle payment failed
   */
  private async handlePaymentFailed(payment: any, webhookId: string) {
    if (!payment) {
      throw new Error('Payment data missing in webhook payload');
    }

    const subscriptionId = payment.subscription_id;
    if (!subscriptionId) {
      await this.logWebhookEvent(webhookId, 'warning', 'Payment failed but no subscription ID', {
        paymentId: payment.id,
      });
      return;
    }

    const dbSubscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: subscriptionId },
    });

    if (dbSubscription) {
      await subscriptionService.updateSubscriptionStatus(
        dbSubscription.id,
        'past_due'
      );

      // Create charge record for failed payment
      await chargeService.processRazorpayPayment(payment, dbSubscription.id, dbSubscription.userId);
    }

    await this.logWebhookEvent(webhookId, 'error', 'Payment failed', {
      paymentId: payment.id,
      subscriptionId: subscriptionId,
      errorCode: payment.error_code,
      errorDescription: payment.error_description,
    });
  }

  /**
   * Handle payment refunded
   */
  private async handlePaymentRefunded(payment: any, webhookId: string) {
    if (!payment) {
      throw new Error('Payment data missing in webhook payload');
    }

    const charge = await chargeService.getChargeByRazorpayPaymentId(payment.id);
    if (charge) {
      const status = payment.amount_refunded === payment.amount 
        ? 'refunded' 
        : 'partially_refunded';
      
      await chargeService.updateChargeStatus(charge.id, status as any);
    }

    await this.logWebhookEvent(webhookId, 'info', 'Payment refunded', {
      paymentId: payment.id,
      refundAmount: payment.amount_refunded,
    });
  }
}

export const webhookService = new WebhookService();

