import { NextResponse } from 'next/server';

// Middleware to handle client-side redirects for onboarding flow
export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Get the onboarded cookie to check user state
  const onboardedCookie = request.cookies.get('onboarded');
  const isFullyOnboarded = onboardedCookie?.value === 'true';

  // Root path redirects
  if (path === '/') {
    if (isFullyOnboarded) {
      // If fully onboarded, redirect to daksh dashboard
      return NextResponse.redirect(new URL('/daksh', request.url));
    } else {
      // If not fully onboarded, redirect to onboarding start
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Handle daksh routes - protected for fully onboarded users only
  if (path.startsWith('/daksh')) {
    if (!isFullyOnboarded) {
      // Only allow access to daksh if properly onboarded
      // Check if user is in the middle of onboarding
      const hasLoginCookie = request.cookies.get('loginCompleted')?.value === 'true';

      if (hasLoginCookie) {
        // If logged in but not fully onboarded, send to questions
        return NextResponse.redirect(new URL('/onboarding/questions', request.url));
      } else {
        // If not logged in at all, start from beginning
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  // Handle onboarding routes - skip for fully onboarded users
  if (path.startsWith('/onboarding')) {
    // Skip login/questions for fully onboarded users and send directly to dashboard
    if (isFullyOnboarded && (path === '/onboarding' || path === '/onboarding/login' || path === '/onboarding/questions')) {
      return NextResponse.redirect(new URL('/daksh', request.url));
    }

    // Special handling for questions page - require login
    if (path === '/onboarding/questions') {
      const loginCompleted = request.cookies.get('loginCompleted')?.value === 'true';
      if (!loginCompleted) {
        return NextResponse.redirect(new URL('/onboarding/login', request.url));
      }
    }
  }

  // Handle dashboard admin paths - only super users should directly access these
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