'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { AuthProviderWrapper } from "./components/AuthProviderWrapper";
import "./globals.css";
import { StudentProvider } from './lib/studentContext';
import NetworkStatus from './components/NetworkStatus';
import { useState, useEffect } from 'react';
import InstallPWA from './components/InstallPWA';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ClientLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  // Only show NetworkStatus component after the component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StudentProvider>
          <AuthProviderWrapper>
            {mounted && <NetworkStatus />}
            <InstallPWA />
            {/* Global toast notifications */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#4F46E5',
                  color: '#fff',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#FFFFFF',
                    secondary: '#4F46E5',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                  iconTheme: {
                    primary: '#FFFFFF',
                    secondary: '#EF4444',
                  },
                },
              }}
            />
            {children}
          </AuthProviderWrapper>
        </StudentProvider>
      </body>
    </html>
  );
}