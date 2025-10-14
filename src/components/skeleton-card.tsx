import type React from "react"
import { cn } from "../lib/utils"

interface SkeletonCardProps {
  className?: string
  children?: React.ReactNode
}

export function SkeletonCard({ className, children }: SkeletonCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-lg p-6", className)}>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-16"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-4/6"></div>
        </div>
        <div className="flex gap-4 pt-4">
          <div className="h-8 bg-muted rounded w-20"></div>
          <div className="h-8 bg-muted rounded w-24"></div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-muted rounded w-16"></div>
            <div className="h-8 bg-muted rounded w-16"></div>
          </div>
        </div>
        <div className="h-64 bg-muted rounded-lg"></div>
        <div className="flex justify-center gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded-full"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
