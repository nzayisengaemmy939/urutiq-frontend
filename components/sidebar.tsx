"use client"

import { useState, useEffect, useRef } from "react"
import {
  Building2,
  BarChart3,
  Users,
  FileText,
  Settings,
  Brain,
  AlertTriangle,
  CreditCard,
  PieChart,
  Calculator,
  ChevronDown,
  ChevronRight,
  Home,
  ShoppingCart,
  Receipt,
  Banknote,
  Package,
  UserCheck,
  FolderOpen,
  Globe,
  HelpCircle,
  TrendingUp,
  Shield,
  Target,
  Clock,
  Zap,
  DollarSign,
  FileBarChart,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useKeyboardNavigation } from "./keyboard-navigation-provider"

interface NavigationItem {
  name: string
  icon: any
  current?: boolean
  href?: string
  favorite?: boolean
  recent?: boolean
}

interface NavigationGroup {
  name: string
  icon: any
  items: NavigationItem[]
  defaultExpanded?: boolean
  priority?: "core" | "optional" | "utility"
}

const adaptiveMenuConfig = {
  core: ["Dashboard", "Sales & Invoicing", "Purchases & Expenses", "Banking & Cash", "Tax Management"],
  optional: ["Inventory & Products", "Payroll & HR", "Projects & Time", "Multi-Company", "International"],
  utility: [
    "Reports & Analytics",
    "AI Insights",
    "Settings",
    "Help & Support",
    "Documents",
    "Client Portal",
    "Security",
  ],
}

const userPreferences = {
  enabledModules: new Set([
    "Dashboard",
    "Sales & Invoicing",
    "Purchases & Expenses",
    "Banking & Cash",
    "Inventory & Products",
    "Accounting",
    "Tax Management",
    "Reports & Analytics",
    "AI Insights",
    "AI-Powered Features",
    "System Settings",
  ]),
  favoriteItems: new Set([
    "Financial Overview",
    "AI Smart Insights",
    "Invoices",
    "Expenses",
    "Bank Accounts & Reconciliation",
    "Enhanced Financial Reports",
    "Advanced Analytics Dashboard",
    "AI Financial Coach",
    "Fixed Assets",
  ]),
  recentlyUsed: ["Invoices", "Expenses", "AI Smart Insights", "Bank Accounts & Reconciliation", "Enhanced Financial Reports", "Advanced Analytics Dashboard", "AI Financial Coach", "Fixed Assets"],
}

const navigationGroups: NavigationGroup[] = [
  {
    name: "Dashboard",
    icon: Home,
    defaultExpanded: true,
    priority: "core",
    items: [
      { name: "Financial Overview", icon: BarChart3, current: true, favorite: true, href: "/dashboard" },
      { name: "AI Smart Insights", icon: Brain, favorite: true, href: "/ai-insights" },
      { name: "Key Alerts & Tasks", icon: AlertTriangle, href: "/dashboard?tab=alerts" },
    ],
  },
  {
    name: "Sales & Invoicing",
    icon: ShoppingCart,
    priority: "core",
    items: [
      { name: "Invoices", icon: Receipt, favorite: true, recent: true, href: "/sales" },
      { name: "Credit Notes", icon: FileText, href: "/credit-notes" },
      { name: "Customers", icon: Users, href: "/sales?tab=customers" },
      { name: "Quotes / Estimates", icon: FileText, href: "/sales?tab=quotes" },
      { name: "Sales Receipts", icon: CreditCard, href: "/sales?tab=receipts" },
      { name: "Payments Received", icon: Banknote, href: "/sales?tab=payments" },
      { name: "Recurring Invoices", icon: Clock, href: "/sales?tab=recurring" },
    ],
  },
  {
    name: "Purchases & Expenses",
    icon: Receipt,
    priority: "core",
    items: [
      { name: "Expenses", icon: CreditCard, favorite: true, recent: true, href: "/expenses" },
      { name: "Enhanced Transaction Processing", icon: Zap, href: "/enhanced-transaction-processing", badge: "New" },
      { name: "Vendors / Suppliers", icon: Building2, href: "/purchases?tab=vendors" },
      { name: "Vendor Bills", icon: FileText, href: "/vendor-bills" },
      { name: "Purchase Orders", icon: ShoppingCart, favorite: true, recent: true, href: "/purchase-orders" },
      { name: "Import Shipments", icon: Package, href: "/import-shipments" },
      { name: "Payments Made", icon: Banknote, href: "/purchases?tab=payments" },
      { name: "Recurring Expenses", icon: Clock, href: "/purchases?tab=recurring" },
    ],
  },
  {
    name: "Banking & Cash",
    icon: Banknote,
    priority: "core",
    items: [
      { name: "Bank Accounts & Reconciliation", icon: Banknote, favorite: true, recent: true, href: "/banking" },
      { name: "Enhanced Bank Integration", icon: Zap, href: "/enhanced-bank-integration", badge: "New" },
      { name: "Cash Accounts", icon: DollarSign, href: "/banking?tab=cash" },
      { name: "Credit Cards", icon: CreditCard, href: "/banking?tab=credit-cards" },
      { name: "AI Auto-Match & Anomaly Alerts", icon: Zap, href: "/banking?tab=ai-match" },
      { name: "Bank Rules", icon: Settings, href: "/bank-rules", badge: "New" },
    ],
  },
  {
    name: "Inventory & Products",
    icon: Package,
    priority: "optional",
    items: [
      { name: "Inventory Management", icon: Package, href: "/inventory" },
      { name: "Products & Services", icon: ShoppingCart, href: "/inventory?tab=products" },
      { name: "Stock Levels", icon: BarChart3, href: "/inventory?tab=stock-levels" },
      { name: "Reorder Alerts", icon: AlertTriangle, href: "/inventory?tab=alerts" },
      { name: "Inventory Movements", icon: TrendingUp, href: "/inventory?tab=movements" },
      { name: "AI Demand Forecasting", icon: Brain, href: "/inventory?tab=ai-forecasting" },
    ],
  },
  {
    name: "Tax Management",
    icon: Calculator,
    priority: "core",
    items: [
      { name: "Tax Dashboard", icon: BarChart3, href: "/tax" },
      { name: "Enhanced Compliance & Tax", icon: Shield, href: "/enhanced-compliance-tax", badge: "New" },
      { name: "Tax Calculations", icon: Calculator, href: "/tax?tab=calculations" },
      { name: "Tax Forms & Filing", icon: FileText, href: "/tax?tab=forms" },
      { name: "Compliance Tracking", icon: Shield, href: "/tax?tab=compliance" },
      { name: "Multi-Jurisdiction Support", icon: Globe, href: "/tax?tab=jurisdictions" },
    ],
  },
  {
    name: "Accounting",
    icon: Calculator,
    defaultExpanded: true,
    priority: "core",
    items: [
      { name: "Chart of Accounts", icon: FileText, href: "/accounting" },
      { name: "Enhanced Journal Management", icon: FileText, href: "/enhanced-journal-management", badge: "New" },
      { name: "Journal Entries", icon: FileText, href: "/accounting?tab=journal-entries" },
      { name: "Trial Balance", icon: Calculator, href: "/accounting?tab=trial-balance" },
      { name: "General Ledger", icon: BarChart3, href: "/accounting?tab=general-ledger" },
      { name: "Account Reconciliation", icon: Shield, href: "/accounting?tab=reconciliation" },
      { name: "Period Close", icon: Clock, href: "/period-close", badge: "New" },
      { name: "Revenue Recognition", icon: FileBarChart, href: "/revenue-recognition", badge: "New" },
      { name: "Fixed Assets", icon: Package, href: "/fixed-assets", badge: "New" },
      { name: "Financial Reporting", icon: BarChart3, href: "/financial-reporting", badge: "New" },
      { name: "Tax Calculation", icon: Calculator, href: "/tax-calculation", badge: "New" },
      { name: "Inventory Management", icon: Package, href: "/inventory-management", badge: "New" },
      { name: "Budget Management", icon: BarChart3, href: "/budget-management", badge: "New" },
      { name: "Custom Report Builder", icon: FileText, href: "/custom-report-builder", badge: "New" },
    ],
  },
  {
    name: "Payroll & HR",
    icon: UserCheck,
    priority: "optional",
    items: [
      { name: "Payroll Dashboard", icon: BarChart3, href: "/payroll" },
      { name: "Employees", icon: Users, href: "/payroll?tab=employees" },
      { name: "Payroll Runs", icon: Calculator, href: "/payroll?tab=runs" },
      { name: "Deductions & Benefits", icon: Shield, href: "/payroll?tab=deductions" },
      { name: "Payroll Reports", icon: FileBarChart, href: "/payroll?tab=reports" },
      { name: "AI Compliance Alerts", icon: AlertTriangle, href: "/payroll?tab=alerts" },
    ],
  },
  {
    name: "Projects & Time",
    icon: Clock,
    priority: "optional",
    items: [
      { name: "Project Dashboard", icon: BarChart3, href: "/projects" },
      { name: "Projects / Jobs", icon: FolderOpen, href: "/projects?tab=jobs" },
      { name: "Tasks", icon: FileText, href: "/projects?tab=tasks" },
      { name: "Time Entries", icon: Clock, href: "/projects?tab=time" },
      { name: "AI Profitability Forecasts", icon: TrendingUp, href: "/projects?tab=forecasts" },
    ],
  },
  {
    name: "International",
    icon: Globe,
    priority: "optional",
    items: [
      { name: "Multi-Currency Dashboard", icon: DollarSign, href: "/international" },
      { name: "Currency Exchange", icon: TrendingUp, href: "/international?tab=exchange" },
      { name: "International Compliance", icon: Shield, href: "/international?tab=compliance" },
      { name: "Localization Settings", icon: Settings, href: "/international?tab=localization" },
    ],
  },
  {
    name: "Documents",
    icon: FolderOpen,
    priority: "utility",
    items: [
      { name: "Document Center", icon: FileText, href: "/documents" },
      { name: "File Storage", icon: FolderOpen, href: "/documents?tab=storage" },
      { name: "Approval Workflows", icon: UserCheck, href: "/documents?tab=workflows" },
      { name: "Version Control", icon: Clock, href: "/documents?tab=versions" },
      { name: "Audit Trails", icon: Shield, href: "/documents?tab=audit" },
    ],
  },
  {
    name: "Client Portal",
    icon: Users,
    priority: "utility",
    items: [
      { name: "Client Dashboard", icon: BarChart3, href: "/clients" },
      { name: "Client Communications", icon: MessageSquare, href: "/clients?tab=communications" },
      { name: "Document Sharing", icon: FileText, href: "/clients?tab=sharing" },
      { name: "Invoice Approvals", icon: UserCheck, href: "/clients?tab=approvals" },
      { name: "Client Self-Service", icon: Settings, href: "/clients?tab=self-service" },
    ],
  },
  {
    name: "Reports & Analytics",
    icon: PieChart,
    priority: "utility",
    items: [
      { name: "Accounting Reports", icon: Calculator, href: "/accounting-reports", badge: "New" },
      { name: "Standard Reports", icon: FileBarChart, href: "/reports" },
      { name: "Advanced Financial Reports", icon: BarChart3, href: "/enhanced-financial-reports", badge: "Advanced" },
      { name: "Advanced Analytics Dashboard", icon: TrendingUp, href: "/advanced-analytics", badge: "New" },
      { name: "Tax Reports", icon: Calculator, href: "/reports?tab=tax" },
      { name: "Custom Reports Builder", icon: Settings, href: "/reports?tab=builder" },
      { name: "AI Smart Reports", icon: Brain, href: "/reports?tab=ai" },
    ],
  },
  {
    name: "AI Insights",
    icon: Brain,
    priority: "utility",
    items: [
      { name: "AI Dashboard", icon: BarChart3, href: "/ai-insights" },
      { name: "Enhanced Conversational AI", icon: MessageSquare, href: "/enhanced-conversational-ai", badge: "New" },
      { name: "AI Financial Coach", icon: Target, href: "/ai-financial-coach", badge: "New" },
      { name: "Anomaly Detection Log", icon: AlertTriangle, href: "/ai-insights?tab=anomalies" },
      { name: "Smart Recommendations", icon: Zap, href: "/ai-insights?tab=recommendations" },
      { name: "Tax Optimization Insights", icon: Calculator, href: "/ai-insights?tab=tax-optimization" },
      { name: "Fraud Detection Alerts", icon: Shield, href: "/ai-insights?tab=fraud" },
    ],
  },
  {
    name: "Multi-Company",
    icon: Globe,
    priority: "optional",
    items: [
      { name: "Company Switcher", icon: Building2, href: "/multi-company?tab=switcher" },
      { name: "Currency Settings", icon: DollarSign, href: "/multi-company?tab=currency" },
      { name: "Consolidated Reports", icon: FileBarChart, href: "/multi-company?tab=reports" },
    ],
  },
  {
    name: "Security",
    icon: Shield,
    priority: "utility",
    items: [
      { name: "Security Dashboard", icon: Shield, href: "/security" },
      { name: "Access Control", icon: UserCheck, href: "/security?tab=access" },
      { name: "Audit Logs", icon: FileText, href: "/security?tab=audit" },
      { name: "Compliance Reports", icon: FileBarChart, href: "/security?tab=compliance" },
      { name: "Data Encryption", icon: Settings, href: "/security?tab=encryption" },
    ],
  },
  {
    name: "System Settings",
    icon: Settings,
    priority: "utility",
    items: [
      { name: "General Settings", icon: Settings, href: "/settings" },
      { name: "Users & Roles", icon: Users, href: "/settings?tab=users" },
      { name: "Payment Gateways", icon: CreditCard, href: "/settings?tab=payments" },
      { name: "Tax Configuration", icon: Calculator, href: "/settings?tab=taxes" },
      { name: "Audit Trail", icon: Shield, href: "/settings?tab=audit" },
    ],
  },
  {
    name: "AI-Powered Features",
    icon: Brain,
    priority: "utility",
    items: [
      { name: "Llama AI Intelligence", icon: Zap, href: "/llama-ai", badge: "New" },
      { name: "Auto-Bookkeeper Dashboard", icon: Calculator, href: "/auto-bookkeeper", badge: "New" },
      { name: "Voice-Enabled Accounting", icon: MessageSquare, href: "/voice-enabled-accounting", badge: "New" },
      { name: "Gamification Dashboard", icon: Target, href: "/gamification", badge: "New" },
    ],
  },
  {
    name: "Help & Support",
    icon: HelpCircle,
    priority: "utility",
    items: [
      { name: "Knowledge Base", icon: FileText, href: "/help?tab=knowledge" },
      { name: "Tutorials & Videos", icon: FileBarChart, href: "/help?tab=tutorials" },
      { name: "AI Chat Assistant", icon: MessageSquare, href: "/help?tab=chat" },
      { name: "Support Tickets", icon: HelpCircle, href: "/help?tab=tickets" },
    ],
  },
]

export function Sidebar() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { setFocusedElement } = useKeyboardNavigation()

  // Initialize expanded groups after component mounts to avoid hydration mismatch
  useEffect(() => {
    const defaultExpanded = navigationGroups
      .filter((group) => group.defaultExpanded)
      .map((group) => group.name)
    setExpandedGroups(new Set(defaultExpanded))
  }, [])

  const visibleGroups = navigationGroups.filter((group) => {
    if (group.priority === "core") return true
    if (group.priority === "utility") return true
    return userPreferences.enabledModules.has(group.name)
  })

  const filteredGroups = visibleGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          searchQuery === "" ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0)

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName)
    } else {
      newExpanded.add(groupName)
    }
    setExpandedGroups(newExpanded)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }

      if (document.activeElement?.closest("[data-sidebar]")) {
        const allItems = document.querySelectorAll("[data-sidebar-item]")

        if (e.key === "ArrowDown") {
          e.preventDefault()
          const nextIndex = Math.min(focusedIndex + 1, allItems.length - 1)
          setFocusedIndex(nextIndex)
          ;(allItems[nextIndex] as HTMLElement)?.focus()
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          const prevIndex = Math.max(focusedIndex - 1, 0)
          setFocusedIndex(prevIndex)
          ;(allItems[prevIndex] as HTMLElement)?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [focusedIndex])



  return (
    <div
      className={cn(
        "fixed left-0 top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40 hidden lg:flex",
        // Responsive height: full height on desktop, adapt to content on smaller screens
        "h-screen min-h-screen max-h-screen",
        // Ensure proper flex behavior
        "flex-shrink-0",
        // Responsive behavior for different screen sizes
        "lg:h-screen xl:h-screen 2xl:h-screen",
        // Responsive width
        isCollapsed ? "w-16" : "w-64",
      )}
      data-sidebar
      role="navigation"
      aria-label="Main navigation"
      style={{
        // Ensure sidebar takes full available height
        height: '100vh',
        maxHeight: '100vh',
        // Add responsive behavior
        minHeight: '100vh',
      }}
    >
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">UrutiIQ</h2>
              <p className="text-xs text-muted-foreground">AI Accounting</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto p-1 hover:bg-sidebar-accent/50 rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", isCollapsed ? "rotate-0" : "rotate-180")} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-3 py-2 border-b border-sidebar-border flex-shrink-0">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search menu... (Ctrl+/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-sidebar-accent/20 border border-sidebar-border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-muted-foreground"
              data-sidebar-search
              aria-label="Search navigation menu"
            />
          </div>
        </div>
      )}


      {!isCollapsed && (
        <div className="px-3 py-2 border-b border-sidebar-border flex-shrink-0">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Quick Access</h3>
          <div className="space-y-1" role="list" aria-label="Quick access items">
            {userPreferences.recentlyUsed.slice(0, 4).map((itemName) => {
              const item = navigationGroups.flatMap((g) => g.items).find((i) => i.name === itemName)
              if (!item) return null
              return (
                <Link
                  key={itemName}
                  href={item.href || "/dashboard"}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-sidebar-accent/30 text-muted-foreground hover:text-sidebar-foreground focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1"
                  data-sidebar-item
                  role="listitem"
                  aria-label={`Quick access: ${itemName}`}
                  onFocus={() => setFocusedElement("quick-access")}
                >
                  <item.icon className="w-3 h-3" />
                  <span className="truncate">{itemName}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 sidebar-scrollbar min-h-0 max-h-full" role="navigation" aria-label="Main menu">
        {filteredGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.name)
          return (
            <div key={group.name} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1"
                data-sidebar-item
                aria-expanded={isExpanded}
                aria-controls={`group-${group.name.replace(/\s+/g, "-").toLowerCase()}`}
                aria-label={`${group.name} menu group`}
                onFocus={() => setFocusedElement("nav-group")}
              >
                <group.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{group.name}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </button>

              {isExpanded && !isCollapsed && (
                <div
                  className="ml-6 space-y-1"
                  id={`group-${group.name.replace(/\s+/g, "-").toLowerCase()}`}
                  role="group"
                  aria-labelledby={`group-${group.name.replace(/\s+/g, "-").toLowerCase()}-button`}
                >
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href || "/dashboard"}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors relative focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1",
                        item.current
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
                      )}
                      data-sidebar-item
                      aria-current={item.current ? "page" : undefined}
                      aria-label={`${item.name}${item.favorite ? " (favorite)" : ""}${item.recent ? " (recently used)" : ""}`}
                      onFocus={() => setFocusedElement("nav-item")}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="flex-1">{item.name}</span>
                      {item.favorite && (
                        <div
                          className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
                          aria-label="Favorite item"
                        />
                      )}
                      {item.recent && (
                        <Clock
                          className="w-3 h-3 text-muted-foreground"
                          aria-label="Recently used"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border flex-shrink-0">
        {!isCollapsed ? (
          <div className="bg-card p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">Senior Accountant</p>
              </div>
              <button
                className="p-1 hover:bg-muted rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1"
                aria-label="User settings"
                data-sidebar-item
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              className="w-8 h-8 bg-muted rounded-full flex items-center justify-center focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1"
              aria-label="User profile: John Doe"
              data-sidebar-item
            >
              <span className="text-xs font-medium">JD</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
