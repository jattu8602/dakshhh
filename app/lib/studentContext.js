'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authenticateStudent, authenticateStudentByQR } from './firestore';
import { setCookie } from 'cookies-next';

// Create student auth context
const StudentContext = createContext({});

// Student provider component
export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(null);

  useEffect(() => {
    // Check if student info is in localStorage
    const storedStudent = localStorage.getItem('student');
    const isOnboarded = localStorage.getItem('onboarded') === 'true';
    const loginCompleted = localStorage.getItem('loginCompleted') === 'true';
    const onboardingStep = localStorage.getItem('onboardingStep');

    setOnboardingComplete(isOnboarded);
    setCurrentOnboardingStep(onboardingStep || null);

    if (storedStudent) {
      try {
        const parsedStudent = JSON.parse(storedStudent);
        setStudent(parsedStudent);

        // Set onboarded cookie for middleware only if fully onboarded
        if (isOnboarded) {
          setCookie('onboarded', 'true', {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/'
          });
        } else if (loginCompleted) {
          // Ensure the cookie is set correctly for in-progress onboarding
          setCookie('onboarded', 'false', {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/'
          });
        }
      } catch (err) {
        console.error('Failed to parse stored student data:', err);
        localStorage.removeItem('student');
        // Clear the cookie
        setCookie('onboarded', '', { maxAge: 0, path: '/' });
      }
    }
    setLoading(false);
  }, []);

  // Login with username/password
  const login = async (username, password) => {
    setError(null);
    setLoading(true);

    try {
      const result = await authenticateStudent(username, password);

      if (result.authenticated) {
        setStudent(result.student);
        // Store student info in localStorage
        localStorage.setItem('student', JSON.stringify(result.student));
        localStorage.setItem('loginCompleted', 'true');

        // Only set onboarded to true if the student has completed the full process
        if (result.student.preferences) {
          localStorage.setItem('onboarded', 'true');
          setOnboardingComplete(true);
          // Set onboarded cookie for middleware
          setCookie('onboarded', 'true', {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/'
          });
        } else {
          // Student logged in but hasn't completed the questions
          localStorage.setItem('onboardingStep', 'questions');
          setCurrentOnboardingStep('questions');
          // Set cookie explicitly to false
          setCookie('onboarded', 'false', {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/'
          });
        }

        return { success: true, student: result.student };
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Login with QR code
  const loginWithQR = async (qrData) => {
    setError(null);
    setLoading(true);

    try {
      const result = await authenticateStudentByQR(qrData);

      if (result.authenticated) {
        setStudent(result.student);
        // Store student info in localStorage
        localStorage.setItem('student', JSON.stringify(result.student));
        localStorage.setItem('loginCompleted', 'true');

        // Only set onboarded to true if the student has completed the full process
        if (result.student.preferences) {
          localStorage.setItem('onboarded', 'true');
          setOnboardingComplete(true);
          // Set onboarded cookie for middleware
          setCookie('onboarded', 'true', {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/'
          });
        } else {
          // Student logged in but hasn't completed the questions
          localStorage.setItem('onboardingStep', 'questions');
          setCurrentOnboardingStep('questions');
          // Set cookie explicitly to false
          setCookie('onboarded', 'false', {
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/'
          });
        }

        return { success: true, student: result.student };
      } else {
        throw new Error('Invalid QR code');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setStudent(null);
    setOnboardingComplete(false);
    setCurrentOnboardingStep(null);
    localStorage.removeItem('student');
    localStorage.removeItem('onboarded');
    localStorage.removeItem('loginCompleted');
    localStorage.removeItem('onboardingStep');

    // Clear onboarded cookie
    setCookie('onboarded', '', { maxAge: 0, path: '/' });
  };

  // Complete onboarding after questions
  const completeOnboarding = (preferences) => {
    if (student) {
      const updatedStudent = {
        ...student,
        preferences
      };
      setStudent(updatedStudent);
      localStorage.setItem('student', JSON.stringify(updatedStudent));
      localStorage.setItem('onboarded', 'true');
      localStorage.removeItem('onboardingStep');
      setOnboardingComplete(true);
      setCurrentOnboardingStep(null);

      // Set onboarded cookie to true
      setCookie('onboarded', 'true', {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });
    }
  };

  // Check if student has completed onboarding questions
  const hasCompletedQuestions = () => {
    return student && student.preferences;
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        loading,
        error,
        login,
        loginWithQR,
        logout,
        hasCompletedQuestions,
        onboardingComplete,
        currentOnboardingStep,
        completeOnboarding
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

// Custom hook for using student context
export function useStudent() {
  return useContext(StudentContext);
}