'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useStudent } from '../lib/studentContext';
import InstallPWA from '../components/InstallPWA';
import toast from 'react-hot-toast';

export default function DakshHomePage() {
  const router = useRouter();
  const { student, isAuthenticated, loading: studentLoading, logout, onboardingComplete } = useStudent();
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/onboarding');
  };

  // Mock courses data
  const courses = [
    {
      id: 'course1',
      title: 'Memory Enhancement',
      level: 'Beginner',
      progress: 30,
      image: '/images/memory.png'
    },
    {
      id: 'course2',
      title: 'Problem Solving',
      level: 'Intermediate',
      progress: 45,
      image: '/images/problem.png'
    },
    {
      id: 'course3',
      title: 'Critical Thinking',
      level: 'Beginner',
      progress: 10,
      image: '/images/critical.png'
    }
  ];

  // Add redirect loop detection and fixing code
  useEffect(() => {
    // Check for force redirect or if we came from middleware
    const forcedRedirect = searchParams.get('forcedRedirect') === 'true';
    const timestamp = searchParams.get('t');

    // Check cookies to ensure they're set properly for this page
    const hasLoginCookie = document.cookie.includes('loginCompleted=true');
    const hasOnboardedCookie = document.cookie.includes('onboarded=true');

    // If we're missing required cookies, set them now
    if (!hasLoginCookie || !hasOnboardedCookie) {
      console.log('Dashboard: Fixing missing cookies to prevent redirect loops');

      // Force set the cookies needed for dashboard access
      document.cookie = `loginCompleted=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
      document.cookie = `onboarded=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;

      // Also set localStorage for redundancy
      localStorage.setItem('loginCompleted', 'true');
      localStorage.setItem('onboarded', 'true');
    }

    // Clean URL if we have timestamp or force parameters (optional)
    if (timestamp || forcedRedirect) {
      const url = new URL(window.location.href);
      url.searchParams.delete('t');
      url.searchParams.delete('forcedRedirect');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams]);

  useEffect(() => {
    // Only proceed when studentLoading is complete
    if (!studentLoading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast.error('Please log in to access your dashboard');
        router.push('/onboarding/login');
        return;
      }

      // Check if student has completed onboarding
      if (isAuthenticated && !onboardingComplete) {
        toast.info('Please complete your onboarding first');
        router.push('/onboarding/questions');
        return;
      }

      // If we have student details, redirect to personalized URL
      if (student && student.schoolId && student.classId && student.id) {
        console.log('Redirecting from generic /daksh to personalized dashboard URL');

        // Store minimal student data in cookie for middleware optimization
        const minimalStudentData = {
          id: student.id,
          schoolId: student.schoolId,
          classId: student.classId
        };

        // Set cookie with student data
        document.cookie = `studentData=${encodeURIComponent(JSON.stringify(minimalStudentData))};path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;

        // Redirect to personalized URL
        router.push(`/daksh/${student.schoolId}/${student.classId}/${student.id}`);
        return;
      }

      setLoading(false);
    }
  }, [router, student, isAuthenticated, studentLoading, onboardingComplete]);

  if (loading || !student) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Determine student level based on preferences
  const studentLevel = student.preferences?.level === 'starting' ? 'Beginner' :
    student.preferences?.level === 'basics' ? 'Intermediate' :
    student.preferences?.level === 'lot' ? 'Advanced' :
    student.preferences?.level === 'samurai' ? 'Expert' : 'Beginner';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Daksh</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="font-medium">450</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path>
                </svg>
                <span className="font-medium">5 days</span>
              </div>
              <button
                onClick={handleLogout}
                className="h-8 px-3 rounded-md bg-red-100 text-red-600 flex items-center justify-center font-medium text-sm hover:bg-red-200"
              >
                Logout
              </button>
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
                {student.name ? student.name.charAt(0) : 'S'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-1">Welcome back, {student.name || 'Student'}!</h2>
          <p className="text-gray-600 mb-4">Continue your learning journey where you left off.</p>
          <div className="mt-4 flex space-x-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium">
              Continue Learning
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium">
              Take a Test
            </button>
          </div>
        </div>

        {/* Your courses - filtered based on preferences */}
        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {course.image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-2">Level: {course.level}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{course.progress}% complete</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recommended based on preferences */}
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended for You</h2>
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium text-gray-900">
                {student.preferences?.improvement === 'memory' ? 'Advanced Memory Techniques' :
                 student.preferences?.improvement === 'attention' ? 'Focus and Attention Training' :
                 student.preferences?.improvement === 'maths' ? 'Mathematical Thinking' :
                 student.preferences?.improvement === 'problem' ? 'Advanced Problem Solving' :
                 'Advanced Thinking Skills'}
              </h3>
              <p className="text-sm text-gray-500">Based on your preference for {
                student.preferences?.improvement === 'memory' ? 'Memory Enhancement' :
                student.preferences?.improvement === 'attention' ? 'Attention Training' :
                student.preferences?.improvement === 'maths' ? 'Mental Mathematics' :
                student.preferences?.improvement === 'problem' ? 'Problem Solving' :
                'Learning'
              }</p>
            </div>
            <button className="ml-4 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-sm font-medium">
              Start
            </button>
          </div>
        </div>
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around py-3">
        <button className="flex flex-col items-center justify-center w-20 text-indigo-600">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
          </svg>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center w-20 text-gray-500">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
          </svg>
          <span className="text-xs mt-1">Courses</span>
        </button>
        <button className="flex flex-col items-center justify-center w-20 text-gray-500">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
          </svg>
          <span className="text-xs mt-1">Help</span>
        </button>
        <button className="flex flex-col items-center justify-center w-20 text-gray-500">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>

      {/* Install PWA Button */}
      <InstallPWA />
    </div>
  );
}