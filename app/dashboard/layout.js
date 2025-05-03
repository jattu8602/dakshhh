'use client';

import { useAuth } from '../lib/authContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Layout({ children }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/dashboard/login') {
      router.push('/dashboard/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  // Don't apply layout to login page
  if (pathname === '/dashboard/login') {
    return children;
  }

  // If we're not loading and user is not authenticated, render nothing
  // (redirect will happen from useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render dashboard layout
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation header */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard" className="text-lg font-bold text-indigo-600">
                  School Management
                </Link>
              </div>
              <div className="ml-6 flex items-center space-x-4">
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-900">
                  Dashboard
                </Link>
                <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {user?.name || user?.email || 'Super Admin'}
                </span>
                <button
                  onClick={() => {
                    logout();
                    router.push('/dashboard/login');
                  }}
                  className="ml-4 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}