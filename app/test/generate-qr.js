'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function GenerateQR() {
  const [username, setUsername] = useState('student123');
  const [password, setPassword] = useState('password123');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);

      // Create data object in the same format as authenticateStudentByQR expects
      const data = JSON.stringify({ username, password });

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(data);
      setQrCode(qrDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      alert('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code on initial load with defaults
  useEffect(() => {
    generateQR();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Test QR Code Generator</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <button
          onClick={generateQR}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 mb-6"
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>

        {qrCode && (
          <div className="flex flex-col items-center">
            <div className="mb-4 border p-2 bg-white rounded">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Scan this QR code with the login scanner to test
            </p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p><strong>Note:</strong> You need to have a user with these credentials in your Firebase database for the login to work.</p>
        </div>
      </div>
    </div>
  );
}