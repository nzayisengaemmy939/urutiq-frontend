import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { KeyboardNavigationProvider } from "@/components/keyboard-navigation-provider"
import { RootErrorBoundary } from "@/components/root-error-boundary"
import { ToastProvider } from "@/components/toast-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
// Temporarily disable dynamic imports to debug webpack error
// import dynamic from "next/dynamic"
// const ServiceWorkerRegistration = dynamic(() => import("@/components/service-worker-registration"), { ssr: false })
// const FontOptimizer = dynamic(() => import("@/components/font-optimizer"), { ssr: false })
// const PerformanceMonitor = dynamic(() => import("@/components/performance-monitor"), { ssr: false })
import { ReactQueryProvider } from "@/components/react-query-provider"

export const metadata: Metadata = {
  title: "UrutiIQ - AI-Powered Accounting Platform",
  description: "Professional accounting and bookkeeping with AI insights, multi-company support, and intelligent automation",
  keywords: "accounting, bookkeeping, AI, finance, business, multi-company, automation",
  authors: [{ name: "UrutiIQ Team" }],
  generator: "Next.js",
  robots: "index, follow",
  openGraph: {
    title: "UrutiIQ - AI-Powered Accounting Platform",
    description: "Professional accounting and bookkeeping with AI insights",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "UrutiIQ - AI-Powered Accounting Platform",
    description: "Professional accounting and bookkeeping with AI insights",
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//api.localhost" />
        
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="http://localhost:4000" />
        
        {/* Resource hints for performance */}
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/accounting" />
        
        {/* Prevent font loading issues */}
        <meta name="font-display" content="swap" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Block Geist font loading */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Geist Sans Latin 600';
              src: local('Inter'), local('system-ui'), local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial'), local('sans-serif');
              font-display: swap;
            }
            .geist-sans, [class*="geist-sans"], [class*="geist"], 
            [class*="geist-sans-latin"], [class*="geist-sans-latin-600"],
            [class*="geist-sans-latin-500"], [class*="geist-sans-latin-400"],
            [class*="geist-sans-latin-700"] {
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
            }
          `
        }} />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        <RootErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RootErrorBoundary>
              <ReactQueryProvider>
                <RootErrorBoundary>
                  <AuthProvider>
                    <RootErrorBoundary>
                      <KeyboardNavigationProvider>
                        <RootErrorBoundary>
                          <ToastProvider>
                            {/* Temporarily disable dynamic components to debug webpack error */}
                            {/* <FontOptimizer> */}
                              {children}
                            {/* </FontOptimizer> */}
                            {/* <ServiceWorkerRegistration /> */}
                            {/* <PerformanceMonitor /> */}
                          </ToastProvider>
                        </RootErrorBoundary>
                      </KeyboardNavigationProvider>
                    </RootErrorBoundary>
                  </AuthProvider>
                </RootErrorBoundary>
              </ReactQueryProvider>
            </RootErrorBoundary>
          </ThemeProvider>
        </RootErrorBoundary>
      </body>
    </html>
  )
}
