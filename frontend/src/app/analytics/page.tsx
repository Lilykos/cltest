'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, subDays, startOfMonth } from 'date-fns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { WeeklySummary, MonthlySummary } from '@/types';

const COLORS = {
  protein: '#22c55e',
  carbs: '#eab308',
  fat: '#f97316',
  fiber: '#a855f7',
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(() => {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadData();
      }
    });
  }, [isAuthenticated, view]);

  const loadData = async () => {
    try {
      if (view === 'week') {
        const startDate = subDays(new Date(), 6).toISOString().split('T')[0];
        const data = await api.getWeeklySummary(startDate);
        setWeeklySummary(data);
      } else {
        const today = new Date();
        const data = await api.getMonthlySummary(today.getFullYear(), today.getMonth() + 1);
        setMonthlySummary(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareDailyData = () => {
    const summary = view === 'week' ? weeklySummary : monthlySummary;
    if (!summary) return [];

    return Object.entries(summary.daily_data).map(([date, data]) => ({
      date: format(new Date(date), 'MMM d'),
      calories: Math.round(data.calories),
      protein: Math.round(data.protein),
      carbs: Math.round(data.carbs),
      fat: Math.round(data.fat),
      fiber: Math.round(data.fiber),
    }));
  };

  const prepareMacroDistribution = () => {
    const summary = view === 'week' ? weeklySummary : monthlySummary;
    if (!summary) return [];

    return [
      { name: 'Protein', value: Math.round(summary.averages.protein), color: COLORS.protein },
      { name: 'Carbs', value: Math.round(summary.averages.carbs), color: COLORS.carbs },
      { name: 'Fat', value: Math.round(summary.averages.fat), color: COLORS.fat },
    ];
  };

  const dailyData = prepareDailyData();
  const macroDistribution = prepareMacroDistribution();
  const summary = view === 'week' ? weeklySummary : monthlySummary;

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
            <Link href="/dashboard" className="text-xl font-bold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Nutrition Analytics</h1>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-md ${
                view === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-md ${
                view === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {summary && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Avg Calories</p>
                <p className="text-3xl font-bold text-primary-600">
                  {Math.round(summary.averages.calories)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Avg Protein</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(summary.averages.protein)}g
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Avg Carbs</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {Math.round(summary.averages.carbs)}g
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Avg Fat</p>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.round(summary.averages.fat)}g
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-3xl font-bold text-purple-600">
                  {summary.total_entries}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Calorie Trend */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Calorie Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="calories" stroke="#0ea5e9" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Macro Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Average Macro Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={macroDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}g`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {macroDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Macro Breakdown Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Daily Macro Breakdown</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="protein" fill={COLORS.protein} name="Protein (g)" />
                  <Bar dataKey="carbs" fill={COLORS.carbs} name="Carbs (g)" />
                  <Bar dataKey="fat" fill={COLORS.fat} name="Fat (g)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fiber Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Fiber Intake</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="fiber" stroke={COLORS.fiber} strokeWidth={2} name="Fiber (g)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {!summary && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No data available for this period. Start logging your meals!</p>
            <Link
              href="/chat"
              className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Log Food
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
