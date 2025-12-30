import { prisma } from './prisma';
import { USAGE_LIMITS } from './stripe';

export async function getSubscriptionStatus(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return {
      plan: 'free' as const,
      status: 'inactive' as const,
      isActive: false,
      isTrialing: false,
      trialEndsAt: null,
      currentPeriodEnd: null,
    };
  }

  const now = new Date();
  const isTrialing = subscription.status === 'trialing' && 
                     subscription.trialEndsAt && 
                     subscription.trialEndsAt > now;
  const isActive = subscription.status === 'active' || isTrialing;
  // Support both Razorpay and Stripe period ends
  const periodEnd = subscription.razorpayCurrentPeriodEnd || subscription.stripeCurrentPeriodEnd || subscription.trialEndsAt;

  return {
    plan: subscription.plan as 'free' | 'pro' | 'premium',
    status: subscription.status,
    isActive,
    isTrialing,
    trialEndsAt: subscription.trialEndsAt,
    currentPeriodEnd: periodEnd,
  };
}

export async function checkUsageLimit(userId: string, action: 'songs') {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'subscription.ts:38',message:'checkUsageLimit called',data:{userId:userId,action:action},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  } catch(e){}
  // #endregion
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'subscription.ts:40',message:'Before getSubscriptionStatus',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  } catch(e){}
  // #endregion
  const subscription = await getSubscriptionStatus(userId);
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'subscription.ts:44',message:'After getSubscriptionStatus',data:{plan:subscription.plan,status:subscription.status,isActive:subscription.isActive},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  } catch(e){}
  // #endregion
  
  if (!subscription.isActive) {
    return { allowed: false, reason: 'No active subscription' };
  }

  const limit = USAGE_LIMITS[subscription.plan][action];
  
  if (limit === -1) {
    return { allowed: true }; // Unlimited
  }

  // Count usage in current period (monthly reset)
  const periodStart = subscription.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
    : new Date(0);

  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'subscription.ts:61',message:'Before prisma usage count',data:{userId:userId,periodStart:periodStart.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  } catch(e){}
  // #endregion
  const usageCount = await prisma.usageRecord.count({
    where: {
      userId,
      action: 'download',
      createdAt: {
        gte: periodStart,
      },
    },
  });
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'subscription.ts:73',message:'After prisma usage count',data:{usageCount:usageCount,limit:limit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  } catch(e){}
  // #endregion

  if (usageCount >= limit) {
    return { 
      allowed: false, 
      reason: `Usage limit reached (${limit} songs)`,
      currentUsage: usageCount,
      limit,
    };
  }

  return { 
    allowed: true,
    currentUsage: usageCount,
    limit,
  };
}

export async function recordUsage(userId: string, action: string, metadata?: Record<string, unknown>) {
  return await prisma.usageRecord.create({
    data: {
      userId,
      action,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

