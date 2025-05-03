'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStudent } from '../lib/studentContext';
import { setCookie } from 'cookies-next';

export default function OnboardingLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, onboardingComplete, currentOnboardingStep } = useStudent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only do checks after component is mounted and loading is complete
    if (mounted && !loading) {
      // If user is fully onboarded and authenticated, redirect to daksh
      if (onboardingComplete && isAuthenticated) {
        router.push('/daksh');
        return;
      }

      // Handle specific pages based on authentication state
      if (pathname === '/onboarding/questions') {
        // For questions page, user must be authenticated
        if (!isAuthenticated) {
          router.push('/onboarding/login');
          return;
        }
      }

      // If user is at login page but authenticated and has a next step, redirect to that step
      if (pathname === '/onboarding/login' && isAuthenticated) {
        if (currentOnboardingStep === 'questions') {
          router.push('/onboarding/questions');
          return;
        } else if (onboardingComplete) {
          router.push('/daksh');
          return;
        }
      }
    }
  }, [router, isAuthenticated, pathname, mounted, loading, onboardingComplete, currentOnboardingStep]);

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