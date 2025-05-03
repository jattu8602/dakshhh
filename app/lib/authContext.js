'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

// Create an authentication context
const AuthContext = createContext({});

// Authentication provider component
export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);

  // Login function using NextAuth
  const login = async (email, password) => {
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    setError(null);
    try {
      await signOut({ redirect: false });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // For testing purposes/development only
  const devLogin = async () => {
    await signIn('credentials', {
      redirect: false,
      email: 'admin@example.com',
      password: 'password123',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        loading: status === 'loading',
        isAuthenticated: status === 'authenticated',
        error,
        login,
        logout,
        devLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth
export function useAuth() {
  return useContext(AuthContext);
}