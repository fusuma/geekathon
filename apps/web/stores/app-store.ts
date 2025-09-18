import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Market, Language, Label } from '@repo/shared';
import { MARKET_CONFIG } from '@/lib/market-config';

// Types
export interface ProductData {
  name: string;
  ingredients: string[];
  market: Market;
  nutrition: {
    energy: { per100g: { value: number; unit: string } };
    fat: { per100g: { value: number; unit: string } };
    saturatedFat: { per100g: { value: number; unit: string } };
    carbohydrates: { per100g: { value: number; unit: string } };
    sugars: { per100g: { value: number; unit: string } };
    protein: { per100g: { value: number; unit: string } };
    salt: { per100g: { value: number; unit: string } };
    fiber: { per100g: { value: number; unit: string } };
  };
}

export interface AppState {
  // Product data
  productData: ProductData | null;
  
  // UI state
  viewState: 'input' | 'generating' | 'results';
  isGenerating: boolean;
  generationProgress: number;
  
  // Results
  labels: Label[];
  selectedMarkets: Market[];
  primaryMarket: Market | null;
  comparisonMode: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  setProductData: (data: ProductData) => void;
  setViewState: (state: 'input' | 'generating' | 'results') => void;
  setGenerating: (generating: boolean) => void;
  setProgress: (progress: number) => void;
  setLabels: (labels: Label[]) => void;
  setSelectedMarkets: (markets: Market[]) => void;
  setPrimaryMarket: (market: Market | null) => void;
  setComparisonMode: (mode: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  resetForm: () => void; // Reset only form data, keep labels
}

// Initial state
const initialState = {
  productData: null,
  viewState: 'input' as const,
  isGenerating: false,
  generationProgress: 0,
  labels: [],
  selectedMarkets: ['US', 'EU'], // Default to US and EU markets
  primaryMarket: 'US', // Default to US as primary
  comparisonMode: false,
  error: null,
};

// Store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setProductData: (data) => set({ productData: data }),
      setViewState: (state) => set({ viewState: state }),
      setGenerating: (generating) => set({ isGenerating: generating }),
      setProgress: (progress) => set({ generationProgress: progress }),
      setLabels: (labels) => set({ labels }),
      setSelectedMarkets: (markets) => set({ selectedMarkets: markets }),
      setPrimaryMarket: (market) => set({ primaryMarket: market }),
      setComparisonMode: (mode) => set({ comparisonMode: mode }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
      resetForm: () => set({ 
        productData: null, 
        viewState: 'input', 
        isGenerating: false, 
        generationProgress: 0,
        selectedMarkets: ['US', 'EU'],
        primaryMarket: 'US',
        error: null 
      }),
    }),
    {
      name: 'smartlabel-store',
      partialize: (state) => ({
        productData: state.productData,
        // Remove selectedMarkets, primaryMarket, comparisonMode from persistence
        // to prevent hydration mismatches
      }),
    }
  )
);

// Simple selectors - no custom hooks to avoid re-render issues
export const selectProductData = (state: AppState) => state.productData;
export const selectViewState = (state: AppState) => state.viewState;
export const selectIsGenerating = (state: AppState) => state.isGenerating;
export const selectProgress = (state: AppState) => state.generationProgress;
export const selectLabels = (state: AppState) => state.labels;
export const selectSelectedMarkets = (state: AppState) => state.selectedMarkets;
export const selectPrimaryMarket = (state: AppState) => state.primaryMarket;
export const selectComparisonMode = (state: AppState) => state.comparisonMode;
export const selectError = (state: AppState) => state.error;

// Re-export MARKET_CONFIG for convenience
export { MARKET_CONFIG };