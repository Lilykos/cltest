'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkAuth().then(() => {
      if (!isAuthenticated) {
        router.push('/login');
      }
    });
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const foodLogs = await api.createFoodLogNaturalLanguage({
        message,
        timestamp: new Date().toISOString(),
      });

      setSuccess(`Successfully logged ${foodLogs.length} food item(s)!`);
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to log food. Make sure your API keys are set up in Settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-xl font-bold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Log Food with Natural Language</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Examples:</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• "I had 2 slices of edam cheese and a banana for breakfast"</li>
            <li>• "Ate a chicken breast with 200g of rice for lunch"</li>
            <li>• "Had 100g of almonds as a snack"</li>
            <li>• "Dinner was salmon with broccoli"</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What did you eat?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 h-32"
              placeholder="e.g., I had 2 eggs, toast with peanut butter, and a banana for breakfast"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 font-medium"
          >
            {loading ? 'Processing...' : 'Log Food'}
          </button>
        </form>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Note</h3>
          <p className="text-sm text-yellow-800">
            Make sure you have set up your LLM API keys (OpenAI, Claude, or DeepSeek) and Tavily API key in the Settings page before logging food.
          </p>
          <Link
            href="/settings"
            className="inline-block mt-3 text-sm text-yellow-900 font-medium hover:underline"
          >
            Go to Settings →
          </Link>
        </div>
      </div>
    </div>
  );
}
