'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { FoodItem } from '@/types';

export default function ManualEntryPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState('100');
  const [mealType, setMealType] = useState('breakfast');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth().then(() => {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadFoodItems();
      }
    });
  }, [isAuthenticated]);

  const loadFoodItems = async () => {
    try {
      const data = await api.getFoodItems({ limit: 500 });
      setFoodItems(data);
    } catch (error) {
      console.error('Failed to load food items:', error);
    }
  };

  const filteredFoods = foodItems.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!selectedFood) {
      setError('Please select a food item');
      return;
    }

    try {
      await api.createFoodLog({
        food_item_id: selectedFood.id,
        amount_grams: parseFloat(amount),
        meal_type: mealType,
        logged_at: new Date().toISOString(),
        notes,
      });

      setSuccess('Food logged successfully!');

      // Reset form
      setSelectedFood(null);
      setSearchTerm('');
      setAmount('100');
      setNotes('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to log food');
    }
  };

  const calculateMacros = () => {
    if (!selectedFood || !amount) return null;

    const multiplier = parseFloat(amount) / 100;
    return {
      calories: Math.round(selectedFood.calories_per_100g * multiplier),
      protein: Math.round(selectedFood.protein_per_100g * multiplier),
      carbs: Math.round(selectedFood.carbs_per_100g * multiplier),
      fat: Math.round(selectedFood.fat_per_100g * multiplier),
      fiber: Math.round(selectedFood.fiber_per_100g * multiplier),
    };
  };

  const macros = calculateMacros();

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
        <h1 className="text-3xl font-bold mb-6">Manual Food Entry</h1>

        <div className="bg-white rounded-lg shadow p-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Food Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Food *
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              {/* Search Results */}
              {searchTerm && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white">
                  {filteredFoods.length > 0 ? (
                    filteredFoods.slice(0, 10).map(food => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => {
                          setSelectedFood(food);
                          setSearchTerm('');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                      >
                        <span>{food.name}</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(food.calories_per_100g)} cal/100g
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No foods found</div>
                  )}
                </div>
              )}

              {/* Selected Food */}
              {selectedFood && !searchTerm && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedFood.name}</p>
                    <p className="text-sm text-gray-600">
                      {Math.round(selectedFood.calories_per_100g)} cal/100g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (grams) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Meal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type *
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 h-20"
                placeholder="Add any notes..."
              />
            </div>

            {/* Macro Preview */}
            {macros && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Nutritional Information:</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <p className="font-semibold text-primary-600">{macros.calories}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Protein:</span>
                    <p className="font-semibold text-green-600">{macros.protein}g</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <p className="font-semibold text-yellow-600">{macros.carbs}g</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fat:</span>
                    <p className="font-semibold text-orange-600">{macros.fat}g</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fiber:</span>
                    <p className="font-semibold text-purple-600">{macros.fiber}g</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedFood}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Log Food
            </button>
          </form>

          {/* Quick Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Type to search from {foodItems.length} food items in the database</li>
              <li>• Can't find a food? Use "Log Food" with natural language to add it automatically</li>
              <li>• Common portions: 1 egg ≈ 50g, 1 banana ≈ 120g, 1 chicken breast ≈ 200g</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
