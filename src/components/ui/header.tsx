import { Bell } from 'lucide-react'
import { Button } from './button'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 md:hidden">UrutiIQ</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {/* Search removed */}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Demo User</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
