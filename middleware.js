import { NextResponse } from 'next/server';

// Middleware to handle client-side redirects for onboarding flow
export function middleware(request) {
  const path = request.nextUrl.pathname;
  console.log(`[Middleware] Request to: ${path}`);

  // Check if it's a root request
  if (path === '/') {
    // Create a cookie-based check (since we can't access localStorage in middleware)
    const onboardedCookie = request.cookies.get('onboarded');

    if (onboardedCookie?.value === 'true') {
      // If onboarded cookie exists, redirect to daksh dashboard
      return NextResponse.redirect(new URL('/daksh', request.url));
    } else {
      // If not onboarded, redirect to onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // For daksh access, check if user is onboarded
  if (path.startsWith('/daksh')) {
    const onboardedCookie = request.cookies.get('onboarded');

    // Only allow access to daksh if properly onboarded
    if (onboardedCookie?.value !== 'true') {
      // If not onboarded, redirect to start of onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // All onboarding paths are allowed at this level
  // Client-side redirects will handle specific onboarding steps

  // Handle dashboard paths - only super users should directly access these
  if (path.startsWith('/dashboard') && path !== '/dashboard/login') {
    // Check for a session cookie or token (simplified)
    const authCookie = request.cookies.get('next-auth.session-token') ||
                       request.cookies.get('__Secure-next-auth.session-token');

    if (!authCookie) {
      // Redirect to dashboard login instead of redirecting students here
      return NextResponse.redirect(new URL('/dashboard/login', request.url));
    }
  }

  // Pass through all other requests
  return NextResponse.next();
}

// Apply the middleware to these paths
export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/dashboard/:path*',
    '/onboarding',
    '/onboarding/:path*',
    '/daksh',
    '/daksh/:path*',
  ],
};