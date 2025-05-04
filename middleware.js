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

  // Check if this appears to be right after a logout (empty cookie values but cookie exists)
  const isLogoutState = (onboardedCookie && onboardedCookie.value === '') ||
                        (loginCompletedCookie && loginCompletedCookie.value === '');

  // If we detect a logout state, let the request through to /onboarding/login without redirect
  if (isLogoutState && path.startsWith('/onboarding/login')) {
    console.log('[Middleware] Detected logout state, allowing access to login page');
    return NextResponse.next();
  }

  // Create a response that we can modify
  const response = NextResponse.next();

  // Add debug headers to help troubleshoot
  const debugInfo = `path=${path}, onboarded=${onboardedCookie?.value || 'missing'}, loginCompleted=${loginCompletedCookie?.value || 'missing'}, redirectCount=${redirectCount}`;
  response.headers.set('x-middleware-debug', debugInfo);
  console.log(`[Middleware] ${debugInfo}`);

  // PRIORITY 1: Check most frequently used paths first for quick resolution

  // Handle direct access to / - root path
  if (path === '/') {
    // If user is logged in, redirect straight to personalized URL if possible
    if (hasLoginCompleted) {
      // Try to get student data from cookies
      const studentDataCookie = request.cookies.get('studentData');
      if (studentDataCookie) {
        try {
          const studentData = JSON.parse(decodeURIComponent(studentDataCookie.value));
          if (studentData.schoolId && studentData.classId && studentData.id) {
            console.log('[Middleware] Redirecting / directly to personalized URL');
            const personalizedUrl = `/daksh/${studentData.schoolId}/${studentData.classId}/${studentData.id}`;
            const redirectResponse = NextResponse.redirect(new URL(personalizedUrl, request.url));
            redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
            return redirectResponse;
          }
        } catch (e) {
          console.warn('[Middleware] Failed to parse student data cookie in root path:', e);
        }
      }

      // Fallback to /daksh if we can't determine personalized URL
      console.log('[Middleware] Redirecting / to /daksh (logged in)');
      const redirectResponse = NextResponse.redirect(new URL('/daksh', request.url));
      redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return redirectResponse;
    } else {
      // Not logged in, go to onboarding
      console.log('[Middleware] Redirecting / to /onboarding (not logged in)');
      const redirectResponse = NextResponse.redirect(new URL('/onboarding', request.url));
      redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return redirectResponse;
    }
  }

  // PRIORITY 2: Handle /daksh path quickly - most common path needing optimization
  // Handle direct access to /daksh
  if (path === '/daksh') {
    // Not logged in - redirect to onboarding immediately
    if (!hasLoginCompleted) {
      console.log('[Middleware] Redirecting /daksh to /onboarding (not logged in)');
      const redirectResponse = NextResponse.redirect(new URL('/onboarding', request.url));
      redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return redirectResponse;
    }

    // Logged in - try to redirect to personalized URL directly from middleware
    const studentDataCookie = request.cookies.get('studentData');
    if (studentDataCookie) {
      try {
        const studentData = JSON.parse(decodeURIComponent(studentDataCookie.value));
        if (studentData.schoolId && studentData.classId && studentData.id) {
          console.log('[Middleware] Redirecting /daksh directly to personalized URL');
          const personalizedUrl = `/daksh/${studentData.schoolId}/${studentData.classId}/${studentData.id}`;
          const redirectResponse = NextResponse.redirect(new URL(personalizedUrl, request.url));
          redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
          return redirectResponse;
        }
      } catch (e) {
        console.warn('[Middleware] Failed to parse student data cookie:', e);
      }
    }

    // Allow access to generic dashboard for client-side redirection if needed
    console.log('[Middleware] Allowing access to generic /daksh (will handle redirection client-side)');
    return response;
  }

  // PRIORITY 3: Handle personalized paths
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
      // Redirect to login if directly accessing personalized URL without being logged in
      console.log('[Middleware] Redirecting unauthorized personalized path to login');
      const redirectResponse = NextResponse.redirect(new URL('/onboarding/login', request.url));
      redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return redirectResponse;
    }
  }

  // PRIORITY 4: Handle onboarding paths
  // Skip onboarding for already onboarded users - redirect them to personalized dashboard if possible
  if (hasLoginCompleted && (path === '/onboarding' || path === '/onboarding/login' || path === '/onboarding/questions')) {
    // Try to get student data from cookies
    const studentDataCookie = request.cookies.get('studentData');
    if (studentDataCookie) {
      try {
        const studentData = JSON.parse(decodeURIComponent(studentDataCookie.value));
        if (studentData.schoolId && studentData.classId && studentData.id) {
          console.log('[Middleware] Redirecting onboarding path directly to personalized URL');
          const personalizedUrl = `/daksh/${studentData.schoolId}/${studentData.classId}/${studentData.id}`;
          const redirectResponse = NextResponse.redirect(new URL(personalizedUrl, request.url));
          redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
          return redirectResponse;
        }
      } catch (e) {
        console.warn('[Middleware] Failed to parse student data cookie in onboarding path:', e);
      }
    }

    // Fallback to generic dashboard
    console.log('[Middleware] Redirecting /onboarding* to /daksh (already onboarded)');
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

  // PRIORITY 5: Handle other daksh routes
  // Catch-all for other /daksh routes - redirect to onboarding if not logged in
  if (path.startsWith('/daksh') && !hasLoginCompleted) {
    console.log('[Middleware] Redirecting /daksh/* to /onboarding (not logged in)');
    const redirectResponse = NextResponse.redirect(new URL('/onboarding', request.url));
    redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
    return redirectResponse;
  }

  // PRIORITY 6: Admin dashboard protection
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