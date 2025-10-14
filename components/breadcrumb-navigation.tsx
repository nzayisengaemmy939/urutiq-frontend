"use client"

import { ChevronRight, Home } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

const routeMapping: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [
    { label: "Dashboard", href: "/dashboard", icon: Home },
  ],
  "/sales": [
    { label: "Sales & Invoicing", href: "/sales" },
    { label: "Invoices", href: "/sales" },
  ],
  "/purchases": [
    { label: "Purchases & Expenses", href: "/purchases" },
    { label: "Expenses", href: "/purchases" },
  ],
  "/banking": [
    { label: "Banking & Cash", href: "/banking" },
    { label: "Bank Accounts", href: "/banking" },
  ],
  "/accounting": [
    { label: "Accounting", href: "/accounting" },
    { label: "Chart of Accounts", href: "/accounting" },
  ],
  "/reports": [
    { label: "Reports & Analytics", href: "/reports" },
    { label: "Standard Reports", href: "/reports" },
  ],
  "/ai-insights": [
    { label: "AI Insights", href: "/ai-insights" },
    { label: "AI Dashboard", href: "/ai-insights" },
  ],
  "/settings": [
    { label: "System Settings", href: "/settings" },
    { label: "General Settings", href: "/settings" },
  ],
  "/inventory": [
    { label: "Inventory & Products", href: "/inventory" },
    { label: "Products & Services", href: "/inventory" },
  ],
  "/tax": [
    { label: "Tax Management", href: "/tax" },
    { label: "Tax Dashboard", href: "/tax" },
  ],
  "/payroll": [
    { label: "Payroll & HR", href: "/payroll" },
    { label: "Payroll Dashboard", href: "/payroll" },
  ],
  "/projects": [
    { label: "Projects & Time", href: "/projects" },
    { label: "Project Dashboard", href: "/projects" },
  ],
  "/clients": [
    { label: "Client Portal", href: "/clients" },
    { label: "Client Dashboard", href: "/clients" },
  ],
  "/documents": [
    { label: "Documents", href: "/documents" },
    { label: "Document Center", href: "/documents" },
  ],
  "/security": [
    { label: "Security", href: "/security" },
    { label: "Security Dashboard", href: "/security" },
  ],
  "/international": [
    { label: "International", href: "/international" },
    { label: "Multi-Currency Dashboard", href: "/international" },
  ],
  "/enhanced-transaction-processing": [
    { label: "Enhanced Transaction Processing", href: "/enhanced-transaction-processing" },
    { label: "AI-Powered Processing", href: "/enhanced-transaction-processing" },
  ],
  "/llama-ai": [
    { label: "Llama AI Intelligence", href: "/llama-ai" },
    { label: "AI-Powered Features", href: "/llama-ai" },
  ],
}

interface BreadcrumbNavigationProps {
  customBreadcrumbs?: BreadcrumbItem[]
}

export function BreadcrumbNavigation({ customBreadcrumbs }: BreadcrumbNavigationProps) {
  const pathname = usePathname()
  
  // Use custom breadcrumbs if provided, otherwise get breadcrumbs for current route
  const breadcrumbs = customBreadcrumbs || routeMapping[pathname] || [
    { label: "Dashboard", href: "/dashboard", icon: Home },
  ]

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
                     {item.href ? (
             <Link
               href={item.href}
               className={cn(
                 "flex items-center gap-1 hover:text-foreground transition-colors",
                 index === breadcrumbs.length - 1 && "text-foreground font-medium"
               )}
             >
               {item.icon && <item.icon className="h-4 w-4" />}
               {item.label}
             </Link>
           ) : (
            <span className={cn(
              "flex items-center gap-1",
              index === breadcrumbs.length - 1 && "text-foreground font-medium"
            )}>
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
