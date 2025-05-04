'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStudent } from '../../../../../lib/studentContext';
import { getStudentById } from '../../../../../lib/firestore';
import toast from 'react-hot-toast';

export default function HelpPage() {
  const router = useRouter();
  const params = useParams();
  const { student: contextStudent, loading: studentLoading } = useStudent();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  // Sample FAQ data
  const faqs = [
    {
      id: 1,
      question: 'How do I update my profile information?',
      answer: 'You can update your profile information by going to the Profile tab and clicking on "Edit Profile". From there, you can modify your personal details and preferences.'
    },
    {
      id: 2,
      question: 'How are course recommendations generated?',
      answer: 'Course recommendations are personalized based on your learning preferences, skill level, and focus areas that you specified during the onboarding process. We also consider your past activity and completion rate for similar courses.'
    },
    {
      id: 3,
      question: 'What do I do if I forgot my password?',
      answer: 'If you forgot your password, please ask your teacher to reset it for you. They have administrative access and can provide you with a new password or QR code for login.'
    },
    {
      id: 4,
      question: 'How do I earn more points?',
      answer: 'You can earn points by completing lessons, achieving high scores on assessments, maintaining a daily streak, and participating in special challenges. Points reflect your progress and engagement with the platform.'
    },
    {
      id: 5,
      question: 'Can I access my courses offline?',
      answer: 'Currently, you need an internet connection to access your courses. However, we\'re working on an offline mode that will allow you to download lessons for offline learning. Stay tuned for updates!'
    }
  ];

  // Handle navigation back to dashboard
  const handleBackToDashboard = () => {
    router.push(`/daksh/${params.schoolId}/${params.classId}/${params.studentId}`);
  };

  // Toggle FAQ open/closed state
  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  // Handle cookie verification on page load
  useEffect(() => {
    // Check cookies to ensure they're set properly for this page
    const hasLoginCookie = document.cookie.includes('loginCompleted=true');
    const hasOnboardedCookie = document.cookie.includes('onboarded=true');

    // If we're missing required cookies, set them now
    if (!hasLoginCookie || !hasOnboardedCookie) {
      console.log('Help: Fixing missing cookies to prevent redirect loops');

      // Force set the cookies needed for dashboard access
      document.cookie = `loginCompleted=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
      document.cookie = `onboarded=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;

      // Also set localStorage for redundancy
      localStorage.setItem('loginCompleted', 'true');
      localStorage.setItem('onboarded', 'true');
    }
  }, []);

  // Fetch student data using route parameters
  useEffect(() => {
    async function loadStudentData() {
      if (params.schoolId && params.classId && params.studentId) {
        try {
          // First try to use context student if the IDs match
          if (
            contextStudent &&
            contextStudent.schoolId === params.schoolId &&
            contextStudent.classId === params.classId &&
            contextStudent.id === params.studentId
          ) {
            setStudent(contextStudent);
            setLoading(false);
            return;
          }

          // Otherwise fetch from Firestore directly
          const studentData = await getStudentById(
            params.schoolId,
            params.classId,
            params.studentId
          );

          if (studentData) {
            setStudent({
              ...studentData,
              schoolId: params.schoolId,
              classId: params.classId
            });
          } else {
            // If student not found, redirect to generic dashboard
            toast.error('Student data not found');
            router.push('/daksh');
          }
        } catch (error) {
          console.error('Error loading student data:', error);
          toast.error('Failed to load your profile');
        } finally {
          setLoading(false);
        }
      } else {
        // Missing parameters, redirect to generic dashboard
        router.push('/daksh');
      }
    }

    if (!studentLoading) {
      loadStudentData();
    }
  }, [params, contextStudent, studentLoading, router]);

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
              Help & Support
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            If you're having trouble with the platform or have questions about your courses,
            we're here to help! Contact your teacher or reach out to our support team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <h3 className="font-medium text-indigo-900">Email Support</h3>
              </div>
              <p className="text-indigo-700 ml-7">support@daksh.example.com</p>
            </div>
            <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <h3 className="font-medium text-indigo-900">Phone Support</h3>
              </div>
              <p className="text-indigo-700 ml-7">+91 12345 67890</p>
              <p className="text-xs text-indigo-600 ml-7">Monday-Friday, 9 AM - 5 PM</p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 transform ${openFaq === faq.id ? 'rotate-180' : ''} transition-transform duration-200`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === faq.id && (
                  <div className="p-4 pt-0 text-gray-600 bg-gray-50 border-t border-gray-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Common Issues</h2>
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">App Not Loading Properly</h3>
                <p className="text-gray-600 text-sm mt-1">Try clearing your browser cache and cookies, then reload the page. This resolves most loading issues.</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Course Videos Not Playing</h3>
                <p className="text-gray-600 text-sm mt-1">Check your internet connection and try using a different browser. Make sure you have the latest version installed.</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Getting Logged Out Frequently</h3>
                <p className="text-gray-600 text-sm mt-1">Ensure you're not browsing in private/incognito mode and that your browser accepts cookies.</p>
              </div>
            </div>
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
        <button className="flex flex-col items-center justify-center w-20 text-indigo-600">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1a1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
          </svg>
          <span className="text-xs mt-1">Help</span>
        </button>
        <button
          onClick={() => router.push(`/daksh/${params.schoolId}/${params.classId}/${params.studentId}/profile`)}
          className="flex flex-col items-center justify-center w-20 text-gray-500"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}