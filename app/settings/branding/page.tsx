"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CompanyBranding } from '@/components/company-branding'
import { PageLayout } from '@/components/page-layout'
import apiService from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

export default function BrandingSettingsPage() {
  const { user } = useAuth()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')

  // Load companies for the user
  const { data: companiesResponse, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiService.getCompanies(),
    enabled: !!user
  })

  const companies = companiesResponse?.data || []

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (companies.length === 0) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Companies Found</h2>
          <p className="text-gray-600 mb-6">
            You need to create a company before you can customize branding settings.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Create Company
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Company Selector */}
        {companies.length > 1 && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Select Company</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => setSelectedCompanyId(company.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedCompanyId === company.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{company.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {company.industry || 'No industry specified'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Branding Settings */}
        {selectedCompanyId ? (
          <CompanyBranding 
            companyId={selectedCompanyId}
            onSave={() => {
              // Could add success notification here
              console.log('Branding settings saved!')
            }}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {companies.length === 1 ? 'Customize Your Branding' : 'Select a Company'}
            </h3>
            <p className="text-gray-600">
              {companies.length === 1 
                ? 'Click below to customize your company\'s branding and invoice templates.'
                : 'Choose a company above to customize its branding settings.'
              }
            </p>
            {companies.length === 1 && (
              <button 
                onClick={() => setSelectedCompanyId(companies[0].id)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Customize Branding
              </button>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
