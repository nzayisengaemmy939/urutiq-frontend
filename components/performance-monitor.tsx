'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  networkType: string;
  isSlow: boolean;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_SHOW_PERFORMANCE) {
      return;
    }

    const collectMetrics = () => {
      if (!window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const layoutShift = performance.getEntriesByType('layout-shift');

      // Get network information
      let networkType = 'unknown';
      let isSlow = false;
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        networkType = connection.effectiveType || 'unknown';
        isSlow = connection.effectiveType === 'slow-2g' || 
                 connection.effectiveType === '2g' || 
                 connection.effectiveType === '3g';
      }

      const metrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Will be updated by observer
        cumulativeLayoutShift: layoutShift.reduce((sum, entry) => sum + (entry as any).value, 0),
        networkType,
        isSlow
      };

      // Monitor Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lastEntry.startTime } : null);
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      setMetrics(metrics);

      // Log performance issues
      if (metrics.loadTime > 3000) {
        console.warn('⚠️ Slow page load detected:', metrics.loadTime + 'ms');
      }
      
      if (isSlow) {
        console.warn('⚠️ Slow network detected:', networkType);
      }
      
      if (metrics.cumulativeLayoutShift > 0.1) {
        console.warn('⚠️ High layout shift detected:', metrics.cumulativeLayoutShift);
      }
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  // Show metrics in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          setShowMetrics(prev => !prev);
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  if (!showMetrics || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Performance Metrics</h3>
        <button 
          onClick={() => setShowMetrics(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className={`flex justify-between ${metrics.isSlow ? 'text-yellow-400' : ''}`}>
          <span>Network:</span>
          <span>{metrics.networkType}</span>
        </div>
        <div className={`flex justify-between ${metrics.loadTime > 3000 ? 'text-red-400' : ''}`}>
          <span>Load Time:</span>
          <span>{metrics.loadTime.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>DOM Ready:</span>
          <span>{metrics.domContentLoaded.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>First Paint:</span>
          <span>{metrics.firstPaint.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>FCP:</span>
          <span>{metrics.firstContentfulPaint.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>LCP:</span>
          <span>{metrics.largestContentfulPaint.toFixed(0)}ms</span>
        </div>
        <div className={`flex justify-between ${metrics.cumulativeLayoutShift > 0.1 ? 'text-red-400' : ''}`}>
          <span>CLS:</span>
          <span>{metrics.cumulativeLayoutShift.toFixed(3)}</span>
        </div>
      </div>
      
      {metrics.isSlow && (
        <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300">
          ⚠️ Slow network detected. Consider enabling offline mode.
        </div>
      )}
    </div>
  );
}

// Hook for accessing performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const collectMetrics = () => {
      if (!window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const layoutShift = performance.getEntriesByType('layout-shift');

      let networkType = 'unknown';
      let isSlow = false;
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        networkType = connection.effectiveType || 'unknown';
        isSlow = connection.effectiveType === 'slow-2g' || 
                 connection.effectiveType === '2g' || 
                 connection.effectiveType === '3g';
      }

      setMetrics({
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: layoutShift.reduce((sum, entry) => sum + (entry as any).value, 0),
        networkType,
        isSlow
      });
    };

    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  return metrics;
}
