import { jsx as _jsx } from "react/jsx-runtime";
;
import { useEffect, useState } from 'react';
export function FontOptimizer({ children }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [networkSlow, setNetworkSlow] = useState(false);
    useEffect(() => {
        // Check if fonts are already loaded
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                setFontsLoaded(true);
            });
        }
        else {
            // Fallback for browsers without Font Loading API
            setTimeout(() => {
                setFontsLoaded(true);
            }, 100);
        }
        // Detect slow network conditions
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' ||
                connection.effectiveType === '2g' ||
                connection.effectiveType === '3g') {
                setNetworkSlow(true);
            }
        }
        // Monitor network performance
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry;
                        if (navEntry.loadEventEnd - navEntry.loadEventStart > 3000) {
                            setNetworkSlow(true);
                        }
                    }
                }
            });
            observer.observe({ entryTypes: ['navigation'] });
            return () => observer.disconnect();
        }
    }, []);
    return (_jsx("div", { className: `font-optimizer ${fontsLoaded ? 'fonts-loaded' : 'fonts-loading'} ${networkSlow ? 'network-slow' : ''}`, children: children }));
}
// Font loading utility
export function useFontLoading() {
    const [fontsReady, setFontsReady] = useState(false);
    useEffect(() => {
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                setFontsReady(true);
            });
        }
        else {
            setFontsReady(true);
        }
    }, []);
    return fontsReady;
}
// Network performance utility
export function useNetworkPerformance() {
    const [networkInfo, setNetworkInfo] = useState({
        isSlow: false,
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0
    });
    useEffect(() => {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const updateNetworkInfo = () => {
                setNetworkInfo({
                    isSlow: connection.effectiveType === 'slow-2g' ||
                        connection.effectiveType === '2g' ||
                        connection.effectiveType === '3g',
                    effectiveType: connection.effectiveType || 'unknown',
                    downlink: connection.downlink || 0,
                    rtt: connection.rtt || 0
                });
            };
            updateNetworkInfo();
            if (connection.addEventListener) {
                connection.addEventListener('change', updateNetworkInfo);
                return () => connection.removeEventListener('change', updateNetworkInfo);
            }
        }
    }, []);
    return networkInfo;
}
