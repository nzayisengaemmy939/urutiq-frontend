import { Brain, Search, Bell, Settings, User, LogOut } from "lucide-react"
import React from "react"
import { GlobalSearch } from "./global-search"
import { MobileNavigation } from "./mobile-navigation"
import { useAuth } from "../contexts/auth-context"
import { useSidebar } from "../contexts/sidebar-context"
import { Button } from "./ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../lib/api"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"

export function Header() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const { isCollapsed } = useSidebar()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const qc = useQueryClient()
  
  React.useEffect(() => {
    console.log('🔐 Header - Auth state:', { isAuthenticated, user, isLoading })
  }, [isAuthenticated, user, isLoading])
  
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const result = await apiService.getCompanies() as any;
      console.log('🏢 Header - Companies API response:', result);
      // Handle different response formats
      if (Array.isArray(result)) {
        console.log('✅ Header - Returning array directly:', result.length, 'companies');
        return result;
      }
      if (result?.data && Array.isArray(result.data)) {
        console.log('✅ Header - Returning result.data:', result.data.length, 'companies');
        return result.data;
      }
      if (result?.items && Array.isArray(result.items)) {
        console.log('✅ Header - Returning result.items:', result.items.length, 'companies');
        return result.items;
      }
      console.log('⚠️ Header - No companies found, returning empty array');
      return [];
    },
    enabled: isAuthenticated
  })
  const companiesList = React.useMemo(() => {
    console.log('🏢 Header - companiesList memo:', companies);
    if (!companies) return [];
    if (Array.isArray(companies)) return companies;
    if (companies.data && Array.isArray(companies.data)) return companies.data;
    return [];
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
    console.log('🔄 Company changing from', activeCompany, 'to', id)
    setActiveCompany(id)
    try { 
      localStorage.setItem('company_id', id) 
      // Also set the other keys for compatibility
      localStorage.setItem('companyId', id)
      localStorage.setItem('company', id)
      console.log('✅ Company ID saved to localStorage:', id)
    } catch (error) {
      console.error('❌ Error saving company ID:', error)
    }
    
    // Invalidate all queries to force refetch with new company ID
    try {
      qc.invalidateQueries()
      // Also clear the cache to ensure fresh data
      qc.clear()
      console.log('✅ React Query cache cleared')
      
      // Dispatch custom event for pages that don't use React Query
      const event = new CustomEvent('companyChanged', { 
        detail: { companyId: id, oldCompanyId: activeCompany } 
      });
      window.dispatchEvent(event);
      console.log('✅ Company change event dispatched')
    } catch (error) {
      console.error('❌ Error clearing cache:', error)
    }
  }

  if (!mounted) {
    return (
      <header 
        className={`fixed top-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-all duration-300 ${
          isCollapsed ? 'left-16' : 'left-64'
        }`} 
        suppressHydrationWarning
      >
        <div className="h-14 lg:h-16" />
      </header>
    )
  }

  // Don't render if auth is still loading
  if (isLoading) {
    return (
      <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header 
      className={`fixed top-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-all duration-300 ${
        isCollapsed ? 'left-16' : 'left-64'
      }`}
    >
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
          <div className="flex items-center gap-2">
            <select value={activeCompany} onChange={onCompanyChange} className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-border focus:border-border min-w-[200px]">
              {!companiesList.length && <option value="">No companies available</option>}
              {companiesList.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {!companiesList.length && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Set default company for testing
                  localStorage.setItem('company_id', 'seed-company-1');
                  localStorage.setItem('company_name', 'Demo Company');
                  localStorage.setItem('tenant_id', 'tenant_demo');
                  console.log('🔧 Set default company for testing');
                  window.location.reload();
                }}
                className="text-xs"
              >
                Set Demo
              </Button>
            )}
          </div>
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
      {/* {mounted && companiesList.length === 0 && (
        <div className="px-4 lg:px-6 pb-3">
          <Alert>
            <AlertTitle>No company found</AlertTitle>
            <AlertDescription>
              Create a company to start recording transactions. Go to Settings to add your first company.
            </AlertDescription>
          </Alert>
        </div>
      )} */}
    </header>
  )
}
