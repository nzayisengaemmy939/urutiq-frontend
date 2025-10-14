import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useEffect, useState } from 'react';
export function PerformanceMonitor() {
    const [metrics, setMetrics] = useState(null);
    const [showMetrics, setShowMetrics] = useState(false);
    useEffect(() => {
        // Only run in development or when explicitly enabled
        if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_SHOW_PERFORMANCE) {
            return;
        }
        const collectMetrics = () => {
            if (!window.performance)
                return;
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            const layoutShift = performance.getEntriesByType('layout-shift');
            // Get network information
            let networkType = 'unknown';
            let isSlow = false;
            if ('connection' in navigator) {
                const connection = navigator.connection;
                networkType = connection.effectiveType || 'unknown';
                isSlow = connection.effectiveType === 'slow-2g' ||
                    connection.effectiveType === '2g' ||
                    connection.effectiveType === '3g';
            }
            const metrics = {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                largestContentfulPaint: 0, // Will be updated by observer
                cumulativeLayoutShift: layoutShift.reduce((sum, entry) => sum + entry.value, 0),
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
        }
        else {
            window.addEventListener('load', collectMetrics);
            return () => window.removeEventListener('load', collectMetrics);
        }
    }, []);
    // Show metrics in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const handleKeyPress = (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                    setShowMetrics(prev => !prev);
                }
            };
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, []);
    if (!showMetrics || !metrics)
        return null;
    return (_jsxs("div", { className: "fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "font-semibold", children: "Performance Metrics" }), _jsx("button", { onClick: () => setShowMetrics(false), className: "text-gray-400 hover:text-white", children: "\u00D7" })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: `flex justify-between ${metrics.isSlow ? 'text-yellow-400' : ''}`, children: [_jsx("span", { children: "Network:" }), _jsx("span", { children: metrics.networkType })] }), _jsxs("div", { className: `flex justify-between ${metrics.loadTime > 3000 ? 'text-red-400' : ''}`, children: [_jsx("span", { children: "Load Time:" }), _jsxs("span", { children: [metrics.loadTime.toFixed(0), "ms"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "DOM Ready:" }), _jsxs("span", { children: [metrics.domContentLoaded.toFixed(0), "ms"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "First Paint:" }), _jsxs("span", { children: [metrics.firstPaint.toFixed(0), "ms"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "FCP:" }), _jsxs("span", { children: [metrics.firstContentfulPaint.toFixed(0), "ms"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "LCP:" }), _jsxs("span", { children: [metrics.largestContentfulPaint.toFixed(0), "ms"] })] }), _jsxs("div", { className: `flex justify-between ${metrics.cumulativeLayoutShift > 0.1 ? 'text-red-400' : ''}`, children: [_jsx("span", { children: "CLS:" }), _jsx("span", { children: metrics.cumulativeLayoutShift.toFixed(3) })] })] }), metrics.isSlow && (_jsx("div", { className: "mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300", children: "\u26A0\uFE0F Slow network detected. Consider enabling offline mode." }))] }));
}
// Hook for accessing performance metrics
export function usePerformanceMetrics() {
    const [metrics, setMetrics] = useState(null);
    useEffect(() => {
        const collectMetrics = () => {
            if (!window.performance)
                return;
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            const layoutShift = performance.getEntriesByType('layout-shift');
            let networkType = 'unknown';
            let isSlow = false;
            if ('connection' in navigator) {
                const connection = navigator.connection;
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
                cumulativeLayoutShift: layoutShift.reduce((sum, entry) => sum + entry.value, 0),
                networkType,
                isSlow
            });
        };
        if (document.readyState === 'complete') {
            collectMetrics();
        }
        else {
            window.addEventListener('load', collectMetrics);
            return () => window.removeEventListener('load', collectMetrics);
        }
    }, []);
    return metrics;
}
