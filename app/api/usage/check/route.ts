import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkUsageLimit } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usage/check/route.ts:7',message:'Usage check API called',data:{method:'POST',hasRequest:!!request},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  } catch(e){}
  // #endregion
  try {
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usage/check/route.ts:12',message:'Before getServerSession',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    } catch(e){}
    // #endregion
    const session = await getServerSession(authOptions);
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usage/check/route.ts:16',message:'After getServerSession',data:{hasSession:!!session,hasUserId:!!session?.user?.id,userId:session?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    } catch(e){}
    // #endregion
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usage/check/route.ts:25',message:'Before checkUsageLimit',data:{action:action||'songs',userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch(e){}
    // #endregion
    const result = await checkUsageLimit(session.user.id, action || 'songs');
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usage/check/route.ts:28',message:'After checkUsageLimit',data:{allowed:result.allowed,reason:result.reason},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch(e){}
    // #endregion

    return NextResponse.json(result);
  } catch (error) {
    // #region agent log
    try {
      const err = error as Error;
      fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usage/check/route.ts:34',message:'Usage check error caught',data:{error:err.message,errorType:err.name,stack:err.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch(e){}
    // #endregion
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

