import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function ServiceWorkerRegistration() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [registration, setRegistration] = useState(null);
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Register service worker
            navigator.serviceWorker
                .register('/sw.js', {
                scope: '/',
                updateViaCache: 'none' // Always check for updates
            })
                .then((reg) => {
                console.log('Service Worker registered successfully:', reg);
                setRegistration(reg);
                // Check for updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        console.log('New service worker found, installing...');
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('New service worker installed, update available');
                                setUpdateAvailable(true);
                            }
                        });
                    }
                });
                // Check for existing update
                if (reg.waiting) {
                    console.log('Service worker waiting to activate');
                    setUpdateAvailable(true);
                }
            })
                .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
            // Handle service worker updates
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker controller changed - reloading page');
                window.location.reload();
            });
            // Handle service worker errors
            navigator.serviceWorker.addEventListener('error', (error) => {
                console.error('Service Worker error:', error);
            });
            // Handle online/offline status
            const handleOnline = () => {
                console.log('App is online');
                // Optionally trigger a sync or refresh
            };
            const handleOffline = () => {
                console.log('App is offline');
                // Optionally show offline indicator
            };
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);
    // Handle service worker update
    const handleUpdate = () => {
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    };
    // Show update notification if available
    if (updateAvailable) {
        return (_jsxs("div", { className: "fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50", children: [_jsx("p", { className: "text-sm mb-2", children: "A new version is available!" }), _jsx("button", { onClick: handleUpdate, className: "bg-white text-blue-600 px-3 py-1 rounded text-sm hover:bg-gray-100", children: "Update Now" })] }));
    }
    return null;
}
