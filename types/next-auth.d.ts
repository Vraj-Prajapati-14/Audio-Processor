import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      subscription?: string;
      subscriptionStatus?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    subscription?: string;
    subscriptionStatus?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    subscription?: string;
    subscriptionStatus?: string;
  }
}

