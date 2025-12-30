'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SessionProvider.tsx:13',message:'SessionProvider mounted',data:{basePath:'/api/auth',windowLocation:typeof window!=='undefined'?window.location.href:'server'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    } catch(e){}
    // #endregion
    
    // Test session fetch
    fetch('/api/auth/session')
      .then(res => {
        // #region agent log
        try {
          fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SessionProvider.tsx:21',message:'Session fetch response',data:{status:res.status,statusText:res.statusText,contentType:res.headers.get('content-type'),ok:res.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        } catch(e){}
        // #endregion
        return res.text();
      })
      .then(text => {
        // #region agent log
        try {
          const isJson = text.trim().startsWith('{');
          fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SessionProvider.tsx:28',message:'Session fetch body check',data:{isJson:isJson,bodyLength:text.length,bodyPreview:text.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        } catch(e){}
        // #endregion
      })
      .catch(err => {
        // #region agent log
        try {
          fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SessionProvider.tsx:34',message:'Session fetch error',data:{error:err.message,errorType:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        } catch(e){}
        // #endregion
      });
  }, []);
  
  return (
    <NextAuthSessionProvider
      // Suppress errors during development if API isn't set up yet
      basePath="/api/auth"
    >
      {children}
    </NextAuthSessionProvider>
  );
}

