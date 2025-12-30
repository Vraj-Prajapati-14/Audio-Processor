import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// #region agent log
try {
  fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'prisma.ts:10',message:'Prisma initialization - DATABASE_URL check',data:{hasDatabaseUrl:!!process.env.DATABASE_URL,dbUrlLength:process.env.DATABASE_URL?.length||0,nodeEnv:process.env.NODE_ENV,dbUrlPreview:process.env.DATABASE_URL?.substring(0,50)||'missing'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
} catch(e){}
// #endregion

// Check for DATABASE_URL before creating PrismaClient
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please create a .env.local file in the audio-processor directory with DATABASE_URL.'
  );
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// #region agent log
try {
  fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'prisma.ts:25',message:'Prisma client created',data:{isNewInstance:!globalForPrisma.prisma,hasPrisma:!!prisma},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
} catch(e){}
// #endregion

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

