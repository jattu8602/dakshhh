'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateStudent } from '../../lib/firestore';
import { useStudent } from '../../lib/studentContext';
import { setCookie } from 'cookies-next';
import toast from 'react-hot-toast';

export default function Questions() {
  const router = useRouter();
  const { student, isAuthenticated, loading, completeOnboarding, onboardingComplete } = useStudent();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({
    discover: '',
    improvement: '',
    level: '',
    goal: '',
    subjects: []
  });
  const [showSubjectsPage, setShowSubjectsPage] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Handle navigation and authentication
  useEffect(() => {
    if (!loading) {
      // If already onboarded, redirect to dashboard
      if (isAuthenticated && onboardingComplete) {
        toast.success('You have already completed onboarding');
        const timer = setTimeout(() => {
          router.push('/daksh');
        }, 500);
        return () => clearTimeout(timer);
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        toast.error('Please log in first');
        const timer = setTimeout(() => {
          router.push('/onboarding/login');
        }, 500);
        return () => clearTimeout(timer);
      }

      // User is authenticated but not onboarded, show questions
      setPageLoading(false);

      // If the user has an existing student object, pre-fill answers from preferences
      if (student && student.preferences) {
        setAnswers({
          ...answers,
          ...student.preferences
        });
      }
    }
  }, [isAuthenticated, loading, router, student, onboardingComplete]);

  // Questions configuration
  const questions = [
    {
      title: "What would you like to discover about yourself?",
      options: [
        { id: 'iq', label: 'IQ score' },
        { id: 'archetype', label: 'Archetype' },
        { id: 'adhd', label: 'ADHD type' },
        { id: 'procrastination', label: 'Procrastination type' },
        { id: 'personality', label: 'Personality type' },
        { id: 'anxiety', label: 'Anxiety Level' },
        { id: 'trauma', label: 'Trauma, fear and response type' },
        { id: 'brain', label: 'Dominant brain part' }
      ],
      answer: 'discover'
    },
    {
      title: "Choose improvement areas",
      subtitle: "This will help to make your training plan more relevant.",
      options: [
        { id: 'memory', label: 'Memory' },
        { id: 'attention', label: 'Attention' },
        { id: 'maths', label: 'Mental maths' },
        { id: 'problem', label: 'Problem solving' }
      ],
      answer: 'improvement'
    },
    {
      title: "What's your Level",
      subtitle: "Choose your current level, We will suggest the best lesson for you",
      options: [
        { id: 'starting', label: "I'm just Starting" },
        { id: 'basics', label: 'I know the basics' },
        { id: 'lot', label: 'I know a lot!' },
        { id: 'samurai', label: "I'm Samurai" }
      ],
      answer: 'level'
    },
    {
      title: "Choose a goal",
      options: [
        { id: 'breeze', label: 'Breeze', sublabel: 'Less than 1hr' },
        { id: 'casual', label: 'Casual', sublabel: '1hr' },
        { id: 'regular', label: 'Regular', sublabel: '2hrs' },
        { id: 'focused', label: 'Focused', sublabel: '4hrs' },
        { id: 'intense', label: 'Intense', sublabel: 'More than 4hrs' }
      ],
      answer: 'goal'
    }
  ];

  // Subject options
  const subjectOptions = [
    { id: 'history', label: 'History' },
    { id: 'science', label: 'Science' },
    { id: 'geography', label: 'Geography' },
    { id: 'civics', label: 'Civics' },
    { id: 'maths', label: 'Maths' },
    { id: 'social', label: 'Social science' },
    { id: 'sanskrit', label: 'Sanskrit' },
    { id: 'hindi', label: 'Hindi' },
    { id: 'english', label: 'English' }
  ];

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    setAnswers({
      ...answers,
      [currentQuestion.answer]: optionId
    });
  };

  // Handle subject selection
  const handleSubjectToggle = (subjectId) => {
    const currentSubjects = [...answers.subjects];
    if (currentSubjects.includes(subjectId)) {
      // Remove subject if already selected
      setAnswers({
        ...answers,
        subjects: currentSubjects.filter(id => id !== subjectId)
      });
    } else {
      // Add subject if not selected
      setAnswers({
        ...answers,
        subjects: [...currentSubjects, subjectId]
      });
    }
  };

  // Handle next button
  const handleNext = async () => {
    // If this is the last question, show subjects page
    if (currentQuestionIndex === questions.length - 1) {
      setShowSubjectsPage(true);
    } else {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle saving all preferences and proceeding to dashboard
  const handleSaveAndContinue = async () => {
    try {
      if (!student) {
        console.error('No student data found. Unable to save preferences.');
        router.push('/onboarding/login');
        return;
      }

      toast.success('Preferences saved!');

      // Save answers to Firebase
      await updateStudent(
        student.schoolId,
        student.classId,
        student.id,
        {
          preferences: answers
        }
      );

      // Use the completeOnboarding function from context
      completeOnboarding(answers);

      // Small delay to ensure all state updates before redirect
      setTimeout(() => {
        router.push('/daksh');
      }, 500);
    } catch (error) {
      console.error('Error saving answers:', error);
      toast.error('Failed to save preferences');
    }
  };

  // Handle skipping the subjects selection
  const handleSkip = async () => {
    // Just proceed without saving subject preferences
    try {
      if (!student) {
        console.error('No student data found. Unable to save preferences.');
        router.push('/onboarding/login');
        return;
      }

      // Save answers to Firebase without subjects
      await updateStudent(
        student.schoolId,
        student.classId,
        student.id,
        {
          preferences: answers
        }
      );

      // Use the completeOnboarding function from context
      completeOnboarding(answers);

      toast.success('Personalization complete!');

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/daksh');
      }, 500);
    } catch (error) {
      console.error('Error saving answers:', error);
      toast.error('Something went wrong');
    }
  };

  // Check if current question has an answer
  const hasAnswer = !!answers[currentQuestion?.answer];

  // Show loading state if loading
  if (loading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Subjects selection page
  if (showSubjectsPage) {
    return (
      <div className="min-h-screen flex flex-col p-6">
        {/* Back button */}
        <button
          onClick={() => setShowSubjectsPage(false)}
          className="absolute left-4 top-4 text-black"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col mt-12">
          {/* Title */}
          <h1 className="text-3xl font-bold mb-2">
            Personalize your experience
          </h1>
          <p className="text-gray-600 mb-8">
            You can customize your feed by following topics or people that interest you the most
          </p>

          {/* Subjects grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {subjectOptions.map((subject) => (
              <button
                key={subject.id}
                onClick={() => handleSubjectToggle(subject.id)}
                className={`py-3 px-6 rounded-full font-medium text-center ${
                  answers.subjects.includes(subject.id)
                    ? 'bg-indigo-100 border-2 border-indigo-600 text-indigo-600'
                    : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                {subject.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-auto space-y-3">
            <button
              onClick={handleSaveAndContinue}
              className="w-full py-4 bg-black text-white rounded-full font-medium text-lg"
            >
              Save & continue
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-4 bg-white border border-gray-300 text-black rounded-full font-medium text-lg"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular questions pages
  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Progress indicator */}
      <div className="flex justify-center mb-6 space-x-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentQuestionIndex ? 'bg-black' :
              index < currentQuestionIndex ? 'bg-gray-700' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Question title */}
        <h1 className="text-2xl font-bold mb-2">
          {currentQuestion.title}
        </h1>

        {/* Subtitle if available */}
        {currentQuestion.subtitle && (
          <p className="text-gray-600 text-sm mb-6">
            {currentQuestion.subtitle}
          </p>
        )}

        {/* Options */}
        <div className="mt-4 space-y-3">
          {currentQuestion.options.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`p-4 border rounded-lg cursor-pointer flex items-center ${
                answers[currentQuestion.answer] === option.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 ${
                answers[currentQuestion.answer] === option.id
                  ? 'border-indigo-600 bg-indigo-600'
                  : 'border-gray-300'
              }`}>
                {answers[currentQuestion.answer] === option.id && (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <span className="block font-medium">{option.label}</span>
                {option.sublabel && (
                  <span className="block text-sm text-gray-500">{option.sublabel}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next button */}
        <div className="mt-auto pt-8">
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className={`w-full py-3 rounded-md font-medium ${
              hasAnswer
                ? 'bg-black text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Continue' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}