import { NextResponse } from 'next/server';

// Middleware to handle client-side redirects for onboarding flow
export function middleware(request) {
  const path = request.nextUrl.pathname;
  const url = request.url;

  // ENHANCED REDIRECT LOOP DETECTION
  // Track redirect count in headers and check for excessive redirects
  const redirectCount = parseInt(request.headers.get('x-redirect-count') || '0', 10);
  if (redirectCount > 2) {
    console.warn("Redirect loop detected! Stopping middleware chain and allowing current path:", path);
    // If we detect a loop, return the current page without any redirects
    return NextResponse.next();
  }

  // Get cookies for authentication state checking
  const onboardedCookie = request.cookies.get('onboarded');
  const loginCompletedCookie = request.cookies.get('loginCompleted');

  // Check cookie values more permissively - accept any truthy value
  const isFullyOnboarded = onboardedCookie?.value === 'true' || onboardedCookie?.value === '1';
  const hasLoginCompleted = loginCompletedCookie?.value === 'true' || loginCompletedCookie?.value === '1';

  // Create a response that we can modify
  const response = NextResponse.next();

  // Add debug headers to help troubleshoot
  const debugInfo = `path=${path}, onboarded=${onboardedCookie?.value || 'missing'}, loginCompleted=${loginCompletedCookie?.value || 'missing'}, redirectCount=${redirectCount}`;
  response.headers.set('x-middleware-debug', debugInfo);
  console.log(`[Middleware] ${debugInfo}`);

  // HIGHEST PRIORITY: Check for personalized paths first
  // Format: /daksh/[schoolId]/[classId]/[studentId]
  const isPersonalizedDashboardPath = /^\/daksh\/[\w-]+\/[\w-]+\/[\w-]+/.test(path);

  // If on a personalized path, allow access or redirect to login if needed
  if (isPersonalizedDashboardPath) {
    // If they have login cookie, always allow access to personalized dashboard
    if (hasLoginCompleted) {
      console.log('[Middleware] Allowing personalized dashboard access:', path);

      // If not marked as onboarded, set that cookie too for consistency
      if (!isFullyOnboarded) {
        console.log('[Middleware] Setting onboarded cookie for personalized dashboard path');
        const enhancedResponse = NextResponse.next();
        enhancedResponse.cookies.set('onboarded', 'true', {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
          sameSite: 'lax'
        });
        enhancedResponse.cookies.set('loginCompleted', 'true', {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
          sameSite: 'lax'
        });
        return enhancedResponse;
      }

      return response;
    } else {
      // Allow access to personalized dashboard even without login cookie
      // This is important for direct URL access cases
      console.log('[Middleware] Allowing access to personalized dashboard without login cookie');
      const enhancedResponse = NextResponse.next();

      // Set both cookies for full access
      enhancedResponse.cookies.set('onboarded', 'true', {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax'
      });
      enhancedResponse.cookies.set('loginCompleted', 'true', {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax'
      });

      return enhancedResponse;
    }
  }

  // Format: /onboarding/questions/[schoolId]/[classId]/[studentId]
  const isPersonalizedQuestionsPath = /^\/onboarding\/questions\/[\w-]+\/[\w-]+\/[\w-]+/.test(path);

  // If on a personalized questions path, allow access or redirect to login if needed
  if (isPersonalizedQuestionsPath) {
    if (hasLoginCompleted) {
      console.log('[Middleware] Allowing personalized questions access:', path);
      return response;
    } else {
      console.log('[Middleware] Redirecting personalized questions to /onboarding/login (not logged in)');
      const redirectResponse = NextResponse.redirect(new URL('/onboarding/login', request.url));
      redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return redirectResponse;
    }
  }

  // CRITICAL: Allow /daksh access if login cookie exists
  // This is the most important rule to prevent redirect loops
  if (path.startsWith('/daksh') && hasLoginCompleted) {
    console.log('[Middleware] Allowing /daksh access due to login cookie presence');
    return response;
  }

  // SIMPLIFIED REDIRECT LOGIC
  // Root path handling
  if (path === '/') {
    const redirectUrl = isFullyOnboarded ? '/daksh' : '/onboarding';
    console.log(`[Middleware] Redirecting / to ${redirectUrl}`);
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url));
    redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
    return redirectResponse;
  }

  // Protect /daksh routes - redirect to onboarding if not logged in
  if (path.startsWith('/daksh') && !hasLoginCompleted) {
    console.log('[Middleware] Redirecting /daksh to /onboarding (not logged in)');
    const redirectResponse = NextResponse.redirect(new URL('/onboarding', request.url));
    redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
    return redirectResponse;
  }

  // Skip onboarding for already onboarded users - DON'T redirect from personalized routes
  if (isFullyOnboarded && (path === '/onboarding' || path === '/onboarding/login' || path === '/onboarding/questions')) {
    console.log('[Middleware] Redirecting /onboarding* to /daksh (fully onboarded)');
    const redirectResponse = NextResponse.redirect(new URL('/daksh', request.url));
    redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
    return redirectResponse;
  }

  // Protect questions page - require login
  if (path === '/onboarding/questions' && !hasLoginCompleted) {
    console.log('[Middleware] Redirecting /onboarding/questions to /onboarding/login (not logged in)');
    const redirectResponse = NextResponse.redirect(new URL('/onboarding/login', request.url));
    redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
    return redirectResponse;
  }

  // Dashboard admin protection
  if (path.startsWith('/dashboard') && path !== '/dashboard/login') {
    const authCookie = request.cookies.get('next-auth.session-token') ||
                       request.cookies.get('__Secure-next-auth.session-token');

    if (!authCookie) {
      console.log('[Middleware] Redirecting /dashboard* to /dashboard/login (missing auth)');
      const redirectResponse = NextResponse.redirect(new URL('/dashboard/login', request.url));
      redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return redirectResponse;
    }
  }

  // Pass through all other requests
  console.log('[Middleware] Allowing path with no redirect rules:', path);
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