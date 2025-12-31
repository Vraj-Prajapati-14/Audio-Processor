/**
 * Subscription Service
 * Handles all subscription-related operations with proper error handling and logging
 */

import { prisma } from '../prisma';
import { razorpay } from '../razorpay';
import { 
  SUBSCRIPTION_STATUS, 
  SUBSCRIPTION_PLANS, 
  BILLING_PERIODS,
  PAYMENT_GATEWAYS,
  type SubscriptionStatus,
  type SubscriptionPlan,
  type BillingPeriod,
  type PaymentGateway,
} from '../constants/subscription-status';
import { ERROR_CODES, getErrorMessage } from '../constants/error-codes';
import { TRIAL_DAYS } from '../stripe';
import { RAZORPAY_PLANS } from '../razorpay';
import { webhookService } from './webhook-service';
import { chargeService } from './charge-service';
import { apiLogService } from './api-log-service';

export class SubscriptionService {
  /**
   * Get subscription by user ID
   */
  async getSubscriptionByUserId(userId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
        include: {
          charges: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      return subscription;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SubscriptionService] Error getting subscription for user ${userId}:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.DATABASE_ERROR));
    }
  }

  /**
   * Get subscription status with computed fields
   */
  async getSubscriptionStatus(userId: string) {
    try {
      const subscription = await this.getSubscriptionByUserId(userId);

      if (!subscription) {
        return {
          plan: SUBSCRIPTION_PLANS.FREE,
          status: SUBSCRIPTION_STATUS.INACTIVE,
          isActive: false,
          isTrialing: false,
          trialEndsAt: null,
          currentPeriodEnd: null,
        };
      }

      const now = new Date();
      const isTrialing = subscription.status === SUBSCRIPTION_STATUS.TRIALING && 
                         subscription.trialEndsAt && 
                         subscription.trialEndsAt > now;
      const isActive = subscription.status === SUBSCRIPTION_STATUS.ACTIVE || isTrialing;
      
      const periodEnd = subscription.razorpayCurrentPeriodEnd || 
                       subscription.stripeCurrentPeriodEnd || 
                       subscription.trialEndsAt;

      return {
        plan: (subscription.plan || SUBSCRIPTION_PLANS.FREE) as SubscriptionPlan,
        status: subscription.status,
        isActive,
        isTrialing,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: periodEnd,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SubscriptionService] Error getting subscription status for user ${userId}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Create or update subscription
   */
  async upsertSubscription(data: {
    userId: string;
    plan: SubscriptionPlan;
    billingPeriod?: BillingPeriod;
    paymentGateway: PaymentGateway;
    razorpayCustomerId?: string;
    razorpaySubscriptionId?: string;
    razorpayPlanId?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    status?: SubscriptionStatus;
    trialEndsAt?: Date;
    currentPeriodEnd?: Date;
  }) {
    try {
      const subscription = await prisma.subscription.upsert({
        where: { userId: data.userId },
        create: {
          userId: data.userId,
          plan: data.plan,
          billingPeriod: data.billingPeriod || null,
          paymentGateway: data.paymentGateway,
          razorpayCustomerId: data.razorpayCustomerId || null,
          razorpaySubscriptionId: data.razorpaySubscriptionId || null,
          razorpayPlanId: data.razorpayPlanId || null,
          stripeCustomerId: data.stripeCustomerId || null,
          stripeSubscriptionId: data.stripeSubscriptionId || null,
          stripePriceId: data.stripePriceId || null,
          status: data.status || SUBSCRIPTION_STATUS.TRIALING,
          trialEndsAt: data.trialEndsAt || (data.status === SUBSCRIPTION_STATUS.TRIALING 
            ? new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000) 
            : null),
          razorpayCurrentPeriodEnd: data.paymentGateway === PAYMENT_GATEWAYS.RAZORPAY 
            ? data.currentPeriodEnd || null 
            : null,
          stripeCurrentPeriodEnd: data.paymentGateway === PAYMENT_GATEWAYS.STRIPE 
            ? data.currentPeriodEnd || null 
            : null,
        },
        update: {
          plan: data.plan,
          billingPeriod: data.billingPeriod || undefined,
          razorpayCustomerId: data.razorpayCustomerId || undefined,
          razorpaySubscriptionId: data.razorpaySubscriptionId || undefined,
          razorpayPlanId: data.razorpayPlanId || undefined,
          stripeCustomerId: data.stripeCustomerId || undefined,
          stripeSubscriptionId: data.stripeSubscriptionId || undefined,
          stripePriceId: data.stripePriceId || undefined,
          status: data.status || undefined,
          trialEndsAt: data.trialEndsAt || undefined,
          razorpayCurrentPeriodEnd: data.paymentGateway === PAYMENT_GATEWAYS.RAZORPAY 
            ? data.currentPeriodEnd || undefined 
            : undefined,
          stripeCurrentPeriodEnd: data.paymentGateway === PAYMENT_GATEWAYS.STRIPE 
            ? data.currentPeriodEnd || undefined 
            : undefined,
        },
      });

      return subscription;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SubscriptionService] Error upserting subscription for user ${data.userId}:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.DATABASE_ERROR));
    }
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionStatus,
    additionalData?: {
      currentPeriodEnd?: Date;
      canceledAt?: Date;
      cancelAtPeriodEnd?: boolean;
    }
  ) {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (additionalData?.currentPeriodEnd) {
        const subscription = await prisma.subscription.findUnique({
          where: { id: subscriptionId },
        });
        
        if (subscription?.paymentGateway === PAYMENT_GATEWAYS.RAZORPAY) {
          updateData.razorpayCurrentPeriodEnd = additionalData.currentPeriodEnd;
        } else {
          updateData.stripeCurrentPeriodEnd = additionalData.currentPeriodEnd;
        }
      }

      if (additionalData?.canceledAt) {
        updateData.canceledAt = additionalData.canceledAt;
      }

      if (additionalData?.cancelAtPeriodEnd !== undefined) {
        updateData.cancelAtPeriodEnd = additionalData.cancelAtPeriodEnd;
      }

      const updated = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: updateData,
      });

      return updated;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SubscriptionService] Error updating subscription ${subscriptionId}:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.DATABASE_ERROR));
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = false) {
    try {
      const subscription = await this.getSubscriptionByUserId(userId);

      if (!subscription) {
        throw new Error(getErrorMessage(ERROR_CODES.SUBSCRIPTION_NOT_FOUND));
      }

      if (subscription.status === SUBSCRIPTION_STATUS.CANCELED) {
        throw new Error(getErrorMessage(ERROR_CODES.SUBSCRIPTION_CANCELED));
      }

      // Cancel in payment gateway
      if (subscription.paymentGateway === PAYMENT_GATEWAYS.RAZORPAY) {
        if (!razorpay || !subscription.razorpaySubscriptionId) {
          throw new Error(getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED));
        }

        if (!cancelAtPeriodEnd) {
          // Cancel immediately
          const startTime = Date.now();
          try {
            const response = await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);
            const duration = Date.now() - startTime;

            // Log API call
            await apiLogService.logApiCall({
              userId,
              subscriptionId: subscription.id,
              paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
              endpoint: `/subscriptions/${subscription.razorpaySubscriptionId}/cancel`,
              method: 'POST',
              responsePayload: response as any,
              statusCode: 200,
              success: true,
              duration,
            });
          } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            // Log failed API call
            await apiLogService.logApiCall({
              userId,
              subscriptionId: subscription.id,
              paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
              endpoint: `/subscriptions/${subscription.razorpaySubscriptionId}/cancel`,
              method: 'POST',
              success: false,
              error: errorMessage,
              duration,
            });
            throw error;
          }
        }
      }

      // Update database
      await this.updateSubscriptionStatus(
        subscription.id,
        cancelAtPeriodEnd ? subscription.status : SUBSCRIPTION_STATUS.CANCELED,
        {
          canceledAt: new Date(),
          cancelAtPeriodEnd: cancelAtPeriodEnd,
        }
      );

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SubscriptionService] Error canceling subscription for user ${userId}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Create Razorpay customer
   */
  async createRazorpayCustomer(userId: string, email?: string | null, name?: string | null) {
    const startTime = Date.now();
    const requestPayload = {
      name: name || undefined,
      email: email || undefined,
      notes: {
        userId: userId,
      },
    };

    try {
      if (!razorpay) {
        throw new Error(getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED));
      }

      const customer = await razorpay.customers.create(requestPayload);
      const duration = Date.now() - startTime;

      // Log API call
      await apiLogService.logApiCall({
        userId,
        paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
        endpoint: '/customers',
        method: 'POST',
        requestPayload,
        responsePayload: customer as any,
        statusCode: 200,
        success: true,
        duration,
      });

      return customer;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed API call
      await apiLogService.logApiCall({
        userId,
        paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
        endpoint: '/customers',
        method: 'POST',
        requestPayload,
        success: false,
        error: errorMessage,
        duration,
      });

      console.error(`[SubscriptionService] Error creating Razorpay customer for user ${userId}:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_ERROR));
    }
  }

  /**
   * Create Razorpay subscription
   */
  async createRazorpaySubscription(
    customerId: string,
    planId: string,
    userId: string,
    plan: SubscriptionPlan,
    billingPeriod: BillingPeriod
  ) {
    const startTime = Date.now();
    const requestPayload = {
      plan_id: planId,
      customer_notify: 1,
      total_count: 9999, // For recurring subscriptions
      start_at: Math.floor((Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000) / 1000), // Start after trial
      notes: {
        userId: userId,
        plan: plan,
        billingPeriod: billingPeriod,
      },
    };

    try {
      if (!razorpay) {
        throw new Error(getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_NOT_CONFIGURED));
      }

      const planConfig = RAZORPAY_PLANS[plan][billingPeriod];
      if (!planConfig.planId) {
        throw new Error(getErrorMessage(ERROR_CODES.PLAN_NOT_CONFIGURED));
      }

      const subscription = await razorpay.subscriptions.create(requestPayload);
      const duration = Date.now() - startTime;

      // Get subscription ID for logging
      const dbSubscription = await this.getSubscriptionByUserId(userId);

      // Log API call
      await apiLogService.logApiCall({
        userId,
        subscriptionId: dbSubscription?.id,
        paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
        endpoint: '/subscriptions',
        method: 'POST',
        requestPayload,
        responsePayload: subscription as any,
        statusCode: 200,
        success: true,
        duration,
      });

      return subscription;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Get subscription ID for logging
      const dbSubscription = await this.getSubscriptionByUserId(userId).catch(() => null);

      // Log failed API call
      await apiLogService.logApiCall({
        userId,
        subscriptionId: dbSubscription?.id,
        paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
        endpoint: '/subscriptions',
        method: 'POST',
        requestPayload,
        success: false,
        error: errorMessage,
        duration,
      });

      console.error(`[SubscriptionService] Error creating Razorpay subscription for user ${userId}:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.PAYMENT_GATEWAY_ERROR));
    }
  }
}

export const subscriptionService = new SubscriptionService();

