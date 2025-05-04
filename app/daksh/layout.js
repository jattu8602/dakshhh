'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStudent } from '../lib/studentContext';
import { setCookie } from 'cookies-next';

export default function DakshLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { student, isAuthenticated, loading, currentOnboardingStep, onboardingComplete } = useStudent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run this check when component is mounted and not loading
    if (mounted && !loading) {
      // IMPORTANT: If this is a personalized URL (contains 3 IDs), don't redirect
      // Match for URLs like /daksh/[schoolId]/[classId]/[studentId]
      const isPersonalizedPath = /^\/daksh\/[\w-]+\/[\w-]+\/[\w-]+/.test(pathname);

      // If URL is personalized, let it continue rendering without redirecting
      if (isPersonalizedPath) {
        // Set cookies to ensure we don't get redirected out by middleware
        document.cookie = `loginCompleted=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
        document.cookie = `onboarded=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;

        // Also set localStorage for redundancy
        localStorage.setItem('loginCompleted', 'true');
        localStorage.setItem('onboarded', 'true');

        // Check for query param that indicates direct access
        const urlParams = new URLSearchParams(window.location.search);
        const isForced = urlParams.get('forcedRedirect');

        if (isForced) {
          console.log('Layout detected forced redirect, clearing URL params');
          // Clean up URL by removing query params
          window.history.replaceState({}, document.title, pathname);
        }

        return;
      }

      // For other /daksh routes, apply regular checks

      // If not authenticated at all, go back to onboarding start
      if (!isAuthenticated) {
        router.push('/onboarding');
        return;
      }

      // If authenticated but not completed onboarding (has current step), redirect to that step
      if (!onboardingComplete && currentOnboardingStep === 'questions') {
        // If student has all required IDs, use personalized URL
        if (student && student.schoolId && student.classId && student.id) {
          router.push(`/onboarding/questions/${student.schoolId}/${student.classId}/${student.id}`);
        } else {
          router.push('/onboarding/questions');
        }
        return;
      }

      // If authenticated but no preferences, they need to complete questions
      if (isAuthenticated && student && !student.preferences) {
        // If student has all required IDs, use personalized URL
        if (student.schoolId && student.classId && student.id) {
          router.push(`/onboarding/questions/${student.schoolId}/${student.classId}/${student.id}`);
        } else {
          router.push('/onboarding/questions');
        }
        return;
      }

      // If we're in /daksh but should be in a personalized URL, redirect to it
      if (pathname === '/daksh' && student && student.schoolId && student.classId && student.id) {
        router.push(`/daksh/${student.schoolId}/${student.classId}/${student.id}`);
        return;
      }
    }
  }, [router, pathname, mounted, loading, isAuthenticated, student, currentOnboardingStep, onboardingComplete]);

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // IMPORTANT CHANGE: For personalized paths, skip authentication check
  const isPersonalizedPath = /^\/daksh\/[\w-]+\/[\w-]+\/[\w-]+/.test(pathname);

  // Don't render children if not personalized and (not authenticated or onboarding not complete)
  if (!isPersonalizedPath && (!isAuthenticated || !onboardingComplete)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}