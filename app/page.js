'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already onboarded
    const isOnboarded = localStorage?.getItem('onboarded');

    if (isOnboarded === 'true') {
      // Set a cookie for middleware to use
      setCookie('onboarded', 'true', {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });

      // Always redirect students to daksh dashboard, never to /dashboard
      router.push('/daksh');
    } else {
      // Clear the cookie if not onboarded
      setCookie('onboarded', '', {
        maxAge: 0,
        path: '/'
      });

      // If not onboarded, redirect to onboarding
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
