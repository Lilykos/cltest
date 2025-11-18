import axios, { AxiosInstance } from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  FoodItem,
  FoodLog,
  CreateFoodLog,
  NaturalLanguageFoodLog,
  Recipe,
  CreateRecipe,
  BodyMetric,
  CreateBodyMetric,
  APIKey,
  CreateAPIKey,
  DailySummary,
  WeeklySummary,
  MonthlySummary,
  BodyMetricsTrends,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth
  async register(data: RegisterData): Promise<User> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.client.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Food Items
  async getFoodItems(params?: { skip?: number; limit?: number; search?: string }): Promise<FoodItem[]> {
    const response = await this.client.get('/food-items', { params });
    return response.data;
  }

  async getFoodItem(id: string): Promise<FoodItem> {
    const response = await this.client.get(`/food-items/${id}`);
    return response.data;
  }

  async createFoodItem(data: Partial<FoodItem>): Promise<FoodItem> {
    const response = await this.client.post('/food-items', data);
    return response.data;
  }

  async updateFoodItem(id: string, data: Partial<FoodItem>): Promise<FoodItem> {
    const response = await this.client.patch(`/food-items/${id}`, data);
    return response.data;
  }

  async deleteFoodItem(id: string): Promise<void> {
    await this.client.delete(`/food-items/${id}`);
  }

  // Food Logs
  async getFoodLogs(params?: {
    start_date?: string;
    end_date?: string;
    meal_type?: string;
    skip?: number;
    limit?: number;
  }): Promise<FoodLog[]> {
    const response = await this.client.get('/food-logs', { params });
    return response.data;
  }

  async getFoodLog(id: string): Promise<FoodLog> {
    const response = await this.client.get(`/food-logs/${id}`);
    return response.data;
  }

  async createFoodLog(data: CreateFoodLog): Promise<FoodLog> {
    const response = await this.client.post('/food-logs', data);
    return response.data;
  }

  async createFoodLogNaturalLanguage(data: NaturalLanguageFoodLog): Promise<FoodLog[]> {
    const response = await this.client.post('/food-logs/natural-language', data);
    return response.data;
  }

  async updateFoodLog(id: string, data: Partial<CreateFoodLog>): Promise<FoodLog> {
    const response = await this.client.patch(`/food-logs/${id}`, data);
    return response.data;
  }

  async deleteFoodLog(id: string): Promise<void> {
    await this.client.delete(`/food-logs/${id}`);
  }

  // Recipes
  async getRecipes(params?: { skip?: number; limit?: number; search?: string }): Promise<Recipe[]> {
    const response = await this.client.get('/recipes', { params });
    return response.data;
  }

  async getRecipe(id: string): Promise<Recipe> {
    const response = await this.client.get(`/recipes/${id}`);
    return response.data;
  }

  async createRecipe(data: CreateRecipe): Promise<Recipe> {
    const response = await this.client.post('/recipes', data);
    return response.data;
  }

  async updateRecipe(id: string, data: Partial<CreateRecipe>): Promise<Recipe> {
    const response = await this.client.patch(`/recipes/${id}`, data);
    return response.data;
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.client.delete(`/recipes/${id}`);
  }

  // Body Metrics
  async getBodyMetrics(params?: {
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }): Promise<BodyMetric[]> {
    const response = await this.client.get('/body-metrics', { params });
    return response.data;
  }

  async getBodyMetric(id: string): Promise<BodyMetric> {
    const response = await this.client.get(`/body-metrics/${id}`);
    return response.data;
  }

  async createBodyMetric(data: CreateBodyMetric): Promise<BodyMetric> {
    const response = await this.client.post('/body-metrics', data);
    return response.data;
  }

  async updateBodyMetric(id: string, data: Partial<CreateBodyMetric>): Promise<BodyMetric> {
    const response = await this.client.patch(`/body-metrics/${id}`, data);
    return response.data;
  }

  async deleteBodyMetric(id: string): Promise<void> {
    await this.client.delete(`/body-metrics/${id}`);
  }

  // API Keys
  async getAPIKeys(): Promise<APIKey[]> {
    const response = await this.client.get('/api-keys');
    return response.data;
  }

  async getAPIKey(provider: string): Promise<APIKey> {
    const response = await this.client.get(`/api-keys/${provider}`);
    return response.data;
  }

  async createAPIKey(data: CreateAPIKey): Promise<APIKey> {
    const response = await this.client.post('/api-keys', data);
    return response.data;
  }

  async updateAPIKey(provider: string, data: Partial<CreateAPIKey>): Promise<APIKey> {
    const response = await this.client.patch(`/api-keys/${provider}`, data);
    return response.data;
  }

  async deleteAPIKey(provider: string): Promise<void> {
    await this.client.delete(`/api-keys/${provider}`);
  }

  // Analytics
  async getDailySummary(date: string): Promise<DailySummary> {
    const response = await this.client.get('/analytics/daily-summary', {
      params: { target_date: date },
    });
    return response.data;
  }

  async getWeeklySummary(startDate: string): Promise<WeeklySummary> {
    const response = await this.client.get('/analytics/weekly-summary', {
      params: { start_date: startDate },
    });
    return response.data;
  }

  async getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
    const response = await this.client.get('/analytics/monthly-summary', {
      params: { year, month },
    });
    return response.data;
  }

  async getBodyMetricsTrends(startDate: string, endDate: string): Promise<BodyMetricsTrends> {
    const response = await this.client.get('/analytics/body-metrics-trends', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  }
}

export const api = new APIClient();
