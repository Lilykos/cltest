// User types
export interface User {
  id: string;
  username: string;
  email: string;
  settings: Record<string, any>;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Food types
export interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  source?: string;
  created_at: string;
  last_updated: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_item_id?: string;
  recipe_id?: string;
  amount_grams: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  logged_at: string;
  notes?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  created_at: string;
  food_item?: FoodItem;
  recipe?: Recipe;
}

export interface CreateFoodLog {
  food_item_id?: string;
  recipe_id?: string;
  amount_grams: number;
  meal_type: string;
  logged_at: string;
  notes?: string;
}

export interface NaturalLanguageFoodLog {
  message: string;
  timestamp?: string;
}

// Recipe types
export interface RecipeIngredient {
  id: string;
  food_item_id: string;
  amount_grams: number;
  notes?: string;
  food_item?: FoodItem;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  servings: number;
  instructions?: string;
  is_public: boolean;
  created_at: string;
  ingredients: RecipeIngredient[];
}

export interface CreateRecipe {
  name: string;
  description?: string;
  servings: number;
  instructions?: string;
  is_public: boolean;
  ingredients: Array<{
    food_item_id: string;
    amount_grams: number;
    notes?: string;
  }>;
}

// Body Metrics types
export interface BodyMetric {
  id: string;
  user_id: string;
  measured_at: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  bmi?: number;
  notes?: string;
  created_at: string;
}

export interface CreateBodyMetric {
  measured_at: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  bmi?: number;
  notes?: string;
}

// API Key types
export interface APIKey {
  id: string;
  user_id: string;
  provider: 'openai' | 'anthropic' | 'deepseek' | 'tavily';
  is_active: boolean;
  created_at: string;
}

export interface CreateAPIKey {
  provider: string;
  api_key: string;
}

// Analytics types
export interface DailySummary {
  date: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals_by_type: Record<string, {
    count: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>;
  num_entries: number;
}

export interface WeeklySummary {
  start_date: string;
  end_date: string;
  daily_data: Record<string, {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    count: number;
  }>;
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  total_entries: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  start_date: string;
  end_date: string;
  daily_data: Record<string, {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    count: number;
  }>;
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  total_entries: number;
}

export interface BodyMetricsTrends {
  start_date: string;
  end_date: string;
  data_points: Array<{
    date: string;
    weight_kg?: number;
    body_fat_percentage?: number;
    muscle_mass_kg?: number;
    bmi?: number;
  }>;
  count: number;
}
