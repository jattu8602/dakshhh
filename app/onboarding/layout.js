'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useStudent } from '../lib/studentContext';
import { setCookie } from 'cookies-next';

export default function OnboardingLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, onboardingComplete, currentOnboardingStep, student } = useStudent();
  const [mounted, setMounted] = useState(false);
  const params = useParams();

  useEffect(() => {
    setMounted(true);

    // Only do checks after component is mounted and loading is complete
    if (mounted && !loading) {
      // If user is fully onboarded and authenticated, set cookies and redirect to daksh
      if (onboardingComplete && isAuthenticated && student) {
        // Set both cookies with consistent settings before redirecting
        document.cookie = `onboarded=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
        document.cookie = `loginCompleted=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;

        // Also use the library method for redundancy
        setCookie('onboarded', 'true', {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
          sameSite: 'lax',
          httpOnly: false
        });

        setCookie('loginCompleted', 'true', {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
          sameSite: 'lax',
          httpOnly: false
        });

        // Set localStorage as well
        localStorage.setItem('onboarded', 'true');
        localStorage.setItem('loginCompleted', 'true');

        // Construct personalized dashboard URL
        const dashboardUrl = student.schoolId ?
          `/daksh/${student.schoolId}/${student.classId}/${student.id}?t=${Date.now()}` :
          `/daksh?t=${Date.now()}`;

        // Redirect with timestamp parameter
        router.push(dashboardUrl);
        return;
      }

      // Handle specific pages based on authentication state
      if (pathname.startsWith('/onboarding/questions')) {
        // For questions page, user must be authenticated
        if (!isAuthenticated) {
          router.push('/onboarding/login');
          return;
        }
      }

      // If user is at login page but authenticated and has a next step, redirect to that step
      if (pathname === '/onboarding/login' && isAuthenticated && student) {
        if (currentOnboardingStep === 'questions') {
          // Set loginCompleted cookie before redirecting
          document.cookie = `loginCompleted=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
          setCookie('loginCompleted', 'true', {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            httpOnly: false
          });

          // Redirect to personalized questions URL
          const questionUrl = student.schoolId ?
            `/onboarding/questions/${student.schoolId}/${student.classId}/${student.id}` :
            '/onboarding/questions';

          router.push(questionUrl);
          return;
        } else if (onboardingComplete) {
          // Set both cookies before redirecting to dashboard
          document.cookie = `onboarded=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
          document.cookie = `loginCompleted=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;

          setCookie('onboarded', 'true', {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            httpOnly: false
          });

          setCookie('loginCompleted', 'true', {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            httpOnly: false
          });

          // Construct personalized dashboard URL
          const dashboardUrl = student.schoolId ?
            `/daksh/${student.schoolId}/${student.classId}/${student.id}?t=${Date.now()}` :
            `/daksh?t=${Date.now()}`;

          router.push(dashboardUrl);
          return;
        }
      }
    }
  }, [router, isAuthenticated, pathname, mounted, loading, onboardingComplete, currentOnboardingStep, student]);

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}