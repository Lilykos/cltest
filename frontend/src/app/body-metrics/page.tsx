'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { BodyMetric } from '@/types';

export default function BodyMetricsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    checkAuth().then(() => {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadMetrics();
      }
    });
  }, [isAuthenticated]);

  const loadMetrics = async () => {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      const data = await api.getBodyMetrics({
        start_date: thirtyDaysAgo,
        limit: 100,
      });
      setMetrics(data.reverse()); // Newest last for chart
    } catch (error) {
      console.error('Failed to load body metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();

    const bmi = weight ? calculateBMI(parseFloat(weight), 1.75) : undefined; // Assuming 1.75m height

    try {
      await api.createBodyMetric({
        measured_at: new Date(measuredAt).toISOString(),
        weight_kg: weight ? parseFloat(weight) : undefined,
        body_fat_percentage: bodyFat ? parseFloat(bodyFat) : undefined,
        muscle_mass_kg: muscleMass ? parseFloat(muscleMass) : undefined,
        bmi,
        notes,
      });

      // Reset form
      setMeasuredAt(new Date().toISOString().split('T')[0]);
      setWeight('');
      setBodyFat('');
      setMuscleMass('');
      setNotes('');
      setShowAddForm(false);

      // Reload metrics
      loadMetrics();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to add body metric');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await api.deleteBodyMetric(id);
      setMetrics(metrics.filter(m => m.id !== id));
    } catch (error) {
      alert('Failed to delete metric');
    }
  };

  const calculateBMI = (weightKg: number, heightM: number) => {
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  };

  // Prepare chart data
  const chartData = metrics.map(m => ({
    date: format(parseISO(m.measured_at), 'MMM d'),
    weight: m.weight_kg ? parseFloat(m.weight_kg.toString()) : null,
    bodyFat: m.body_fat_percentage ? parseFloat(m.body_fat_percentage.toString()) : null,
    muscleMass: m.muscle_mass_kg ? parseFloat(m.muscle_mass_kg.toString()) : null,
  }));

  const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;

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
          <h1 className="text-3xl font-bold">Body Metrics</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {showAddForm ? 'Cancel' : 'Add Measurement'}
          </button>
        </div>

        {/* Current Stats */}
        {latestMetric && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {latestMetric.weight_kg && (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-3xl font-bold text-primary-600">
                  {latestMetric.weight_kg} kg
                </p>
              </div>
            )}
            {latestMetric.body_fat_percentage && (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Body Fat</p>
                <p className="text-3xl font-bold text-orange-600">
                  {latestMetric.body_fat_percentage}%
                </p>
              </div>
            )}
            {latestMetric.muscle_mass_kg && (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Muscle Mass</p>
                <p className="text-3xl font-bold text-green-600">
                  {latestMetric.muscle_mass_kg} kg
                </p>
              </div>
            )}
            {latestMetric.bmi && (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">BMI</p>
                <p className="text-3xl font-bold text-purple-600">
                  {latestMetric.bmi}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add Measurement Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Measurement</h2>
            <form onSubmit={handleAddMetric} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={measuredAt}
                    onChange={(e) => setMeasuredAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body Fat (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Muscle Mass (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Measurement
              </button>
            </form>
          </div>
        )}

        {/* Charts */}
        {metrics.length > 0 ? (
          <div className="space-y-6">
            {/* Weight Chart */}
            {chartData.some(d => d.weight !== null) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Weight Trend (30 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#0ea5e9" strokeWidth={2} name="Weight (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Body Composition Chart */}
            {(chartData.some(d => d.bodyFat !== null) || chartData.some(d => d.muscleMass !== null)) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Body Composition Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {chartData.some(d => d.bodyFat !== null) && (
                      <Line type="monotone" dataKey="bodyFat" stroke="#f97316" strokeWidth={2} name="Body Fat (%)" />
                    )}
                    {chartData.some(d => d.muscleMass !== null) && (
                      <Line type="monotone" dataKey="muscleMass" stroke="#22c55e" strokeWidth={2} name="Muscle Mass (kg)" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Metrics Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Measurement History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Body Fat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Muscle Mass</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BMI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.slice().reverse().map(metric => (
                      <tr key={metric.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {format(parseISO(metric.measured_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {metric.weight_kg ? `${metric.weight_kg} kg` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {metric.body_fat_percentage ? `${metric.body_fat_percentage}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {metric.muscle_mass_kg ? `${metric.muscle_mass_kg} kg` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {metric.bmi || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDelete(metric.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No body metrics recorded yet. Add your first measurement!</p>
          </div>
        )}
      </div>
    </div>
  );
}
