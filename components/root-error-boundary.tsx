"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 Root Error Boundary caught an error:", error, errorInfo)
    this.setState({ error, errorInfo })
    
    // Log to external service if available
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // In production, you might want to send this to an error tracking service
      console.error("Production error:", { error: error.message, stack: error.stack, errorInfo })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Application Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  We're sorry, but something went wrong with the application. This error has been logged and our team will investigate.
                </p>
              </div>

              {this.state.error && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Error Details:</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-mono text-red-600">
                      {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          Stack Trace
                        </summary>
                        <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()} 
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <p>If this problem persists, please contact support.</p>
                <p className="mt-1">Error ID: {Date.now().toString(36)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default RootErrorBoundary
