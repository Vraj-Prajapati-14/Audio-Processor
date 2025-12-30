import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// #region agent log
try {
  fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:4',message:'NextAuth route module loaded',data:{hasAuthOptions:!!authOptions},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
} catch(e){}
// #endregion

const handler = NextAuth(authOptions);

const wrappedHandler = async (req: Request, context: any) => {
  // #region agent log
  try {
    const url = req.url || 'unknown';
    fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:11',message:'NextAuth handler called',data:{method:req.method,url:url,pathname:new URL(url).pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  } catch(e){}
  // #endregion
  try {
    const result = await handler(req, context);
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:17',message:'NextAuth handler success',data:{status:result?.status,hasBody:!!result?.body,contentType:result?.headers?.get('content-type')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch(e){}
    // #endregion
    return result;
  } catch (error) {
    // #region agent log
    try {
      const err = error as Error;
      fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:23',message:'NextAuth handler error',data:{error:err.message,errorType:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch(e){}
    // #endregion
    throw error;
  }
};

export { wrappedHandler as GET, wrappedHandler as POST };

// Make sure this route is dynamic
export const dynamic = 'force-dynamic';

