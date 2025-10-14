"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[v0] Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-64 bg-card border border-border rounded-lg">
          <div className="text-center p-6 space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
              <p className="text-sm text-muted-foreground mt-1">We encountered an error loading this component</p>
            </div>
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
