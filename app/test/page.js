'use client';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>This is a test page to check if routing is working correctly.</p>

      <div className="mt-4">
        <a
          href="/dashboard"
          className="px-4 py-2 bg-blue-500 text-white rounded inline-block mt-4"
        >
          Go to Dashboard (using href)
        </a>
      </div>

      <div className="mt-4">
        <a
          href="/dashboard/login"
          className="px-4 py-2 bg-green-500 text-white rounded inline-block mt-4"
        >
          Go to Login (using href)
        </a>
      </div>
    </div>
  );
}