'use client';

import { useState } from 'react';

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createAdmin = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
          secretKey: 'your_super_secret_admin_creation_key'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Admin created successfully! You can now login at /admin with username: "admin" and password: "admin123"');
      } else {
        setError(data.error || 'Failed to create admin');
      }

    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Setup Admin Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            This will create an admin account with username &quot;admin&quot; and password &quot;admin123&quot;
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-blue-800">Admin Credentials</h3>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Username:</strong> admin<br/>
                <strong>Password:</strong> admin123
              </p>
            </div>

            <button
              onClick={createAdmin}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating Admin...' : 'Create Admin Account'}
            </button>

            {message && (
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              <p>After creating the admin, you should delete this page or secure it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
