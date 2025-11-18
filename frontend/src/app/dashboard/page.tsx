'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { DailySummary } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(() => {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadDailySummary();
      }
    });
  }, [isAuthenticated]);

  const loadDailySummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await api.getDailySummary(today);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Nutrition Assistant</h1>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-600">Hi, {user?.username}</span>
              <Link
                href="/chat"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Log Food
              </Link>
              <Link
                href="/settings"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Today's Summary</h2>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Macro Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Calories</p>
              <p className="text-3xl font-bold text-primary-600">
                {Math.round(summary.totals.calories)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(summary.totals.protein)}g
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Carbs</p>
              <p className="text-3xl font-bold text-yellow-600">
                {Math.round(summary.totals.carbs)}g
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Fat</p>
              <p className="text-3xl font-bold text-orange-600">
                {Math.round(summary.totals.fat)}g
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Fiber</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(summary.totals.fiber)}g
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/chat"
            className="bg-primary-600 text-white rounded-lg shadow p-6 hover:bg-primary-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Log Food</h3>
            <p className="text-sm opacity-90">Use natural language to log your meals</p>
          </Link>
          <Link
            href="/food-logs"
            className="bg-blue-600 text-white rounded-lg shadow p-6 hover:bg-blue-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Food History</h3>
            <p className="text-sm opacity-90">View and edit your food logs</p>
          </Link>
          <Link
            href="/recipes"
            className="bg-green-600 text-white rounded-lg shadow p-6 hover:bg-green-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Recipes</h3>
            <p className="text-sm opacity-90">Manage your custom recipes</p>
          </Link>
          <Link
            href="/analytics"
            className="bg-orange-600 text-white rounded-lg shadow p-6 hover:bg-orange-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-sm opacity-90">View weekly and monthly trends</p>
          </Link>
          <Link
            href="/body-metrics"
            className="bg-purple-600 text-white rounded-lg shadow p-6 hover:bg-purple-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Body Metrics</h3>
            <p className="text-sm opacity-90">Track your weight and measurements</p>
          </Link>
          <Link
            href="/manual-entry"
            className="bg-teal-600 text-white rounded-lg shadow p-6 hover:bg-teal-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Manual Entry</h3>
            <p className="text-sm opacity-90">Quick form for logging food</p>
          </Link>
          <Link
            href="/settings"
            className="bg-gray-600 text-white rounded-lg shadow p-6 hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-sm opacity-90">Manage API keys and preferences</p>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Set up your API keys in Settings (OpenAI/Claude/DeepSeek + Tavily)</li>
            <li>• Use "Log Food" to add meals using natural language</li>
            <li>• Track your progress with body metrics</li>
            <li>• Create custom recipes for easy logging</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
