/**
 * Service Worker Debug Utility
 * Add this to help debug service worker issues
 */

// Monitor service worker registration and updates
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    console.log('Current service worker registrations:', registrations.length);
    
    registrations.forEach((registration, index) => {
      console.log(`Registration ${index}:`, {
        scope: registration.scope,
        active: registration.active?.scriptURL,
        installing: registration.installing?.scriptURL,
        waiting: registration.waiting?.scriptURL,
        updatefound: !!registration.onupdatefound
      });
    });
  });

  // Log service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Message from service worker:', event.data);
  });

  // Monitor fetch events that fail
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args)
      .catch((error) => {
        // Log fetch failures that might be related to service worker issues
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        if (url && (url.includes('_error') || url.includes('fallback'))) {
          console.error('Fetch failed for potential service worker asset:', url, error);
        }
        throw error;
      });
  };
}

// Utility function to clear all caches (for debugging)
window.clearServiceWorkerCaches = async function() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log('Clearing caches:', cacheNames);
    
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('All caches cleared');
  }
};

// Utility function to unregister service worker (for debugging)
window.unregisterServiceWorker = async function() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    await Promise.all(
      registrations.map(registration => registration.unregister())
    );
    
    console.log('All service workers unregistered');
  }
};

console.log('Service Worker debug utilities loaded. Available functions:');
console.log('- clearServiceWorkerCaches(): Clear all caches');
console.log('- unregisterServiceWorker(): Unregister all service workers');
