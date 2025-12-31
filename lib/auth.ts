import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from './email';

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
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (in seconds)
    updateAge: 24 * 60 * 60, // 24 hours - update session if older than this
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user from Google OAuth
            console.log('📝 Creating new user from Google OAuth:', user.email);
            
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || null,
                image: user.image || null,
                emailVerified: new Date(), // Google emails are pre-verified
                // No password for OAuth users
              },
            });

            // Create account link
            if (account) {
              await prisma.account.create({
                data: {
                  userId: newUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token || null,
                  refresh_token: account.refresh_token || null,
                  expires_at: account.expires_at || null,
                  token_type: account.token_type || null,
                  scope: account.scope || null,
                  id_token: account.id_token || null,
                  session_state: account.session_state || null,
                },
              });
            }

            // Send welcome email (non-blocking)
            try {
              console.log('📧 Sending welcome email to new Google OAuth user:', user.email);
              await sendWelcomeEmail(user.email, user.name || null);
            } catch (emailError) {
              console.error('❌ Failed to send welcome email to Google OAuth user:', emailError);
              // Don't fail sign-in if email fails
            }

            // Update user object with new ID for JWT
            user.id = newUser.id;
          } else {
            // User exists, update their Google account link if needed
            if (account) {
              const existingAccount = await prisma.account.findUnique({
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                },
              });

              if (!existingAccount) {
                // Link Google account to existing user
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token || null,
                    refresh_token: account.refresh_token || null,
                    expires_at: account.expires_at || null,
                    token_type: account.token_type || null,
                    scope: account.scope || null,
                    id_token: account.id_token || null,
                    session_state: account.session_state || null,
                  },
                });
              }

              // Update user info if needed
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  name: user.name || existingUser.name,
                  image: user.image || existingUser.image,
                  emailVerified: existingUser.emailVerified || new Date(),
                },
              });
            }

            // Update user object with existing ID for JWT
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error('❌ Error handling Google OAuth sign in:', error);
          // Allow sign in to proceed even if database operations fail
          // This prevents blocking legitimate users
        }
      }

      return true; // Allow sign in
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      // Initial sign in - user object is available
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

