'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { AuthProviderWrapper } from "./components/AuthProviderWrapper";
import "./globals.css";
import { StudentProvider } from './lib/studentContext';
import NetworkStatus from './components/NetworkStatus';
import { useState, useEffect } from 'react';

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
            {children}
          </AuthProviderWrapper>
        </StudentProvider>
      </body>
    </html>
  );
}