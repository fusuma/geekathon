/**
 * Enhanced Error Handling and Recovery System
 * Provides comprehensive error management, user-friendly messages, and recovery strategies
 */

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AI_SERVICE = 'AI_SERVICE',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATION = 'AUTHENTICATION',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  details?: string;
  timestamp: number;
  context?: Record<string, any>;
  recoverable: boolean;
  retryable: boolean;
  suggestedActions?: string[];
}

// Error classification utility
export function classifyError(error: any): AppError {
  const timestamp = Date.now();
  const id = `error_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      id,
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      message: error.message,
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      timestamp,
      recoverable: true,
      retryable: true,
      suggestedActions: [
        'Check your internet connection',
        'Try again in a moment',
        'Contact support if the problem persists',
      ],
    };
  }

  // API errors with status codes
  if (error.response?.status) {
    const status = error.response.status;

    if (status === 429) {
      return {
        id,
        type: ErrorType.RATE_LIMIT,
        severity: ErrorSeverity.MEDIUM,
        message: 'Rate limit exceeded',
        userMessage: 'Too many requests. Please wait a moment before trying again.',
        timestamp,
        recoverable: true,
        retryable: true,
        suggestedActions: [
          'Wait 30 seconds before retrying',
          'Reduce the frequency of your requests',
        ],
      };
    }

    if (status === 400) {
      return {
        id,
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        message: error.response.data?.message || 'Invalid request data',
        userMessage: 'Please check your input and try again.',
        details: error.response.data?.details,
        timestamp,
        recoverable: true,
        retryable: false,
        suggestedActions: [
          'Check all required fields are filled',
          'Verify your product information is correct',
          'Make sure selected markets are supported',
        ],
      };
    }

    if (status === 500) {
      return {
        id,
        type: ErrorType.AI_SERVICE,
        severity: ErrorSeverity.HIGH,
        message: 'Internal server error',
        userMessage: 'Our AI service is temporarily unavailable. Please try again.',
        timestamp,
        recoverable: true,
        retryable: true,
        suggestedActions: [
          'Try again in a few minutes',
          'Use simpler product descriptions if the issue persists',
          'Contact support for assistance',
        ],
      };
    }

    if (status === 408 || status === 504) {
      return {
        id,
        type: ErrorType.TIMEOUT,
        severity: ErrorSeverity.MEDIUM,
        message: 'Request timeout',
        userMessage: 'The request took too long to complete. Please try again.',
        timestamp,
        recoverable: true,
        retryable: true,
        suggestedActions: [
          'Try again with a simpler request',
          'Check your internet connection',
          'Contact support if timeouts persist',
        ],
      };
    }
  }

  // Validation errors from forms
  if (error.name === 'ZodError' || error.type === 'validation') {
    return {
      id,
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      message: error.message || 'Validation failed',
      userMessage: 'Please fix the highlighted fields and try again.',
      details: error.issues?.map((issue: any) => issue.message).join(', '),
      timestamp,
      recoverable: true,
      retryable: false,
      suggestedActions: [
        'Review all form fields',
        'Ensure required information is provided',
        'Check for any error messages below form fields',
      ],
    };
  }

  // Offline/network issues
  if (!navigator.onLine) {
    return {
      id,
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      message: 'No internet connection',
      userMessage: 'You are currently offline. Please check your internet connection.',
      timestamp,
      recoverable: true,
      retryable: true,
      suggestedActions: [
        'Check your internet connection',
        'Try again when back online',
        'Some features may work in offline mode',
      ],
    };
  }

  // Default unknown error
  return {
    id,
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: error.message || 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    timestamp,
    recoverable: true,
    retryable: true,
    suggestedActions: [
      'Try refreshing the page',
      'Contact support if the problem continues',
    ],
  };
}

// Retry logic with exponential backoff
export class RetryManager {
  private static instance: RetryManager;
  private retryAttempts: Map<string, number> = new Map();

  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager();
    }
    return RetryManager.instance;
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
      retryKey?: string;
      onRetry?: (attempt: number, error: any) => void;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      retryKey = 'default',
      onRetry,
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        // Success - reset retry count
        this.retryAttempts.delete(retryKey);
        return result;
      } catch (error) {
        lastError = error;
        this.retryAttempts.set(retryKey, attempt);

        // Don't retry on the last attempt
        if (attempt === maxAttempts) {
          break;
        }

        // Check if error is retryable
        const appError = classifyError(error);
        if (!appError.retryable) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

        onRetry?.(attempt, error);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  getRetryCount(key: string): number {
    return this.retryAttempts.get(key) || 0;
  }

  clearRetryCount(key: string): void {
    this.retryAttempts.delete(key);
  }
}

// Error boundary hook
export function useErrorBoundary() {
  const [error, setError] = useState<AppError | null>(null);

  const captureError = useCallback((error: any, context?: Record<string, any>) => {
    const appError = classifyError(error);
    if (context) {
      appError.context = context;
    }
    setError(appError);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', appError);
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      reportError(appError);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (operation: () => Promise<any>) => {
    if (!error) return;

    try {
      clearError();
      await operation();
    } catch (newError) {
      captureError(newError);
    }
  }, [error, captureError, clearError]);

  return {
    error,
    captureError,
    clearError,
    retry,
    hasError: !!error,
  };
}

// Enhanced fetch with error handling and retry
export async function enhancedFetch(
  url: string,
  options: RequestInit = {},
  retryOptions?: {
    maxAttempts?: number;
    baseDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  }
): Promise<Response> {
  const retryManager = RetryManager.getInstance();

  return retryManager.withRetry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    retryOptions
  );
}

// Error reporting utility
export function reportError(error: AppError): void {
  // In production, send to your error reporting service
  // Example: Sentry, LogRocket, etc.

  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Report');
    console.log('ID:', error.id);
    console.log('Type:', error.type);
    console.log('Severity:', error.severity);
    console.log('Message:', error.message);
    console.log('User Message:', error.userMessage);
    if (error.details) console.log('Details:', error.details);
    if (error.context) console.log('Context:', error.context);
    console.log('Timestamp:', new Date(error.timestamp).toISOString());
    console.log('Recoverable:', error.recoverable);
    console.log('Retryable:', error.retryable);
    if (error.suggestedActions) {
      console.log('Suggested Actions:', error.suggestedActions);
    }
    console.groupEnd();
  }

  // Example production error reporting
  // if (process.env.NODE_ENV === 'production') {
  //   fetch('/api/errors', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(error),
  //   }).catch(() => {
  //     // Silently fail error reporting
  //   });
  // }
}

// Offline detection and recovery
export function useOfflineRecovery() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setWasOffline(false);
        // Retry failed queries when back online
        queryClient.resumePausedMutations();
        queryClient.invalidateQueries();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [wasOffline, queryClient]);

  return {
    isOnline,
    wasOffline,
    isRecovering: wasOffline && isOnline,
  };
}

// Query error handler for TanStack Query
export function createQueryErrorHandler() {
  return (error: any, query: any) => {
    const appError = classifyError(error);

    // Log error
    console.error('Query failed:', {
      queryKey: query.queryKey,
      error: appError,
    });

    // Handle specific error types
    switch (appError.type) {
      case ErrorType.RATE_LIMIT:
        // Pause queries for a moment
        setTimeout(() => {
          query.retry();
        }, 30000);
        break;

      case ErrorType.NETWORK:
        // Will be retried when back online
        break;

      case ErrorType.AI_SERVICE:
        // Retry with backoff
        break;

      default:
        // Default handling
        break;
    }

    return appError;
  };
}

// Error recovery strategies
export const ErrorRecoveryStrategies = {
  // Refresh the page
  refreshPage: () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },

  // Clear all caches and retry
  clearCacheAndRetry: (queryClient: any) => {
    queryClient.clear();
    queryClient.invalidateQueries();
  },

  // Reset to initial state
  resetToInitialState: (resetFn: () => void) => {
    resetFn();
  },

  // Navigate to safe page
  navigateToSafePage: (router: any) => {
    router.push('/');
  },

  // Show fallback UI
  showFallbackUI: (setFallback: (show: boolean) => void) => {
    setFallback(true);
  },
};

// Error message formatter
export function formatErrorMessage(error: AppError, context: 'toast' | 'modal' | 'inline' = 'toast'): {
  title: string;
  message: string;
  actions?: string[];
} {
  const baseMessage = {
    title: getErrorTitle(error.type, error.severity),
    message: error.userMessage,
    actions: error.suggestedActions,
  };

  switch (context) {
    case 'toast':
      return {
        title: baseMessage.title,
        message: error.userMessage,
      };

    case 'modal':
      return {
        title: baseMessage.title,
        message: `${error.userMessage}\n\nError ID: ${error.id}`,
        actions: error.suggestedActions,
      };

    case 'inline':
      return {
        title: '',
        message: error.userMessage,
        actions: error.suggestedActions?.slice(0, 2), // Limit actions for inline display
      };

    default:
      return baseMessage;
  }
}

function getErrorTitle(type: ErrorType, severity: ErrorSeverity): string {
  const severityPrefix = severity === ErrorSeverity.CRITICAL ? '🚨 Critical: ' :
                        severity === ErrorSeverity.HIGH ? '⚠️ Error: ' :
                        severity === ErrorSeverity.MEDIUM ? '⚠️ Warning: ' : '';

  switch (type) {
    case ErrorType.NETWORK:
      return `${severityPrefix}Connection Problem`;
    case ErrorType.AI_SERVICE:
      return `${severityPrefix}AI Service Issue`;
    case ErrorType.RATE_LIMIT:
      return `${severityPrefix}Rate Limit Reached`;
    case ErrorType.VALIDATION:
      return `${severityPrefix}Invalid Input`;
    case ErrorType.TIMEOUT:
      return `${severityPrefix}Request Timeout`;
    case ErrorType.AUTHENTICATION:
      return `${severityPrefix}Authentication Required`;
    default:
      return `${severityPrefix}Unexpected Error`;
  }
}