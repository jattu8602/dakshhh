'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStudent } from '../../../../../lib/studentContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { getStudentData, loading: studentLoading, logout } = useStudent();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle logout
  const handleLogout = () => {
    // First logout from context
    logout();

    // Ensure cookies are cleared from the document as well for immediate effect
    document.cookie = 'loginCompleted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'onboarded=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'studentData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Then redirect to login page
    router.push('/onboarding/login');
  };

  // Handle navigation back to dashboard
  const handleBackToDashboard = () => {
    router.push(`/daksh/${params.schoolId}/${params.classId}/${params.studentId}`);
  };

  // Handle cookie verification on page load
  useEffect(() => {
    // Check cookies to ensure they're set properly for this page
    const hasLoginCookie = document.cookie.includes('loginCompleted=true');
    const hasOnboardedCookie = document.cookie.includes('onboarded=true');

    // If we're missing required cookies, set them now
    if (!hasLoginCookie || !hasOnboardedCookie) {
      console.log('Profile: Fixing missing cookies to prevent redirect loops');

      // Force set the cookies needed for dashboard access
      document.cookie = `loginCompleted=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
      document.cookie = `onboarded=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;

      // Also set localStorage for redundancy
      localStorage.setItem('loginCompleted', 'true');
      localStorage.setItem('onboarded', 'true');
    }
  }, []);

  // Fetch student data using the efficient context method
  useEffect(() => {
    async function loadStudentData() {
      if (params.schoolId && params.classId && params.studentId) {
        try {
          const studentData = await getStudentData(
            params.schoolId,
            params.classId,
            params.studentId
          );

          if (studentData) {
            setStudent(studentData);
          } else {
            // If student not found, redirect to login
            toast.error('Student data not found');
            router.push('/onboarding/login');
          }
        } catch (error) {
          console.error('Error loading student data:', error);
          toast.error('Failed to load your profile');
        } finally {
          setLoading(false);
        }
      } else {
        // Missing parameters, redirect to login
        router.push('/onboarding/login');
      }
    }

    if (!studentLoading) {
      loadStudentData();
    }
  }, [params, getStudentData, studentLoading, router]);

  if (loading || !student) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Student Profile
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <div className="h-24 w-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-4xl font-medium mb-4 sm:mb-0 sm:mr-6">
              {student.name ? student.name.charAt(0) : 'S'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center sm:text-left">
                {student.name || 'Student'}
              </h2>
              <p className="text-gray-600 mb-1 text-center sm:text-left">
                {student.rollNumber ? `Roll Number: ${student.rollNumber}` : ''}
              </p>
              <p className="text-gray-600 mb-1 text-center sm:text-left">
                {student.className ? `Class: ${student.className}` : ''}
              </p>
              <p className="text-gray-600 mb-4 text-center sm:text-left">
                {student.schoolName ? `School: ${student.schoolName}` : ''}
              </p>
              <div className="flex space-x-2 justify-center sm:justify-start">
                <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  <span className="font-medium">
                    {student.preferences?.level === 'starting' ? 'Beginner' :
                     student.preferences?.level === 'basics' ? 'Intermediate' :
                     student.preferences?.level === 'lot' ? 'Advanced' :
                     student.preferences?.level === 'samurai' ? 'Expert' : 'Beginner'}
                  </span>
                </div>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <span className="font-medium">{student.points || 0} Points</span>
                </div>
                <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  <span className="font-medium">{student.streak || 0} Day Streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Skill Level</h4>
              <p className="text-gray-600">
                {student.preferences?.level === 'starting' ? 'Beginner - Just starting out' :
                 student.preferences?.level === 'basics' ? 'Intermediate - Know the basics' :
                 student.preferences?.level === 'lot' ? 'Advanced - Know a lot already' :
                 student.preferences?.level === 'samurai' ? 'Expert - Nearly a samurai' : 'Not specified'}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Focus Area</h4>
              <p className="text-gray-600">
                {student.preferences?.improvement === 'memory' ? 'Memory Enhancement' :
                 student.preferences?.improvement === 'attention' ? 'Attention Training' :
                 student.preferences?.improvement === 'maths' ? 'Mental Mathematics' :
                 student.preferences?.improvement === 'problem' ? 'Problem Solving' : 'All Skills'}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Learning Style</h4>
              <p className="text-gray-600">
                {student.preferences?.style === 'visual' ? 'Visual Learner' :
                 student.preferences?.style === 'auditory' ? 'Auditory Learner' :
                 student.preferences?.style === 'reading' ? 'Reading/Writing Learner' :
                 student.preferences?.style === 'kinesthetic' ? 'Kinesthetic Learner' : 'Balanced Learning Style'}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Practice Frequency</h4>
              <p className="text-gray-600">
                {student.preferences?.frequency === 'daily' ? 'Daily Practice' :
                 student.preferences?.frequency === 'few' ? 'Few times a week' :
                 student.preferences?.frequency === 'weekends' ? 'Weekends Only' :
                 student.preferences?.frequency === 'occasional' ? 'Occasional Practice' : 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <button className="w-full flex justify-between items-center px-4 py-3 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span>Edit Profile</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full flex justify-between items-center px-4 py-3 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span>Notification Settings</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full flex justify-between items-center px-4 py-3 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span>Change Password</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex justify-between items-center px-4 py-3 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span>Logout</span>
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around py-3">
        <button
          onClick={handleBackToDashboard}
          className="flex flex-col items-center justify-center w-20 text-gray-500"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
          </svg>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          onClick={() => router.push(`/daksh/${params.schoolId}/${params.classId}/${params.studentId}/courses`)}
          className="flex flex-col items-center justify-center w-20 text-gray-500"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
          </svg>
          <span className="text-xs mt-1">Courses</span>
        </button>
        <button
          onClick={() => router.push(`/daksh/${params.schoolId}/${params.classId}/${params.studentId}/help`)}
          className="flex flex-col items-center justify-center w-20 text-gray-500"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
          </svg>
          <span className="text-xs mt-1">Help</span>
        </button>
        <button className="flex flex-col items-center justify-center w-20 text-indigo-600">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}