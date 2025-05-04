import { NextResponse } from 'next/server';

// Middleware to handle client-side redirects for onboarding flow
export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Get the onboarded cookie to check user state
  const onboardedCookie = request.cookies.get('onboarded');
  const loginCompletedCookie = request.cookies.get('loginCompleted');

  const isFullyOnboarded = onboardedCookie?.value === 'true';
  const hasLoginCompleted = loginCompletedCookie?.value === 'true';

  // Debug cookie information - add a custom header that we can inspect
  const response = NextResponse.next();

  response.headers.set('x-middleware-debug',
    `path=${path}, onboarded=${onboardedCookie?.value || 'missing'}, loginCompleted=${loginCompletedCookie?.value || 'missing'}`
  );

  // Root path redirects
  if (path === '/') {
    if (isFullyOnboarded) {
      // If fully onboarded, redirect to daksh dashboard
      const redirectUrl = new URL('/daksh', request.url);
      return NextResponse.redirect(redirectUrl);
    } else {
      // If not fully onboarded, redirect to onboarding start
      const redirectUrl = new URL('/onboarding', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Handle daksh routes - protected for fully onboarded users only
  if (path.startsWith('/daksh')) {
    // Special case: Allow /daksh with login cookie even if not fully onboarded
    // This helps when middleware hasn't yet detected updated cookie state
    if (hasLoginCompleted) {
      // Let them access daksh even if onboarded cookie isn't set yet
      // This might be a temporary state after login but before preferences are set
      return response;
    }

    if (!isFullyOnboarded) {
      // Only allow access to daksh if properly onboarded
      // Check if user is in the middle of onboarding
      if (hasLoginCompleted) {
        // If logged in but not fully onboarded, send to questions
        const redirectUrl = new URL('/onboarding/questions', request.url);
        return NextResponse.redirect(redirectUrl);
      } else {
        // If not logged in at all, start from beginning
        const redirectUrl = new URL('/onboarding', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // Handle onboarding routes - skip for fully onboarded users
  if (path.startsWith('/onboarding')) {
    // Skip login/questions for fully onboarded users and send directly to dashboard
    if (isFullyOnboarded && (path === '/onboarding' || path === '/onboarding/login' || path === '/onboarding/questions')) {
      const redirectUrl = new URL('/daksh', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Special handling for questions page - require login
    if (path === '/onboarding/questions') {
      if (!hasLoginCompleted) {
        const redirectUrl = new URL('/onboarding/login', request.url);
        return NextResponse.redirect(redirectUrl);
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
      const redirectUrl = new URL('/dashboard/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Pass through all other requests
  return response;
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