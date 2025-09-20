// API service for SmartLabel AI
// This will use the Amplify API endpoint when deployed

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://jsonplaceholder.typicode.com' // Using a public API for demo
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
    // For now, return mock data that works
    const mockLabelData: NutritionLabelData = {
      nutrition_facts: {
        serving_size: productData.serving_size,
        servings_per_container: productData.servings_per_container,
        calories: productData.calories,
        nutrients: [
          { name: 'Total Fat', amount: productData.total_fat, unit: 'g', daily_value: '6%' },
          { name: 'Saturated Fat', amount: '2g', unit: 'g', daily_value: '10%' },
          { name: 'Trans Fat', amount: '0g', unit: 'g', daily_value: '0%' },
          { name: 'Cholesterol', amount: '30mg', unit: 'mg', daily_value: '10%' },
          { name: 'Sodium', amount: '200mg', unit: 'mg', daily_value: '9%' },
          { name: 'Total Carbohydrate', amount: '15g', unit: 'g', daily_value: '5%' },
          { name: 'Dietary Fiber', amount: '3g', unit: 'g', daily_value: '11%' },
          { name: 'Total Sugars', amount: '8g', unit: 'g', daily_value: '16%' },
          { name: 'Protein', amount: productData.protein, unit: 'g', daily_value: '40%' }
        ],
        vitamins_minerals: [
          { name: 'Vitamin D', amount: '2mcg', unit: 'mcg', daily_value: '10%' },
          { name: 'Calcium', amount: '200mg', unit: 'mg', daily_value: '15%' },
          { name: 'Iron', amount: '2mg', unit: 'mg', daily_value: '11%' },
          { name: 'Potassium', amount: '300mg', unit: 'mg', daily_value: '6%' }
        ]
      },
      ingredients: productData.ingredients,
      allergens: 'Contains milk',
      certifications: market === 'halal' ? ['Halal Certified'] : [],
      regulatory_notes: this.getMarketNotes(market),
      market_specific_warnings: this.getMarketWarnings(market),
      market: market,
      generated_by: 'SmartLabel AI'
    };

    return {
      success: true,
      data: mockLabelData
    };
  }

  private getMarketNotes(market: string): string {
    const notes = {
      spain: 'Complies with EU Regulation (EU) No 1169/2011',
      angola: 'Complies with ARSO standards for African markets',
      macau: 'Complies with Chinese/Macau SAR food labeling requirements',
      brazil: 'Complies with ANVISA Resolution RDC 429/2020',
      halal: 'Halal certified ingredients and processing'
    };
    return notes[market as keyof typeof notes] || 'Standard nutrition labeling';
  }

  private getMarketWarnings(market: string): string {
    const warnings = {
      spain: 'May contain traces of nuts and soy',
      angola: 'Contains allergens: milk, soy',
      macau: '过敏原：牛奶、大豆',
      brazil: 'ALÉRGENOS: Contém leite e soja',
      halal: 'Halal certified - no alcohol or pork derivatives'
    };
    return warnings[market as keyof typeof warnings] || 'Contains common allergens';
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
