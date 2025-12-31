/**
 * API Log Service
 * Tracks all API calls to Razorpay/Stripe with requests and responses
 */

import { prisma } from '../prisma';
import { PAYMENT_GATEWAYS } from '../constants/subscription-status';

export class ApiLogService {
  /**
   * Log API call (request and response)
   */
  async logApiCall(data: {
    userId?: string;
    subscriptionId?: string;
    chargeId?: string;
    paymentGateway: string;
    endpoint: string;
    method: string;
    requestPayload?: Record<string, unknown>;
    responsePayload?: Record<string, unknown>;
    statusCode?: number;
    success: boolean;
    error?: string;
    duration?: number; // in milliseconds
  }) {
    try {
      await prisma.apiLog.create({
        data: {
          userId: data.userId || null,
          subscriptionId: data.subscriptionId || null,
          chargeId: data.chargeId || null,
          paymentGateway: data.paymentGateway,
          endpoint: data.endpoint,
          method: data.method,
          requestPayload: data.requestPayload ? JSON.stringify(data.requestPayload) : null,
          responsePayload: data.responsePayload ? JSON.stringify(data.responsePayload) : null,
          statusCode: data.statusCode || null,
          success: data.success,
          error: data.error || null,
          duration: data.duration || null,
        },
      });
    } catch (error) {
      // Don't throw - logging should not break the flow
      console.error('[ApiLogService] Error logging API call:', error);
    }
  }

  /**
   * Get API logs for a user
   */
  async getApiLogsByUserId(userId: string, limit: number = 100) {
    try {
      return await prisma.apiLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('[ApiLogService] Error getting API logs:', error);
      return [];
    }
  }

  /**
   * Get API logs for a subscription
   */
  async getApiLogsBySubscriptionId(subscriptionId: string, limit: number = 100) {
    try {
      return await prisma.apiLog.findMany({
        where: { subscriptionId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('[ApiLogService] Error getting API logs:', error);
      return [];
    }
  }

  /**
   * Get failed API calls
   */
  async getFailedApiLogs(limit: number = 100) {
    try {
      return await prisma.apiLog.findMany({
        where: { success: false },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('[ApiLogService] Error getting failed API logs:', error);
      return [];
    }
  }
}

export const apiLogService = new ApiLogService();

