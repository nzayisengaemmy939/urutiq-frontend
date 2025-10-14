import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { 
  LayoutDashboard, 
  Calculator, 
  DollarSign, 
  Building, 
  Package, 
  BarChart3, 
  Settings,
  Receipt,
  LogOut,
  Brain
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounting', href: '/dashboard/accounting', icon: Calculator },
  { name: 'Sales', href: '/dashboard/sales', icon: DollarSign },
  { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
  { name: 'Banking', href: '/dashboard/banking', icon: Building },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'AI Insights', href: '/dashboard/ai-insights', icon: Brain },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">UrutiIQ</h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Sign out
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}