'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateStudent } from '../../lib/firestore';
import { useStudent } from '../../lib/studentContext';
import { setCookie } from 'cookies-next';

export default function Questions() {
  const router = useRouter();
  const { student, isAuthenticated, loading, completeOnboarding } = useStudent();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({
    discover: '',
    improvement: '',
    level: '',
    goal: ''
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/onboarding/login');
    }
  }, [isAuthenticated, loading, router]);

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

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    setAnswers({
      ...answers,
      [currentQuestion.answer]: optionId
    });
  };

  // Handle next button
  const handleNext = async () => {
    // If this is the last question, save answers and redirect
    if (currentQuestionIndex === questions.length - 1) {
      try {
        if (!student) {
          console.error('No student data found. Unable to save preferences.');
          router.push('/onboarding/login');
          return;
        }

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
        }, 100);
      } catch (error) {
        console.error('Error saving answers:', error);
        // Handle error state
      }
    } else {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Check if current question has an answer
  const hasAnswer = !!answers[currentQuestion.answer];

  // Show loading state if loading
  if (loading) {
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
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}