'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { Recipe, FoodItem } from '@/types';

export default function RecipesPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchFood, setSearchFood] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<Array<{ food_item_id: string; amount_grams: number; notes?: string }>>([]);

  useEffect(() => {
    checkAuth().then(() => {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        loadRecipes();
        loadFoodItems();
      }
    });
  }, [isAuthenticated]);

  const loadRecipes = async () => {
    try {
      const data = await api.getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFoodItems = async () => {
    try {
      const data = await api.getFoodItems({ limit: 500 });
      setFoodItems(data);
    } catch (error) {
      console.error('Failed to load food items:', error);
    }
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ingredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }

    try {
      await api.createRecipe({
        name,
        description,
        servings,
        instructions,
        is_public: false,
        ingredients,
      });

      // Reset form
      setName('');
      setDescription('');
      setServings(1);
      setInstructions('');
      setIngredients([]);
      setShowCreateForm(false);

      // Reload recipes
      loadRecipes();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create recipe');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await api.deleteRecipe(id);
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (error) {
      alert('Failed to delete recipe');
    }
  };

  const addIngredient = (foodId: string) => {
    if (ingredients.some(i => i.food_item_id === foodId)) {
      alert('This ingredient is already added');
      return;
    }

    setIngredients([...ingredients, { food_item_id: foodId, amount_grams: 100 }]);
    setSearchFood('');
  };

  const removeIngredient = (foodId: string) => {
    setIngredients(ingredients.filter(i => i.food_item_id !== foodId));
  };

  const updateIngredientAmount = (foodId: string, amount: number) => {
    setIngredients(ingredients.map(i =>
      i.food_item_id === foodId ? { ...i, amount_grams: amount } : i
    ));
  };

  const calculateRecipeTotals = (recipe: Recipe) => {
    let totalCals = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    recipe.ingredients.forEach(ing => {
      if (ing.food_item) {
        const multiplier = ing.amount_grams / 100;
        totalCals += ing.food_item.calories_per_100g * multiplier;
        totalProtein += ing.food_item.protein_per_100g * multiplier;
        totalCarbs += ing.food_item.carbs_per_100g * multiplier;
        totalFat += ing.food_item.fat_per_100g * multiplier;
      }
    });

    return {
      calories: Math.round(totalCals / recipe.servings),
      protein: Math.round(totalProtein / recipe.servings),
      carbs: Math.round(totalCarbs / recipe.servings),
      fat: Math.round(totalFat / recipe.servings),
    };
  };

  const filteredFoodItems = foodItems.filter(f =>
    f.name.toLowerCase().includes(searchFood.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Recipe'}
          </button>
        </div>

        {/* Create Recipe Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Recipe</h2>
            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servings *
                  </label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                />
              </div>

              {/* Ingredients Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients *
                </label>

                {/* Add Ingredient */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchFood}
                    onChange={(e) => setSearchFood(e.target.value)}
                    placeholder="Search for food to add..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                  />
                  {searchFood && (
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                      {filteredFoodItems.slice(0, 10).map(food => (
                        <button
                          key={food.id}
                          type="button"
                          onClick={() => addIngredient(food.id)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          {food.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Ingredients */}
                {ingredients.length > 0 && (
                  <div className="space-y-2">
                    {ingredients.map(ing => {
                      const food = foodItems.find(f => f.id === ing.food_item_id);
                      return (
                        <div key={ing.food_item_id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                          <span className="flex-1">{food?.name}</span>
                          <input
                            type="number"
                            value={ing.amount_grams}
                            onChange={(e) => updateIngredientAmount(ing.food_item_id, parseInt(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded"
                            min="1"
                          />
                          <span className="text-sm text-gray-600">g</span>
                          <button
                            type="button"
                            onClick={() => removeIngredient(ing.food_item_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Create Recipe
              </button>
            </form>
          </div>
        )}

        {/* Recipes List */}
        {recipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No recipes yet. Create your first recipe!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => {
              const totals = calculateRecipeTotals(recipe);
              return (
                <div key={recipe.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">{recipe.name}</h3>
                  {recipe.description && (
                    <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Per Serving:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Calories:</span> {totals.calories}
                      </div>
                      <div>
                        <span className="text-gray-600">Protein:</span> {totals.protein}g
                      </div>
                      <div>
                        <span className="text-gray-600">Carbs:</span> {totals.carbs}g
                      </div>
                      <div>
                        <span className="text-gray-600">Fat:</span> {totals.fat}g
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Ingredients ({recipe.ingredients.length}):
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {recipe.ingredients.slice(0, 3).map(ing => (
                        <li key={ing.id}>
                          • {ing.food_item?.name} ({ing.amount_grams}g)
                        </li>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <li className="text-gray-500 italic">
                          ... and {recipe.ingredients.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
