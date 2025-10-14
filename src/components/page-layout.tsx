import React from "react"
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
        <main className="flex-1 overflow-hidden pt-8 pl-0 pl-0" id="main-content">
          <div className="flex-1 space-y-6 px-4 py-6">
            <div className="h-5 w-40 bg-muted rounded" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6 py-4">
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
      <div className="fixed bottom-6 right-6 z-50">
        <KeyboardShortcuts />
      </div>
      
      {/* Page Content */}
      {children}
    </div>
  )
}
