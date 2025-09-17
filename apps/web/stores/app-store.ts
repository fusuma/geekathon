import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Market, Language, Label } from '@repo/shared';

// Generation step tracking
export interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  timestamp?: string;
  duration?: number;
}

// Compliance scoring
export interface ComplianceScore {
  overall: number;
  categories: {
    nutrition: number;
    ingredients: number;
    allergens: number;
    certifications: number;
    legal: number;
  };
  issues: string[];
  recommendations: string[];
}

// App state interface
interface AppState {
  // Market management
  selectedMarkets: Market[];
  primaryMarket: Market;
  comparisonMode: boolean;

  // Generation state
  generationProgress: GenerationStep[];
  isGenerating: boolean;

  // UI preferences
  language: Language;
  theme: 'light' | 'dark';
  complianceView: 'summary' | 'detailed';

  // Generated labels
  labels: Partial<Record<Market, Label | null>>;
  complianceScores: Partial<Record<Market, ComplianceScore>>;

  // Actions
  setSelectedMarkets: (markets: Market[]) => void;
  setPrimaryMarket: (market: Market) => void;
  toggleComparisonMode: () => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setComplianceView: (view: 'summary' | 'detailed') => void;

  // Generation actions
  setGenerationProgress: (steps: GenerationStep[]) => void;
  updateGenerationStep: (stepId: string, updates: Partial<GenerationStep>) => void;
  setIsGenerating: (generating: boolean) => void;

  // Label actions
  setLabel: (market: Market, label: Label | null) => void;
  setComplianceScore: (market: Market, score: ComplianceScore) => void;
  clearLabels: () => void;

  // Utility actions
  resetState: () => void;
}

// Market configuration with display information
export const MARKET_CONFIG = {
  EU: {
    name: 'European Union',
    flag: '🇪🇺',
    language: 'en' as Language,
    description: 'EU food labeling regulations',
  },
  ES: {
    name: 'Spain',
    flag: '🇪🇸',
    language: 'en' as Language,
    description: 'Spanish food safety standards',
  },
  AO: {
    name: 'Angola',
    flag: '🇦🇴',
    language: 'pt' as Language,
    description: 'Angolan food regulations (Portuguese)',
  },
  MO: {
    name: 'Macau',
    flag: '🇲🇴',
    language: 'en' as Language,
    description: 'Macau SAR regulations',
  },
  BR: {
    name: 'Brazil',
    flag: '🇧🇷',
    language: 'pt-BR' as Language,
    description: 'Brazilian ANVISA standards',
  },
} as const;

// Initial state
const initialState = {
  selectedMarkets: ['EU'] as Market[],
  primaryMarket: 'EU' as Market,
  comparisonMode: false,
  generationProgress: [],
  isGenerating: false,
  language: 'en' as Language,
  theme: 'light' as const,
  complianceView: 'summary' as const,
  labels: {} as Partial<Record<Market, Label | null>>,
  complianceScores: {} as Partial<Record<Market, ComplianceScore>>,
};

// Create the store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Market management actions
      setSelectedMarkets: (markets) => {
        set({ selectedMarkets: markets });
        // Auto-enable comparison mode if multiple markets selected
        if (markets.length > 1) {
          set({ comparisonMode: true });
        }
      },

      setPrimaryMarket: (market) => {
        set({ primaryMarket: market });
        // Ensure primary market is in selected markets
        const { selectedMarkets } = get();
        if (!selectedMarkets.includes(market)) {
          set({ selectedMarkets: [market, ...selectedMarkets] });
        }
      },

      toggleComparisonMode: () => {
        const { comparisonMode, selectedMarkets } = get();
        // Only allow comparison mode if multiple markets are selected
        if (selectedMarkets.length > 1) {
          set({ comparisonMode: !comparisonMode });
        }
      },

      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setComplianceView: (view) => set({ complianceView: view }),

      // Generation actions
      setGenerationProgress: (steps) => set({ generationProgress: steps }),

      updateGenerationStep: (stepId, updates) => {
        const { generationProgress } = get();
        const updatedSteps = generationProgress.map(step =>
          step.id === stepId ? { ...step, ...updates } : step
        );
        set({ generationProgress: updatedSteps });
      },

      setIsGenerating: (generating) => set({ isGenerating: generating }),

      // Label actions
      setLabel: (market, label) => {
        const { labels } = get();
        set({ labels: { ...labels, [market]: label } });
      },

      setComplianceScore: (market, score) => {
        const { complianceScores } = get();
        set({ complianceScores: { ...complianceScores, [market]: score } });
      },

      clearLabels: () => {
        set({
          labels: {},
          complianceScores: {},
          generationProgress: [],
          isGenerating: false
        });
      },

      // Utility actions
      resetState: () => set(initialState),
    }),
    {
      name: 'smartlabel-app-store',
      partialize: (state) => ({
        selectedMarkets: state.selectedMarkets,
        primaryMarket: state.primaryMarket,
        language: state.language,
        theme: state.theme,
        complianceView: state.complianceView,
      }),
    }
  )
);

// Selectors for commonly used derived state
export const useSelectedMarkets = () => useAppStore(state => state.selectedMarkets);
export const usePrimaryMarket = () => useAppStore(state => state.primaryMarket);
export const useComparisonMode = () => useAppStore(state => state.comparisonMode);
export const useLabels = () => useAppStore(state => state.labels);
export const useGenerationState = () => useAppStore(state => ({
  isGenerating: state.isGenerating,
  progress: state.generationProgress,
}));