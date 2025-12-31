/**
 * Charge Service
 * Handles all charge/payment tracking and management
 */

import { prisma } from '../prisma';
import { 
  CHARGE_STATUS,
  type ChargeStatus,
  isSuccessfulCharge,
  isFailedCharge,
} from '../constants/charge-status';
import { ERROR_CODES, getErrorMessage } from '../constants/error-codes';
import { PAYMENT_GATEWAYS } from '../constants/subscription-status';

export class ChargeService {
  /**
   * Create a charge record
   */
  async createCharge(data: {
    subscriptionId: string;
    userId: string;
    amount: number;
    currency?: string;
    status: ChargeStatus;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    stripePaymentIntentId?: string;
    stripeChargeId?: string;
    paymentMethod?: string;
    description?: string;
    failureCode?: string;
    failureMessage?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      const charge = await prisma.charge.create({
        data: {
          subscriptionId: data.subscriptionId,
          userId: data.userId,
          amount: data.amount,
          currency: data.currency || 'INR',
          status: data.status,
          razorpayPaymentId: data.razorpayPaymentId || null,
          razorpayOrderId: data.razorpayOrderId || null,
          stripePaymentIntentId: data.stripePaymentIntentId || null,
          stripeChargeId: data.stripeChargeId || null,
          paymentMethod: data.paymentMethod || null,
          description: data.description || null,
          failureCode: data.failureCode || null,
          failureMessage: data.failureMessage || null,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
        include: {
          subscription: true,
        },
      });

      return charge;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ChargeService] Error creating charge:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.DATABASE_ERROR));
    }
  }

  /**
   * Update charge status
   */
  async updateChargeStatus(
    chargeId: string,
    status: ChargeStatus,
    additionalData?: {
      failureCode?: string;
      failureMessage?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (additionalData?.failureCode) {
        updateData.failureCode = additionalData.failureCode;
      }

      if (additionalData?.failureMessage) {
        updateData.failureMessage = additionalData.failureMessage;
      }

      if (additionalData?.metadata) {
        updateData.metadata = JSON.stringify(additionalData.metadata);
      }

      const charge = await prisma.charge.update({
        where: { id: chargeId },
        data: updateData,
        include: {
          subscription: true,
        },
      });

      return charge;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ChargeService] Error updating charge ${chargeId}:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.DATABASE_ERROR));
    }
  }

  /**
   * Get charge by Razorpay payment ID
   */
  async getChargeByRazorpayPaymentId(razorpayPaymentId: string) {
    try {
      const charge = await prisma.charge.findUnique({
        where: { razorpayPaymentId },
        include: {
          subscription: true,
        },
      });

      return charge;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ChargeService] Error getting charge by Razorpay payment ID ${razorpayPaymentId}:`, errorMessage);
      return null;
    }
  }

  /**
   * Get charge by Stripe payment intent ID
   */
  async getChargeByStripePaymentIntentId(stripePaymentIntentId: string) {
    try {
      const charge = await prisma.charge.findUnique({
        where: { stripePaymentIntentId },
        include: {
          subscription: true,
        },
      });

      return charge;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ChargeService] Error getting charge by Stripe payment intent ID ${stripePaymentIntentId}:`, errorMessage);
      return null;
    }
  }

  /**
   * Get charges for a subscription
   */
  async getChargesBySubscriptionId(subscriptionId: string, limit: number = 50) {
    try {
      const charges = await prisma.charge.findMany({
        where: { subscriptionId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return charges;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ChargeService] Error getting charges for subscription ${subscriptionId}:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.DATABASE_ERROR));
    }
  }

  /**
   * Get charges for a user
   */
  async getChargesByUserId(userId: string, limit: number = 50) {
    try {
      const charges = await prisma.charge.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return charges;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ChargeService] Error getting charges for user ${userId}:`, errorMessage);
      throw new Error(getErrorMessage(ERROR_CODES.DATABASE_ERROR));
    }
  }

  /**
   * Process Razorpay payment and create charge
   */
  async processRazorpayPayment(payment: any, subscriptionId: string, userId: string) {
    try {
      const amount = payment.amount || 0;
      const status = payment.status === 'captured' 
        ? CHARGE_STATUS.SUCCEEDED 
        : payment.status === 'authorized'
        ? CHARGE_STATUS.AUTHORIZED
        : payment.status === 'failed'
        ? CHARGE_STATUS.FAILED
        : CHARGE_STATUS.PENDING;

      // Check if charge already exists
      let charge = await this.getChargeByRazorpayPaymentId(payment.id);

      if (charge) {
        // Update existing charge
        charge = await this.updateChargeStatus(charge.id, status, {
          failureCode: payment.error_code || undefined,
          failureMessage: payment.error_description || undefined,
        });
      } else {
        // Create new charge
        charge = await this.createCharge({
          subscriptionId,
          userId,
          amount,
          currency: payment.currency || 'INR',
          status,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id || undefined,
          paymentMethod: payment.method || undefined,
          description: payment.description || `Subscription payment for ${payment.id}`,
          failureCode: payment.error_code || undefined,
          failureMessage: payment.error_description || undefined,
          metadata: {
            razorpayPayment: payment,
          },
        });
      }

      return charge;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ChargeService] Error processing Razorpay payment:`, errorMessage);
      throw error;
    }
  }
}

export const chargeService = new ChargeService();

