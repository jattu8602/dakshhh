'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '../lib/studentContext';
import { setCookie } from 'cookies-next';

export default function DakshLayout({ children }) {
  const router = useRouter();
  const { student, isAuthenticated, loading, currentOnboardingStep, onboardingComplete } = useStudent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run this check when component is mounted and not loading
    if (mounted && !loading) {
      // If not authenticated at all, go back to onboarding start
      if (!isAuthenticated) {
        router.push('/onboarding');
        return;
      }

      // If authenticated but not completed onboarding (has current step), redirect to that step
      if (!onboardingComplete && currentOnboardingStep === 'questions') {
        router.push('/onboarding/questions');
        return;
      }

      // If authenticated but no preferences, they need to complete questions
      if (isAuthenticated && student && !student.preferences) {
        router.push('/onboarding/questions');
        return;
      }
    }
  }, [router, mounted, loading, isAuthenticated, student, currentOnboardingStep, onboardingComplete]);

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or onboarding not complete
  if (!isAuthenticated || !onboardingComplete) {
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