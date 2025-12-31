/**
 * Charge/Payment Status Constants
 * All possible charge statuses in the system
 */

export const CHARGE_STATUS = {
  SUCCEEDED: 'succeeded',
  PENDING: 'pending',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
} as const;

export type ChargeStatus = typeof CHARGE_STATUS[keyof typeof CHARGE_STATUS];

/**
 * Check if charge status indicates successful payment
 */
export function isSuccessfulCharge(status: string): boolean {
  return status === CHARGE_STATUS.SUCCEEDED || 
         status === CHARGE_STATUS.CAPTURED ||
         status === CHARGE_STATUS.AUTHORIZED;
}

/**
 * Check if charge status indicates failed payment
 */
export function isFailedCharge(status: string): boolean {
  return status === CHARGE_STATUS.FAILED;
}

/**
 * Check if charge status indicates pending payment
 */
export function isPendingCharge(status: string): boolean {
  return status === CHARGE_STATUS.PENDING || 
         status === CHARGE_STATUS.AUTHORIZED;
}

