'use client';

import { useState, useEffect } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Event handler for online status changes
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      // Hide the status after a delay
      setTimeout(() => setShowStatus(false), 3000);
    };

    // Event handler for offline status changes
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 p-2 text-center text-sm ${
        isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {isOnline ? 'You are back online!' : 'You are currently offline. Some features may be unavailable.'}
    </div>
  );
}