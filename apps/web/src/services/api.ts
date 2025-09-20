// API service for SmartLabel AI
// This will use the Amplify API endpoint when deployed

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.amplifyapp.com/api' // This will be replaced with actual Amplify API URL
  : 'http://localhost:3001'; // Local development

export interface ProductData {
  name: string;
  serving_size: string;
  servings_per_container: string;
  calories: string;
  total_fat: string;
  protein: string;
  ingredients: string;
}

export interface NutritionLabelData {
  nutrition_facts: {
    serving_size: string;
    servings_per_container: string;
    calories: string;
    nutrients: Array<{
      name: string;
      amount: string;
      unit: string;
      daily_value: string;
      major?: boolean;
      indented?: boolean;
    }>;
    vitamins_minerals?: Array<{
      name: string;
      amount: string;
      unit: string;
      daily_value: string;
    }>;
  };
  ingredients: string;
  allergens: string;
  certifications?: string[];
  regulatory_notes?: string;
  market_specific_warnings?: string;
  market: string;
  generated_by: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ message: string; timestamp: string; version: string }>> {
    return this.request('/hello');
  }

  // Generate nutrition label
  async generateNutritionLabel(
    productData: ProductData,
    market: string = 'spain'
  ): Promise<ApiResponse<NutritionLabelData>> {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify({
        productData,
        market,
      }),
    });
  }

  // Get labels
  async getLabels(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    market: string;
    createdAt: string;
  }>>> {
    return this.request('/labels');
  }

  // Crisis response (if needed)
  async crisisResponse(crisisData: any): Promise<ApiResponse<any>> {
    return this.request('/crisis', {
      method: 'POST',
      body: JSON.stringify(crisisData),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual functions for convenience
export const {
  healthCheck,
  generateNutritionLabel,
  getLabels,
  crisisResponse,
} = apiService;
