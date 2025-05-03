'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Learn() {
  const router = useRouter();

  // Go to login for the next step in onboarding
  const goToLogin = () => {
    router.push('/onboarding/login');
  };

  return (
    <div className="min-h-screen relative">
      {/* Close button */}
      <button
        onClick={goToLogin}
        className="absolute top-6 right-6 z-10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="flex flex-col min-h-screen px-6 py-12">
        <div className="flex-1 flex flex-col">
          {/* Main content - Image */}
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48">
              <Image
                src="/images/learn.png"
                alt="Student reading a book"
                width={192}
                height={192}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title and description */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Learn with fun, without any limits</h1>
          </div>

          {/* Features list */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Unlock all topic courses</h3>
                <p className="text-sm text-gray-500">100+ courses available for full use</p>
              </div>
              <div className="ml-auto">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">No ads</h3>
                <p className="text-sm text-gray-500">Ad-free learning experience</p>
              </div>
              <div className="ml-auto">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Adding new words</h3>
                <p className="text-sm text-gray-500">Make a list of your favorite words for learning</p>
              </div>
              <div className="ml-auto">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Personalized Practice</h3>
                <p className="text-sm text-gray-500">Unlock personalization features to further your deep learning</p>
              </div>
              <div className="ml-auto">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Unlimited translations</h3>
                <p className="text-sm text-gray-500">Instantly translate text to minimize any language barriers</p>
              </div>
              <div className="ml-auto">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <p className="text-center text-sm text-gray-500 mb-4">
              Support our mission to make learning fun
            </p>
            <p className="text-center text-xs text-gray-400 mb-6">
              Learning is free as long as we have paying users
            </p>
            <button
              onClick={goToLogin}
              className="w-full py-3 bg-black text-white rounded-md font-medium"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}