/**
 * Accessibility utilities for SmartLabel AI
 * Implements WCAG 2.1 AA compliance and enhanced usability features
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';

// ARIA live region manager
export class LiveRegionManager {
  private static instance: LiveRegionManager;
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  static getInstance(): LiveRegionManager {
    if (!LiveRegionManager.instance) {
      LiveRegionManager.instance = new LiveRegionManager();
    }
    return LiveRegionManager.instance;
  }

  private ensureRegions(): void {
    if (typeof window === 'undefined') return;

    if (!this.politeRegion) {
      this.politeRegion = document.createElement('div');
      this.politeRegion.setAttribute('aria-live', 'polite');
      this.politeRegion.setAttribute('aria-atomic', 'true');
      this.politeRegion.className = 'sr-only';
      this.politeRegion.id = 'live-region-polite';
      document.body.appendChild(this.politeRegion);
    }

    if (!this.assertiveRegion) {
      this.assertiveRegion = document.createElement('div');
      this.assertiveRegion.setAttribute('aria-live', 'assertive');
      this.assertiveRegion.setAttribute('aria-atomic', 'true');
      this.assertiveRegion.className = 'sr-only';
      this.assertiveRegion.id = 'live-region-assertive';
      document.body.appendChild(this.assertiveRegion);
    }
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.ensureRegions();

    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    if (region) {
      // Clear and set the message
      region.textContent = '';
      setTimeout(() => {
        if (region) region.textContent = message;
      }, 10);

      // Clear after 5 seconds to prevent accumulation
      setTimeout(() => {
        if (region) region.textContent = '';
      }, 5000);
    }
  }

  clear(): void {
    if (this.politeRegion) this.politeRegion.textContent = '';
    if (this.assertiveRegion) this.assertiveRegion.textContent = '';
  }
}

// Screen reader utilities
export const ScreenReader = {
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    LiveRegionManager.getInstance().announce(message, priority);
  },

  announcePageChange: (pageName: string) => {
    LiveRegionManager.getInstance().announce(
      `Navigated to ${pageName} page`,
      'polite'
    );
  },

  announceError: (error: string) => {
    LiveRegionManager.getInstance().announce(
      `Error: ${error}`,
      'assertive'
    );
  },

  announceSuccess: (message: string) => {
    LiveRegionManager.getInstance().announce(
      `Success: ${message}`,
      'polite'
    );
  },

  announceLoading: (process: string) => {
    LiveRegionManager.getInstance().announce(
      `Loading ${process}`,
      'polite'
    );
  },

  announceLoadingComplete: (process: string) => {
    LiveRegionManager.getInstance().announce(
      `${process} completed`,
      'polite'
    );
  },
};

// Focus management utilities
export function useFocusManagement() {
  const focusHistory = useRef<HTMLElement[]>([]);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      focusHistory.current.push(activeElement);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistory.current.pop();
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
    }
  }, []);

  const focusFirst = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    }
  }, []);

  const focusLast = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1]?.focus();
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
    focusFirst,
    focusLast,
  };
}

// Get focusable elements within a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'details > summary',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter((element) => {
      const el = element as HTMLElement;
      return (
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        !el.hasAttribute('aria-hidden') &&
        window.getComputedStyle(el).visibility !== 'hidden'
      );
    }) as HTMLElement[];
}

// Keyboard navigation handler
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
    onEscape?: () => void;
    onEnter?: (element: HTMLElement) => void;
  } = {}
) {
  const { loop = true, orientation = 'both', onEscape, onEnter } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = getFocusableElements(container);
      const currentIndex = focusableElements.findIndex(
        (el) => el === document.activeElement
      );

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            nextIndex = currentIndex + 1;
            if (nextIndex >= focusableElements.length) {
              nextIndex = loop ? 0 : focusableElements.length - 1;
            }
          }
          break;

        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? focusableElements.length - 1 : 0;
            }
          }
          break;

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            nextIndex = currentIndex + 1;
            if (nextIndex >= focusableElements.length) {
              nextIndex = loop ? 0 : focusableElements.length - 1;
            }
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? focusableElements.length - 1 : 0;
            }
          }
          break;

        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;

        case 'End':
          event.preventDefault();
          nextIndex = focusableElements.length - 1;
          break;

        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;

        case 'Enter':
        case ' ':
          if (event.key === 'Enter' || event.target === document.activeElement) {
            onEnter?.(document.activeElement as HTMLElement);
          }
          break;

        default:
          return;
      }

      if (nextIndex !== currentIndex && focusableElements[nextIndex]) {
        focusableElements[nextIndex]?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, loop, orientation, onEscape, onEnter]);
}

// Skip link utilities
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLElement[]>([]);

  const registerSkipLink = useCallback((element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', `Skip to ${label}`);
    element.setAttribute('data-skip-link', 'true');
    skipLinksRef.current.push(element);
  }, []);

  const createSkipLink = useCallback((targetId: string, label: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = `Skip to ${label}`;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
    skipLink.setAttribute('data-skip-link', 'true');

    // Insert at the beginning of the body
    document.body.insertBefore(skipLink, document.body.firstChild);

    return skipLink;
  }, []);

  return {
    registerSkipLink,
    createSkipLink,
  };
}

// Color contrast utilities
export function checkColorContrast(
  foreground: string,
  background: string
): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      const normalized = c / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * (r || 0) + 0.7152 * (g || 0) + 0.0722 * (b || 0);
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1] || '0', 16),
          g: parseInt(result[2] || '0', 16),
          b: parseInt(result[3] || '0', 16),
        }
      : null;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
}

// Reduced motion utilities
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// High contrast mode detection
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for Windows high contrast mode
    const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches ||
                          window.matchMedia('(-ms-high-contrast: active)').matches;

    setPrefersHighContrast(isHighContrast);

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleChange = () => setPrefersHighContrast(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// ARIA utilities
export const AriaUtils = {
  // Generate unique IDs for ARIA attributes
  generateId: (prefix: string = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create describedby relationship
  createDescribedBy: (controlId: string, descriptionId: string) => {
    const control = document.getElementById(controlId);
    if (control) {
      const existing = control.getAttribute('aria-describedby') || '';
      const descriptions = existing ? `${existing} ${descriptionId}` : descriptionId;
      control.setAttribute('aria-describedby', descriptions);
    }
  },

  // Create labelledby relationship
  createLabelledBy: (controlId: string, labelId: string) => {
    const control = document.getElementById(controlId);
    if (control) {
      control.setAttribute('aria-labelledby', labelId);
    }
  },

  // Announce dynamic content changes
  announceChange: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    ScreenReader.announce(message, priority);
  },

  // Set expanded state for collapsible content
  setExpanded: (triggerId: string, expanded: boolean) => {
    const trigger = document.getElementById(triggerId);
    if (trigger) {
      trigger.setAttribute('aria-expanded', expanded.toString());
    }
  },

  // Set selected state for selectable items
  setSelected: (itemId: string, selected: boolean) => {
    const item = document.getElementById(itemId);
    if (item) {
      item.setAttribute('aria-selected', selected.toString());
    }
  },
};

// Form accessibility helpers
export function useFormAccessibility() {
  const announceValidationErrors = useCallback((errors: Record<string, string>) => {
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      const message = errorCount === 1
        ? `1 validation error found`
        : `${errorCount} validation errors found`;
      ScreenReader.announceError(message);
    }
  }, []);

  const announceFormSubmission = useCallback((success: boolean, message?: string) => {
    if (success) {
      ScreenReader.announceSuccess(message || 'Form submitted successfully');
    } else {
      ScreenReader.announceError(message || 'Form submission failed');
    }
  }, []);

  const focusFirstError = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    if (!containerRef.current) return;

    const errorElement = containerRef.current.querySelector('[aria-invalid="true"]') as HTMLElement;
    if (errorElement) {
      errorElement.focus();
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return {
    announceValidationErrors,
    announceFormSubmission,
    focusFirstError,
  };
}

// Accessibility testing utilities (development only)
export const A11yTesting = {
  checkHeadingStructure: () => {
    if (process.env.NODE_ENV !== 'development') return;

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(el => ({
        level: parseInt(el.tagName.charAt(1)),
        text: el.textContent?.trim() || '',
        element: el
      }));

    let issues = [];

    // Check for missing h1
    if (!headings.some(h => h.level === 1)) {
      issues.push('Missing h1 element');
    }

    // Check for skipped heading levels
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];

      if (current && previous && current.level > previous.level + 1) {
        issues.push(`Heading level skipped: ${previous.level} to ${current.level}`);
      }
    }

    if (issues.length > 0) {
      console.warn('Heading structure issues:', issues);
    }
  },

  checkMissingAltText: () => {
    if (process.env.NODE_ENV !== 'development') return;

    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      console.warn(`${images.length} images missing alt text:`, images);
    }
  },

  checkColorContrast: () => {
    if (process.env.NODE_ENV !== 'development') return;

    // This would require a more sophisticated color analysis
    console.log('Color contrast checking would require additional libraries');
  },

  checkFormLabels: () => {
    if (process.env.NODE_ENV !== 'development') return;

    const inputs = document.querySelectorAll('input, textarea, select');
    const unlabeled: Element[] = [];

    inputs.forEach(input => {
      const hasLabel = input.hasAttribute('aria-label') ||
                      input.hasAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${input.id}"]`);

      if (!hasLabel) {
        unlabeled.push(input);
      }
    });

    if (unlabeled.length > 0) {
      console.warn(`${unlabeled.length} form elements missing labels:`, unlabeled);
    }
  },

  runAllChecks: () => {
    if (process.env.NODE_ENV !== 'development') return;

    console.group('♿ Accessibility Audit');
    A11yTesting.checkHeadingStructure();
    A11yTesting.checkMissingAltText();
    A11yTesting.checkFormLabels();
    console.groupEnd();
  },
};