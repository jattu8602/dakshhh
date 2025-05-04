'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStudent } from '../../../../../lib/studentContext';
import { getStudentById } from '../../../../../lib/firestore';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const router = useRouter();
  const params = useParams();
  const { getStudentData, loading: studentLoading } = useStudent();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle navigation back to dashboard
  const handleBackToDashboard = () => {
    router.push(`/daksh/${params.schoolId}/${params.classId}/${params.studentId}`);
  };

  // Sample courses data - in a real app, you would fetch this from your backend
  const courses = [
    {
      id: 'memory-1',
      title: 'Memory Enhancement',
      level: 'Beginner',
      description: 'Learn techniques to improve your memory and recall abilities.',
      lessons: 8,
      completed: 3,
      image: '🧠'
    },
    {
      id: 'attention-1',
      title: 'Focus Training',
      level: 'Intermediate',
      description: 'Develop your concentration and sustained attention capabilities.',
      lessons: 6,
      completed: 1,
      image: '🎯'
    },
    {
      id: 'math-1',
      title: 'Mental Math',
      level: 'Beginner',
      description: 'Master the art of performing calculations quickly in your head.',
      lessons: 10,
      completed: 0,
      image: '🔢'
    },
    {
      id: 'problem-1',
      title: 'Problem Solving',
      level: 'Advanced',
      description: 'Learn strategies to tackle complex problems methodically.',
      lessons: 12,
      completed: 4,
      image: '🧩'
    }
  ];

  // Handle cookie verification on page load
  useEffect(() => {
    // Check cookies to ensure they're set properly for this page
    const hasLoginCookie = document.cookie.includes('loginCompleted=true');
    const hasOnboardedCookie = document.cookie.includes('onboarded=true');

    // If we're missing required cookies, set them now
    if (!hasLoginCookie || !hasOnboardedCookie) {
      console.log('Courses: Fixing missing cookies to prevent redirect loops');

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

  // Function to get recommended courses based on student preferences
  const getRecommendedCourses = () => {
    if (!student.preferences) return courses.slice(0, 2);

    const focusArea = student.preferences.improvement;
    let recommended = [];

    if (focusArea === 'memory') {
      recommended = courses.filter(course => course.id.includes('memory'));
    } else if (focusArea === 'attention') {
      recommended = courses.filter(course => course.id.includes('attention'));
    } else if (focusArea === 'maths') {
      recommended = courses.filter(course => course.id.includes('math'));
    } else if (focusArea === 'problem') {
      recommended = courses.filter(course => course.id.includes('problem'));
    }

    // If no matches or not enough, add some other courses
    while (recommended.length < 2) {
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      if (!recommended.includes(randomCourse)) {
        recommended.push(randomCourse);
      }
    }

    return recommended;
  };

  const recommendedCourses = getRecommendedCourses();

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
              Your Courses
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommended Courses */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedCourses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 flex items-center justify-center text-4xl mr-4">
                      {course.image}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.level}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {course.completed} of {course.lessons} lessons
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium">
                      Continue
                    </button>
                  </div>
                </div>
                <div className="bg-gray-100 h-2">
                  <div
                    className="bg-indigo-600 h-full"
                    style={{ width: `${(course.completed / course.lessons) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Courses */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">All Courses</h2>
          <div className="space-y-4">
            {courses.map(course => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow p-4 flex items-center"
              >
                <div className="h-12 w-12 flex items-center justify-center text-3xl bg-indigo-100 rounded-full mr-4">
                  {course.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{course.title}</h3>
                  <div className="flex items-center">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full mr-2">
                      {course.level}
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.lessons} lessons
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm ml-4">
                  {course.completed > 0 ? 'Continue' : 'Start'}
                </button>
              </div>
            ))}
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
        <button className="flex flex-col items-center justify-center w-20 text-indigo-600">
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