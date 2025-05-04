'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStudent } from '../../lib/studentContext';

export default function QuestionsLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { student, isAuthenticated, loading, onboardingComplete } = useStudent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run this check when component is mounted and not loading
    if (mounted && !loading) {
      // If this is a personalized URL, don't redirect away from it
      // Match for URLs like /onboarding/questions/[schoolId]/[classId]/[studentId]
      const isPersonalizedPath = /^\/onboarding\/questions\/[\w-]+\/[\w-]+\/[\w-]+/.test(pathname);

      // For personalized URLs, make sure cookies are set correctly
      if (isPersonalizedPath) {
        // Set loginCompleted cookie to ensure we stay on this page
        document.cookie = `loginCompleted=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
        return;
      }

      // For regular /onboarding/questions route, apply standard checks

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/onboarding/login');
        return;
      }

      // If already completed onboarding, redirect to dashboard
      if (isAuthenticated && onboardingComplete && student) {
        // If student has personalized info, redirect to personalized URL
        if (student.schoolId && student.classId && student.id) {
          router.push(`/daksh/${student.schoolId}/${student.classId}/${student.id}`);
        } else {
          router.push('/daksh');
        }
        return;
      }
    }
  }, [router, pathname, mounted, loading, isAuthenticated, student, onboardingComplete]);

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // For personalized paths, skip authentication check
  const isPersonalizedPath = /^\/onboarding\/questions\/[\w-]+\/[\w-]+\/[\w-]+/.test(pathname);

  // Only check authentication for non-personalized paths
  if (!isPersonalizedPath && !isAuthenticated) {
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