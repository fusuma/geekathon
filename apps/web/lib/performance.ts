/**
 * Performance utilities for SmartLabel AI
 * Implements optimization strategies for better Core Web Vitals and user experience
 */

import React, { useEffect, useCallback, useRef } from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  markStart(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`);
    }
  }

  markEnd(name: string): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measures = performance.getEntriesByName(name, 'measure');
        const measure = measures[0];
        const duration = measure?.duration || 0;
        this.metrics.set(name, duration);
        return duration;
      } catch (error) {
        console.warn(`Performance measurement failed for ${name}:`, error);
        return 0;
      }
    }
    return 0;
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  const startMeasurement = useCallback((name: string) => {
    monitor.markStart(name);
  }, [monitor]);

  const endMeasurement = useCallback((name: string) => {
    return monitor.markEnd(name);
  }, [monitor]);

  const getMetrics = useCallback(() => {
    return monitor.getAllMetrics();
  }, [monitor]);

  return {
    startMeasurement,
    endMeasurement,
    getMetrics,
    clearMetrics: monitor.clearMetrics.bind(monitor),
  };
}

// Debounced callback hook for performance
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef<T>(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

// Throttled callback hook for performance
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastExecRef = useRef<number>(0);
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastExecRef.current >= delay) {
        lastExecRef.current = now;
        callbackRef.current(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastExecRef.current = Date.now();
          callbackRef.current(...args);
          timeoutRef.current = undefined;
        }, delay - (now - lastExecRef.current));
      }
    }) as T,
    [delay]
  );
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;

  const observer = new IntersectionObserver(([entry]) => {
    const isCurrentlyIntersecting = entry?.isIntersecting ?? false;
    setIsIntersecting(isCurrentlyIntersecting);

    if (isCurrentlyIntersecting && !hasIntersected) {
      setHasIntersected(true);
    }
  }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
}

// Preload images for better performance
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      })
    )
  );
}

// Bundle size analysis utilities
export function analyzeBundleSize(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Analyze loaded resources
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const scripts = resources.filter(r => r.name.includes('.js'));
  const styles = resources.filter(r => r.name.includes('.css'));

  console.group('📦 Bundle Analysis');
  console.log('JavaScript files:', scripts.length);
  console.log('CSS files:', styles.length);

  const totalJSSize = scripts.reduce((total, script) => {
    return total + (script.transferSize || 0);
  }, 0);

  const totalCSSSize = styles.reduce((total, style) => {
    return total + (style.transferSize || 0);
  }, 0);

  console.log(`Total JS size: ${(totalJSSize / 1024).toFixed(2)} KB`);
  console.log(`Total CSS size: ${(totalCSSSize / 1024).toFixed(2)} KB`);
  console.log(`Total size: ${((totalJSSize + totalCSSSize) / 1024).toFixed(2)} KB`);
  console.groupEnd();
}

// Web Vitals monitoring
export function reportWebVitals(metric: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 ${metric.name}:`, metric.value, metric.rating);
  }

  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: send to analytics
    // analytics.track('web-vitals', {
    //   name: metric.name,
    //   value: metric.value,
    //   rating: metric.rating,
    //   id: metric.id,
    // });
  }
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return;
  }

  const memory = (performance as any).memory;
  const used = Math.round(memory.usedJSHeapSize / 1048576);
  const total = Math.round(memory.totalJSHeapSize / 1048576);
  const limit = Math.round(memory.jsHeapSizeLimit / 1048576);

  console.log(`🧠 Memory: ${used}MB / ${total}MB (limit: ${limit}MB)`);

  // Warn if memory usage is high
  if (used / limit > 0.8) {
    console.warn('⚠️ High memory usage detected!');
  }
}

// Cache management utilities
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// React hook for caching
export function useCache() {
  const cache = CacheManager.getInstance();

  const setCachedData = useCallback((key: string, data: any, ttl?: number) => {
    cache.set(key, data, ttl);
  }, [cache]);

  const getCachedData = useCallback((key: string) => {
    return cache.get(key);
  }, [cache]);

  const clearCache = useCallback(() => {
    cache.clear();
  }, [cache]);

  return {
    setCachedData,
    getCachedData,
    clearCache,
    cacheSize: cache.size(),
  };
}

// Optimistic updates utility
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>,
  rollbackFn?: (error: Error) => void
) {
  const [data, setData] = React.useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = React.useState(false);

  const optimisticUpdate = useCallback(async (optimisticData: T) => {
    const previousData = data;
    setData(optimisticData);
    setIsOptimistic(true);

    try {
      const result = await updateFn(optimisticData);
      setData(result);
      setIsOptimistic(false);
      return result;
    } catch (error) {
      setData(previousData);
      setIsOptimistic(false);
      rollbackFn?.(error as Error);
      throw error;
    }
  }, [data, updateFn, rollbackFn]);

  return {
    data,
    isOptimistic,
    optimisticUpdate,
  };
}

// Performance reporting for development
export function logPerformanceMetrics(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Wait for page load
  setTimeout(() => {
    const paintMetrics = performance.getEntriesByType('paint');
    const navigationMetric = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    console.group('🚀 Performance Metrics');

    paintMetrics.forEach(metric => {
      console.log(`${metric.name}: ${metric.startTime.toFixed(2)}ms`);
    });

    if (navigationMetric) {
      const startTime = navigationMetric.startTime || 0;
      console.log(`DOM Content Loaded: ${navigationMetric.domContentLoadedEventEnd - startTime}ms`);
      console.log(`Load Complete: ${navigationMetric.loadEventEnd - startTime}ms`);
      console.log(`Time to Interactive: ${navigationMetric.domInteractive - startTime}ms`);
    }

    console.groupEnd();

    // Monitor memory every 30 seconds in development
    setInterval(monitorMemoryUsage, 30000);
  }, 1000);
}