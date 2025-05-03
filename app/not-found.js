import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="mb-6 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-2">
          <Link
            href="/"
            className="block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </Link>
          <Link
            href="/test"
            className="block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Go to Test Page
          </Link>
        </div>
      </div>
    </div>
  );
}