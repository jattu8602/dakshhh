'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already onboarded
    const isOnboarded = localStorage?.getItem('onboarded');
    const isLoggedIn = localStorage?.getItem('loginCompleted') === 'true';

    if (isOnboarded === 'true') {
      // Set a cookie for middleware to use
      setCookie('onboarded', 'true', {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'lax'
      });

      // Also ensure login cookie is set
      if (isLoggedIn) {
        setCookie('loginCompleted', 'true', {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
          sameSite: 'lax'
        });
      }

      // Try to read student data from cookie for direct personalized URL redirect
      try {
        const studentDataCookieMatch = document.cookie.match(/studentData=([^;]+)/);
        if (studentDataCookieMatch) {
          const studentData = JSON.parse(decodeURIComponent(studentDataCookieMatch[1]));
          if (studentData && studentData.schoolId && studentData.classId && studentData.id) {
            console.log('[Root] Found student data in cookie, redirecting to personalized URL');
            router.push(`/daksh/${studentData.schoolId}/${studentData.classId}/${studentData.id}`);
            return;
          }
        }
      } catch (e) {
        console.warn('[Root] Failed to parse student data cookie:', e);
      }

      // Fallback to generic daksh dashboard if no personalized URL available
      console.log('[Root] Redirecting to generic /daksh (onboarded)');
      router.push('/onboarding/login');
    } else {
      // Clear cookies if not onboarded
      setCookie('onboarded', '', {
        maxAge: 0,
        path: '/'
      });

      setCookie('loginCompleted', '', {
        maxAge: 0,
        path: '/'
      });

      // If not onboarded, redirect to onboarding
      console.log('[Root] Redirecting to /onboarding (not onboarded)');
      router.push('/onboarding');
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-100 to-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-900">School Management</h1>
        <p className="mt-2 text-lg text-gray-600">Redirecting you to the right place...</p>

        <div className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    </main>
  );
}
