'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authenticateStudent, authenticateStudentByQR, getStudentById } from './firestore';
import { setCookie } from 'cookies-next';

// Create student auth context
const StudentContext = createContext({});

// Cache for storing fetched student data
const studentCache = new Map();

// Student provider component
export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(null);
  const [matchingStudents, setMatchingStudents] = useState([]);
  const [multipleMatches, setMultipleMatches] = useState(false);

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

        // Add to cache
        if (parsedStudent.id && parsedStudent.schoolId && parsedStudent.classId) {
          const cacheKey = `${parsedStudent.schoolId}:${parsedStudent.classId}:${parsedStudent.id}`;
          studentCache.set(cacheKey, parsedStudent);
        }

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

  // Get student data efficiently - first from cache, then context, then Firestore
  const getStudentData = async (schoolId, classId, studentId) => {
    if (!schoolId || !classId || !studentId) {
      return null;
    }

    // First check cache
    const cacheKey = `${schoolId}:${classId}:${studentId}`;
    if (studentCache.has(cacheKey)) {
      return studentCache.get(cacheKey);
    }

    // Then check if it matches the current student
    if (student &&
        student.schoolId === schoolId &&
        student.classId === classId &&
        student.id === studentId) {
      return student;
    }

    // Finally, fetch from Firestore
    try {
      const studentData = await getStudentById(schoolId, classId, studentId);
      if (studentData) {
        // Add to cache
        const enhancedData = {
          ...studentData,
          schoolId,
          classId
        };
        studentCache.set(cacheKey, enhancedData);
        return enhancedData;
      }
    } catch (error) {
      console.error('Error in getStudentData:', error);
    }

    return null;
  };

  // Set student and handle onboarding status
  const setStudentAndHandleOnboarding = (selectedStudent) => {
    // Clear any previous student data to avoid conflicts
    logout(false); // Clear data without triggering UI effects

    // Set new student data
    setStudent(selectedStudent);
    localStorage.setItem('student', JSON.stringify(selectedStudent));
    localStorage.setItem('loginCompleted', 'true');

    // Add to cache
    if (selectedStudent.id && selectedStudent.schoolId && selectedStudent.classId) {
      const cacheKey = `${selectedStudent.schoolId}:${selectedStudent.classId}:${selectedStudent.id}`;
      studentCache.set(cacheKey, selectedStudent);
    }

    // Only set onboarded to true if the student has completed the full process
    if (selectedStudent.preferences) {
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

    // Clear multiple matches state
    setMatchingStudents([]);
    setMultipleMatches(false);

    return { success: true, student: selectedStudent };
  };

  // Select a specific student from multiple matches
  const selectStudent = (studentIndex) => {
    if (studentIndex >= 0 && studentIndex < matchingStudents.length) {
      const selectedStudent = matchingStudents[studentIndex];
      return setStudentAndHandleOnboarding(selectedStudent);
    }
    return { success: false, error: 'Invalid student selection' };
  };

  // Login with username/password
  const login = async (username, password) => {
    setError(null);
    setLoading(true);

    try {
      const result = await authenticateStudent(username, password);

      if (result.authenticated) {
        if (result.multipleMatches) {
          // Multiple students found, store them and let user choose
          setMatchingStudents(result.students);
          setMultipleMatches(true);
          return { success: true, multipleMatches: true, students: result.students };
        } else {
          // Single student found
          return setStudentAndHandleOnboarding(result.students[0]);
        }
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
      // Clear any previous auth state before attempting login
      setMatchingStudents([]);
      setMultipleMatches(false);

      // Try to parse and authenticate
      const result = await authenticateStudentByQR(qrData);

      if (result.authenticated) {
        if (result.multipleMatches) {
          // Multiple students found, store them and let user choose
          setMatchingStudents(result.students);
          setMultipleMatches(true);
          return { success: true, multipleMatches: true, students: result.students };
        } else {
          // Single student found - immediately set the student
          return setStudentAndHandleOnboarding(result.students[0]);
        }
      } else {
        throw new Error('Invalid QR code');
      }
    } catch (err) {
      console.error('QR login error:', err);
      setError(err.message || 'Failed to authenticate with QR code');
      return { success: false, error: err.message || 'Failed to authenticate with QR code' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = (updateUI = true) => {
    if (updateUI) {
      setStudent(null);
      setOnboardingComplete(false);
      setCurrentOnboardingStep(null);
      setMatchingStudents([]);
      setMultipleMatches(false);
    }

    // Always clear storage
    localStorage.removeItem('student');
    localStorage.removeItem('onboarded');
    localStorage.removeItem('loginCompleted');
    localStorage.removeItem('onboardingStep');

    // Clear cookies
    setCookie('onboarded', '', { maxAge: 0, path: '/' });
    setCookie('loginCompleted', '', { maxAge: 0, path: '/' });
    setCookie('studentData', '', { maxAge: 0, path: '/' });

    // Clear cache
    studentCache.clear();

    return { success: true };
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

      // Update cache
      if (updatedStudent.id && updatedStudent.schoolId && updatedStudent.classId) {
        const cacheKey = `${updatedStudent.schoolId}:${updatedStudent.classId}:${updatedStudent.id}`;
        studentCache.set(cacheKey, updatedStudent);
      }

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
        completeOnboarding,
        matchingStudents,
        multipleMatches,
        selectStudent,
        getStudentData
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