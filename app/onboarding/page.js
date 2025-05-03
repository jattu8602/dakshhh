'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { setCookie } from 'cookies-next';

export default function Onboarding() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCloseButton, setShowCloseButton] = useState(false);

  // Slides content
  const slides = [
    {
      title: "Getting Started",
      description: "Welcome to AppNamehere! 🚀 Explore endless learning opportunities right at your fingertips.",
      image: "/images/getting-started.png"
    },
    {
      title: "Discover",
      description: "Explore curated courses in tech, arts, and more! ✨Find your passion and dive into expert-led lessons.",
      image: "/images/discover.png"
    },
    {
      title: "Connect",
      description: "Join a vibrant learning community! 🌐 Engage with peers, collaborate on projects, and achieve greatness together.",
      image: "/images/connect.png"
    }
  ];

  // Handle next slide
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Go to learn page in the onboarding flow
      router.push('/onboarding/learn');
    }
  };

  // Skip to learn page
  const skipToLearn = () => {
    router.push('/onboarding/learn');
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Main content */}
        <div className="text-center mb-8">
          <div className="mb-6 relative h-64 w-full flex items-center justify-center">
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              width={240}
              height={240}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold mb-4">{slides[currentSlide].title}</h1>
          <p className="text-gray-600">{slides[currentSlide].description}</p>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={handleNext}
          className="w-full py-3 bg-black text-white rounded-md font-medium mb-4"
        >
          Next
        </button>

        {/* Indicator dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                currentSlide === index ? 'bg-black' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Skip button */}
        <div className="text-center mt-6">
          <button
            onClick={skipToLearn}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}