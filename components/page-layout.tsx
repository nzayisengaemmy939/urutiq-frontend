"use client"

import React from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { BreadcrumbNavigation } from "./breadcrumb-navigation"
import { KeyboardShortcuts } from "./keyboard-shortcuts"

interface BreadcrumbItem {
  label: string
  href: string
}

interface PageLayoutProps {
  children: React.ReactNode
  showBreadcrumbs?: boolean
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
}

export function PageLayout({ 
  children, 
  showBreadcrumbs = true, 
  title, 
  description, 
  breadcrumbs 
}: PageLayoutProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <main className="flex-1 overflow-hidden pt-8 lg:pl-64 pl-0" id="main-content">
          <div className="flex-1 space-y-6 p-6">
            <div className="h-5 w-40 bg-muted rounded" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header />
      
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden pt-8 lg:pl-64 pl-0" id="main-content">
        <div className="flex-1 space-y-6 p-6">
          {/* Page Header */}
          {(title || description) && (
            <div className="space-y-2">
              {title && (
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              )}
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          
          {/* Breadcrumb Navigation */}
          {showBreadcrumbs && <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} />}
          
          {/* Keyboard Shortcuts Button */}
          <div className="fixed bottom-4 right-4 z-50">
            <KeyboardShortcuts />
          </div>
          
          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  )
}
