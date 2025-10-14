"use client"

import { useState, useEffect } from 'react'
import { ResponsiveBankingLayout } from '@/components/responsive-banking-layout'
import { useAuth } from '@/contexts/auth-context'

export default function BankingPage() {
  const { isAuthenticated, isLoading, loginWithDemo } = useAuth()
  const [companyId, setCompanyId] = useState<string>('')

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      loginWithDemo()
    }
  }, [isAuthenticated, isLoading, loginWithDemo])

  useEffect(() => {
    // Get company ID from localStorage or use default
    const storedCompanyId = localStorage.getItem('selectedCompany')
    if (storedCompanyId) {
      setCompanyId(storedCompanyId)
    } else {
      setCompanyId('seed-company-1') // Default company
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading banking interface...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access banking features.</p>
          <button 
            onClick={loginWithDemo}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login with Demo
          </button>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveBankingLayout companyId={companyId} />
  )
}
