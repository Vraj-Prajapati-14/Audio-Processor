import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// #region agent log
try {
  fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:7',message:'Auth config loading - env vars check',data:{hasNextAuthSecret:!!process.env.NEXTAUTH_SECRET,hasGoogleClientId:!!process.env.GOOGLE_CLIENT_ID,hasGoogleClientSecret:!!process.env.GOOGLE_CLIENT_SECRET,nextAuthUrl:process.env.NEXTAUTH_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
} catch(e){}
// #endregion

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials?: { email?: string; password?: string }) {
        // #region agent log
        try {
          fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:16',message:'Authorize called',data:{hasEmail:!!credentials?.email,hasPassword:!!credentials?.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        } catch(e){}
        // #endregion
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // #region agent log
        try {
          fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:23',message:'Before prisma query',data:{email:credentials.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        } catch(e){}
        // #endregion
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        // #region agent log
        try {
          fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:27',message:'After prisma query',data:{userFound:!!user,hasPassword:!!user?.password,passwordHashLength:user?.password?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        } catch(e){}
        // #endregion

        if (!user || !user.password) {
          // #region agent log
          try {
            fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:33',message:'User or password missing',data:{hasUser:!!user,hasPassword:!!user?.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          } catch(e){}
          // #endregion
          throw new Error('Invalid email or password');
        }

        // #region agent log
        try {
          fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:40',message:'Before bcrypt compare',data:{providedPasswordLength:credentials.password?.length||0,storedHashLength:user.password.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        } catch(e){}
        // #endregion
        const isValid = await bcrypt.compare(credentials.password, user.password);
        // #region agent log
        try {
          fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:45',message:'After bcrypt compare',data:{isValid:isValid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        } catch(e){}
        // #endregion
        if (!isValid) {
          // #region agent log
          try {
            fetch('http://127.0.0.1:7242/ingest/687c650b-7ee8-4515-b2e4-98c92d512113',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:49',message:'Password comparison failed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          } catch(e){}
          // #endregion
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        // Fetch subscription status - handle potential database errors gracefully
        try {
          const subscription = await prisma.subscription.findUnique({
            where: { userId: user.id },
          });
          token.subscription = subscription?.plan || 'free';
          token.subscriptionStatus = subscription?.status || 'inactive';
        } catch (error) {
          console.error('Error fetching subscription:', error);
          token.subscription = 'free';
          token.subscriptionStatus = 'inactive';
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.subscription = token.subscription as string;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
  debug: process.env.NODE_ENV === 'development',
};

