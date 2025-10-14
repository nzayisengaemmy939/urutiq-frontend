"use client"

import { Brain, Search, Bell, Settings, User, LogOut } from "lucide-react"
import React from "react"
import { GlobalSearch } from "./global-search"
import { MobileNavigation } from "./mobile-navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "./ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useDemoAuth } from "@/hooks/useDemoAuth"
import { apiService } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"

export function Header() {
  const { user, logout } = useAuth()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const qc = useQueryClient()
  const { ready: authReady } = useDemoAuth('header')
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await apiService.getCompanies()).data || [],
    enabled: authReady
  })
  const companiesList = React.useMemo(() => {
    const maybe = companies as any
    if (Array.isArray(maybe)) return maybe
    if (maybe && Array.isArray(maybe.data)) return maybe.data
    return [] as any[]
  }, [companies])
  const [activeCompany, setActiveCompany] = React.useState<string | undefined>(undefined)
  React.useEffect(() => {
    if (!mounted) return
    try {
      const c = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company')
      if (c) setActiveCompany(c)
    } catch {}
  }, [mounted])
  const onCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setActiveCompany(id)
    try { localStorage.setItem('company_id', id) } catch {}
    // Invalidate only queries that are likely dependent on the active company
    try {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['estimates'] })
      qc.invalidateQueries({ queryKey: ['financial-insights'] })
    } catch {}
  }

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border lg:left-64" suppressHydrationWarning>
        <div className="h-14 lg:h-16" />
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border lg:left-64">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
        {/* Left side - Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground">UrutiIQ</h1>
            <p className="text-xs text-muted-foreground">AI Accounting</p>
          </div>
        </div>

        {/* Center - Search and Client Selector */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl mx-8">
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <select value={activeCompany} onChange={onCompanyChange} className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 min-w-[200px]">
            {!companiesList.length && <option value="">No companies</option>}
            {companiesList.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Right side - Actions and User */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Search className="w-4 h-4 md:hidden" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.firstName} />
                    <AvatarFallback>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.companyName}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
          )}
          
          <div className="md:hidden">
            <MobileNavigation />
          </div>
        </div>
      </div>

      {/* Company prompt when none exists */}
      {mounted && companiesList.length === 0 && (
        <div className="px-4 lg:px-6 pb-3">
          <Alert>
            <AlertTitle>No company found</AlertTitle>
            <AlertDescription>
              Create a company to start recording transactions. Go to Settings to add your first company.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </header>
  )
}
