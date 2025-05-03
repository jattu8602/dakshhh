'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStudent } from '../../lib/studentContext';
import { setCookie } from 'cookies-next';
// Instead of using the external package, we'll create a mock implementation
// import { QrReader } from 'react-qr-reader';

export default function StudentLogin() {
  const router = useRouter();
  const { login, loginWithQR, error: authError, loading: authLoading } = useStudent();
  const [loginMethod, setLoginMethod] = useState('credentials'); // 'credentials' or 'qr'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set error from auth context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Toggle login method
  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === 'credentials' ? 'qr' : 'credentials');
    setError('');
  };

  // Handle login with credentials
  const handleCredentialLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Authenticate with Firebase using context
      const result = await login(username, password);

      if (result.success) {
        // Store a flag to indicate login is complete but onboarding isn't
        localStorage.setItem('loginCompleted', 'true');
        localStorage.setItem('onboardingStep', 'questions');

        // Set cookie for middleware - explicitly set to false until questions are completed
        setCookie('onboarded', 'false', {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/'
        });

        // Redirect to questions page after successful login
        router.push('/onboarding/questions');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes - simulate QR scan after 3 seconds
  useEffect(() => {
    if (loginMethod === 'qr') {
      const timer = setTimeout(() => {
        // Simulate successful QR scan with mock QR data
        const mockQrData = JSON.stringify({
          username: 'student123',
          password: 'password123'
        });

        setLoading(true);

        // Attempt to authenticate with QR data
        loginWithQR(mockQrData)
          .then(result => {
            if (result.success) {
              // Store a flag to indicate login is complete but onboarding isn't
              localStorage.setItem('loginCompleted', 'true');
              localStorage.setItem('onboardingStep', 'questions');

              // Set cookie for middleware - explicitly set to false until questions are completed
              setCookie('onboarded', 'false', {
                maxAge: 30 * 24 * 60 * 60, // 30 days
                path: '/'
              });

              // Redirect to questions page for final step in onboarding flow
              router.push('/onboarding/questions');
            } else {
              setError(result.error || 'QR authentication failed');
            }
          })
          .catch(err => {
            console.error('QR login error:', err);
            setError('Failed to authenticate with QR code');
          })
          .finally(() => {
            setLoading(false);
          });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loginMethod, router, loginWithQR]);

  return (
    <div className="min-h-screen flex flex-col">
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

          {/* Toggle between login methods */}
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setLoginMethod('credentials')}
              className={`w-1/2 py-2 px-4 text-sm font-medium rounded-l-md ${
                loginMethod === 'credentials'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Username & Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('qr')}
              className={`w-1/2 py-2 px-4 text-sm font-medium rounded-r-md ${
                loginMethod === 'qr'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Scan QR Code
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
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

          {/* QR Code Scanner (Mock) */}
          {loginMethod === 'qr' && (
            <div className="mt-8">
              <div className="mb-4 text-center text-sm text-gray-500">
                Scan the QR code provided by your teacher
              </div>
              <div className="overflow-hidden rounded-lg bg-gray-100 aspect-square relative">
                {/* Mock camera view */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-900 opacity-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {loading ? (
                      <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="h-10 w-10 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <p className="text-sm text-gray-700">Scanning for QR code...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}