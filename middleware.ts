import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Get token from request
    const token = req.nextauth.token;

    // List of protected routes that require authentication
    const protectedRoutes = [
      '/subscription',
      '/dashboard',
      '/account',
      '/settings',
    ];

    // Home page (/) - protect if accessing audio editor features
    // Note: Pricing page is public (users need to see it before signing up)
    const isHomePage = req.nextUrl.pathname === '/';

    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    // Home page requires authentication for full functionality
    // (but we allow viewing, authentication checked in component for downloads)
    // API routes are already protected server-side

    // If accessing protected route without valid token, redirect to sign-in
    if (isProtectedRoute && !token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Note: Home page (/) allows viewing but API routes are protected
    // This allows users to see the interface before signing up

    // Allow request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Additional authorization logic can be added here
        // For now, we handle it in the middleware function above
        return true;
      },
    },
  }
);

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth routes (handled by NextAuth)
     * - api/subscription/webhook (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|api/subscription/webhook|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

