'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStudent } from '../../lib/studentContext';
import { setCookie } from 'cookies-next';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';

export default function StudentLogin() {
  const router = useRouter();
  const { login, loginWithQR, selectStudent, matchingStudents, multipleMatches, error: authError, loading: authLoading, logout } = useStudent();
  const [loginMethod, setLoginMethod] = useState('credentials'); // 'credentials' or 'qr'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const scannerRef = useRef(null);
  const qrContainerRef = useRef(null);
  const redirectTimeoutRef = useRef(null);

  // Clean up any previous login state when component mounts
  useEffect(() => {
    // Clear any previous navigation attempts
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Reset states
    setIsNavigating(false);
    setLoading(false);

    // If we're in the login page, make sure we're not in a half-logged-in state
    const currentPath = window.location.pathname;
    if (currentPath.includes('/onboarding/login')) {
      // Clear previous login attempts but don't update UI state
      logout();
    }
  }, []);

  // Set error from auth context
  useEffect(() => {
    if (authError && !isNavigating) {
      setError(authError);
      toast.error(authError);
    }
  }, [authError, isNavigating]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up scanner
      if (scannerRef.current) {
        try {
          // Only try to stop if scanning is active
          if (scanActive) {
            scannerRef.current.stop().catch(err => {
              // Silent catch - no need to log errors during unmount
            });
          }
        } catch (err) {
          // Silent catch - we're cleaning up anyway
        }
      }

      // Clear any pending timeouts
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [scanActive]);

  // Handle redirect based on user's onboarding status
  const handleSuccessfulLogin = (student) => {
    setIsNavigating(true);
    setLoading(true);

    // Check if the student has already completed onboarding questions
    const hasCompletedOnboarding = student && student.preferences;

    // Clear any existing timeout first
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    if (hasCompletedOnboarding) {
      // User has already completed questions, mark as onboarded
      localStorage.setItem('onboarded', 'true');
      // Set cookie with HTTP only false to ensure it's accessible to middleware
      setCookie('onboarded', 'true', {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'strict',
        httpOnly: false
      });

      // Set loginCompleted cookie as well for redundancy
      setCookie('loginCompleted', 'true', {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'strict',
        httpOnly: false
      });

      toast.success('Welcome back!', { duration: 1500 });

      // Force synchronous cookie setting before redirect
      document.cookie = `onboarded=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=strict`;

      // Small delay to ensure cookies are set
      setTimeout(() => {
        // Force hard refresh to ensure middleware catches the new cookies
        window.location.replace('/daksh');
      }, 300);
    } else {
      // User has not completed onboarding, redirect to questions
      localStorage.setItem('loginCompleted', 'true');
      localStorage.setItem('onboardingStep', 'questions');

      // Set cookies with HTTP only false to ensure they're accessible to middleware
      setCookie('onboarded', 'false', {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'strict',
        httpOnly: false
      });

      setCookie('loginCompleted', 'true', {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'strict',
        httpOnly: false
      });

      toast.success('Login successful!', { duration: 1500 });

      // Force synchronous cookie setting before redirect
      document.cookie = `loginCompleted=true;path=/;max-age=${30 * 24 * 60 * 60};samesite=strict`;
      document.cookie = `onboarded=false;path=/;max-age=${30 * 24 * 60 * 60};samesite=strict`;

      // Small delay to ensure cookies are set
      setTimeout(() => {
        // Force hard refresh to ensure middleware catches the new cookies
        window.location.replace('/onboarding/questions');
      }, 300);
    }
  };

  // Handle student selection from multiple matches
  const handleStudentSelection = async (index) => {
    if (isNavigating) return;

    try {
      setLoading(true);
      setError('');
      setIsNavigating(true); // Set navigating state immediately to prevent multiple selections

      const result = await selectStudent(index);

      if (result.success) {
        // Handle successful login with the selected student
        handleSuccessfulLogin(result.student);
      } else {
        setError(result.error || 'Selection failed');
        toast.error(result.error || 'Selection failed');
        setIsNavigating(false); // Reset navigating state on error
        setLoading(false);
      }
    } catch (err) {
      console.error('Selection error:', err);
      setError('Failed to select student');
      toast.error('Failed to select student');
      setIsNavigating(false); // Reset navigating state on error
      setLoading(false);
    }
  };

  // Toggle login method
  const toggleLoginMethod = () => {
    if (isNavigating) return;

    setLoginMethod(loginMethod === 'credentials' ? 'qr' : 'credentials');
    setError('');

    if (scanActive) {
      stopScanner();
    }
  };

  // Initialize QR scanner when QR method is selected
  useEffect(() => {
    if (isNavigating) return;

    if (loginMethod === 'qr' && !scannerReady && qrContainerRef.current) {
      // Immediately initialize scanner, no need for delay
      initializeScanner();
      return () => {
        if (scannerRef.current && scanActive) {
          stopScanner();
        }
      };
    }

    return () => {
      if (scannerRef.current && scanActive) {
        stopScanner();
      }
    };
  }, [loginMethod, qrContainerRef.current, isNavigating]);

  // Initialize the QR scanner
  const initializeScanner = async () => {
    if (isNavigating) return;

    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      // Check if element exists before initializing
      if (!document.getElementById("qr-reader")) {
        console.error("QR reader element not found");
        return;
      }

      // First check if camera permissions are available
      try {
        // Request camera permission explicitly before initializing scanner
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });

        // Close the test stream right away
        stream.getTracks().forEach(track => track.stop());

        // Handle errors from NextAuth or other global errors
        window.addEventListener('error', (event) => {
          // Ignore QR scanner related errors - we handle those separately
          if (event.message.includes('next-auth') || event.message.includes('CLIENT_FETCH_ERROR')) {
            // Prevent these errors from affecting the QR scanner
            console.warn('NextAuth error detected, continuing QR scanning functionality');
            event.stopPropagation();
            event.preventDefault();
          }
        }, true);

        // Now initialize the scanner after permissions are granted
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        setScannerReady(true);
        startScanner();
      } catch (permissionError) {
        console.error('Camera permission error:', permissionError);

        // Check the specific error type
        if (permissionError.name === 'NotAllowedError') {
          setError('Camera permission was denied. Please allow camera access in your browser settings and try again.');
          toast.error('Camera permission denied. Please check your browser settings.');
        } else if (permissionError.name === 'NotFoundError') {
          setError('No camera found. Please make sure your device has a camera.');
          toast.error('No camera found on your device.');
        } else if (permissionError.name === 'NotReadableError') {
          setError('Camera is in use by another application. Please close other apps using the camera.');
          toast.error('Camera is in use by another application.');
        } else {
          setError('Could not access camera. Please check permissions and try again.');
          toast.error('Could not access camera. Please check permissions.');
        }
      }
    } catch (err) {
      console.error('Failed to initialize scanner:', err);
      if (!isNavigating) {
        toast.error('Could not access camera. Try refreshing the page or checking browser settings.');
        setError('Camera access failed. Please check browser permissions or try a different device.');
      }
    }
  };

  // Start QR scanning with optimized configuration
  const startScanner = () => {
    if (!scannerRef.current || isNavigating) return;

    // Define QR code format with fallback handling
    const formats = [];
    try {
      // Check if Html5Qrcode.FORMATS exists and has QR_CODE
      if (Html5Qrcode.FORMATS && Html5Qrcode.FORMATS.QR_CODE) {
        formats.push(Html5Qrcode.FORMATS.QR_CODE);
      }
    } catch (err) {
      console.warn('Html5Qrcode formats not available, scanning all formats');
    }

    const qrConfig = {
      fps: 15, // Increased from 10 for faster scanning
      qrbox: { width: 300, height: 300 }, // Increased size for better detection
      aspectRatio: 1.0,
      // Only set formats if we successfully got them
      ...(formats.length > 0 ? { formatsToSupport: formats } : {}),
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true // Use native detector if available
      }
    };

    scannerRef.current.start(
      { facingMode: "environment" },
      qrConfig,
      onScanSuccess,
      onScanError
    )
    .then(() => {
      setScanActive(true);
      // Clear any error messages since camera is working now
      setError('');
    })
    .catch((err) => {
      console.error('Scanner start error:', err);
      if (!isNavigating) {
        if (err.message?.includes("Camera access is denied")) {
          toast.error('Camera access denied. Please check permissions in your browser settings.');
          setError('Camera access denied. Please allow camera access in your browser settings and refresh this page.');
        } else {
          toast.error('Failed to start camera. Try refreshing the page.');
          setError('Failed to start camera: ' + err.message);
        }
      }
    });
  };

  // Handle QR scan error
  const onScanError = (err) => {
    // Only log serious errors, not the common "no QR code found" errors
    if (err &&
        !err.message?.includes("No barcode or QR code detected") &&
        !err.message?.includes("NotFoundException")) {
      console.error('QR scan error:', err);
    }
  };

  // Stop QR scanning - returns a promise
  const stopScanner = async () => {
    if (scannerRef.current && scanActive) {
      try {
        // Set scan state to inactive first to prevent multiple stop attempts
        setScanActive(false);
        await scannerRef.current.stop();
        return true;
      } catch (err) {
        // Don't log transition state errors which are common during cleanup
        if (!err.message?.includes("Cannot transition to a new state")) {
          console.error('Error stopping scanner:', err);
        }
        return false;
      }
    }
    return true;
  };

  // Handle successful QR scan
  const onScanSuccess = async (decodedText) => {
    if (isNavigating) return;

    try {
      // Set navigating first to prevent multiple scans
      setIsNavigating(true);
      setLoading(true);

      // Stop scanning immediately
      await stopScanner();

      // Minimal toast to avoid delays
      toast.success('QR code detected!', { duration: 1500 });

      // Try to parse the QR data and login
      await handleQRLogin(decodedText);
    } catch (err) {
      console.error('QR processing error:', err);
      setError('Invalid QR code format');
      toast.error('Invalid QR code format');
      setLoading(false);
      setIsNavigating(false);

      // Restart scanner after error
      startScanner();
    }
  };

  // Process QR data and login
  const handleQRLogin = async (qrData) => {
    try {
      const result = await loginWithQR(qrData);

      if (result.success) {
        if (result.multipleMatches) {
          // Multiple students found, let user select one
          setIsNavigating(false); // Reset navigating state to allow selection
          toast.success('Multiple accounts found. Please select one.');
        } else {
          // Keep the navigating flag set to prevent additional toasts
          // Handle successful login with the user's data
          handleSuccessfulLogin(result.student);
        }
      } else {
        setError(result.error || 'QR authentication failed');
        toast.error(result.error || 'QR authentication failed');
        setIsNavigating(false);
        setLoading(false);

        // Restart scanner after error
        startScanner();
      }
    } catch (err) {
      console.error('QR login error:', err);
      setError('Failed to authenticate with QR code');
      toast.error('Failed to authenticate with QR code');
      setIsNavigating(false);
      setLoading(false);

      // Restart scanner after error
      startScanner();
    }
  };

  // Handle login with credentials
  const handleCredentialLogin = async (e) => {
    e.preventDefault();

    if (isNavigating) return;

    if (!username || !password) {
      setError('Please enter both username and password');
      toast.error('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Authenticate with Firebase using context
      const result = await login(username, password);

      if (result.success) {
        if (result.multipleMatches) {
          // Multiple students found, let user select one
          setIsNavigating(false);
          toast.success('Multiple accounts found. Please select one.');
        } else {
          // Set navigating flag to prevent additional toasts and actions
          setIsNavigating(true);
          // Handle successful login with the user's data
          handleSuccessfulLogin(result.student);
        }
      } else {
        setError(result.error || 'Authentication failed');
        toast.error(result.error || 'Authentication failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password. Please try again.');
      toast.error('Invalid username or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation overlay - shown when navigating to indicate transition */}
      {isNavigating && (
        <div className="fixed inset-0 bg-indigo-500 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-indigo-700 font-medium">Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo or header image */}
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>

          <h2 className="text-center text-2xl font-bold text-gray-900">
            Student Login
          </h2>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
              {(error.includes('permission') || error.includes('access')) && (
                <div className="mt-2 text-sm">
                  <button
                    onClick={() => {
                      setError('');
                      if (loginMethod === 'qr') {
                        initializeScanner();
                      }
                    }}
                    className="text-blue-600 underline"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Student Selection UI */}
          {multipleMatches && matchingStudents.length > 0 ? (
            <div className="mt-8 space-y-6">
              <div className="text-center text-sm font-medium text-gray-700">
                Multiple accounts found with these credentials.
                Please select your account:
              </div>

              <div className="space-y-3">
                {matchingStudents.map((student, index) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelection(index)}
                    disabled={loading || isNavigating}
                    className="w-full flex justify-between items-center px-4 py-3 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold">{student.name}</span>
                      <span className="text-xs text-gray-500">
                        Class: {student.className} | Roll: {student.rollNumber}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.schoolName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Toggle between login methods */}
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleLoginMethod()}
                  disabled={isNavigating || loading}
                  className={`w-1/2 py-2 px-4 text-sm font-medium rounded-l-md ${
                    loginMethod === 'credentials'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } ${(isNavigating || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Username & Password
                </button>
                <button
                  type="button"
                  onClick={() => toggleLoginMethod()}
                  disabled={isNavigating || loading}
                  className={`w-1/2 py-2 px-4 text-sm font-medium rounded-r-md ${
                    loginMethod === 'qr'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } ${(isNavigating || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Scan QR Code
                </button>
              </div>

              {/* Username & Password Login Form */}
              {loginMethod === 'credentials' && (
                <form className="mt-8 space-y-6" onSubmit={handleCredentialLogin}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isNavigating || loading}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isNavigating || loading}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading || isNavigating}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : 'Sign in'}
                    </button>
                  </div>
                </form>
              )}

              {/* QR Code Scanner */}
              {loginMethod === 'qr' && (
                <div className="mt-8" ref={qrContainerRef}>
                  <div className="mb-4 text-center text-sm text-gray-500">
                    Scan the QR code provided by your teacher
                  </div>
                  <div className="overflow-hidden rounded-lg bg-gray-100 aspect-square relative">
                    {loading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
                        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : (
                      <>
                        <div id="qr-reader" className="w-full h-full"></div>
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-center text-gray-500">
                    Make sure the QR code is within the scanning area and well-lit
                  </div>
                  {error && error.includes('camera') && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => {
                          setError('');
                          initializeScanner();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Retry Camera Access
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}