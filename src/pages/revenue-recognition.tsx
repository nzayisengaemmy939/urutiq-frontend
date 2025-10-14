import { useEffect, useState } from 'react'
import { PageLayout } from '../components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { FileText, CalendarDays, DollarSign } from 'lucide-react'
import { revenueRecognitionApi } from '../lib/api/accounting'
import { getCompanyId } from '../lib/config'
import { apiService } from '../lib/api'

export default function RevenueRecognitionPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const companyId = getCompanyId()

  useEffect(() => {
    ensureAuthAndLoadData()
  }, [])

  async function ensureAuthAndLoadData() {
    try {
      // Ensure we have a demo token
      await apiService.getDemoToken('demo_user', ['admin', 'accountant'])
      loadData()
    } catch (error) {
      console.error('Failed to get demo token:', error)
      loadData() // Try anyway
    }
  }

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [schedulesData, contractsData] = await Promise.all([
        revenueRecognitionApi.getSchedules(companyId),
        revenueRecognitionApi.getContracts(companyId)
      ])
      
      setSchedules(schedulesData)
      setContracts(contractsData)

      // Auto-seed demo data once per company if empty
    
    } catch (e: any) {
      console.error('Error loading revenue recognition data:', e)
      if (e?.message?.includes('<!DOCTYPE')) {
        setError('API endpoint not found. Please check if the backend is running.')
      } else {
        setError(e?.message || 'Failed to load data')
      }
    } finally {
      setLoading(false)
    }
  }

  async function seedDemoData() {
    setSeeding(true)
    try {
      // Create some demo revenue recognition contracts
      const demoContracts = [
        {
          id: 'contract-1',
          name: 'Software License - Annual',
          customer: 'Acme Corp',
          totalValue: 120000,
          currency: 'USD',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          recognitionMethod: 'straight_line'
        },
        {
          id: 'contract-2',
          name: 'Consulting Services',
          customer: 'Beta Inc',
          totalValue: 50000,
          currency: 'USD',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          recognitionMethod: 'milestone'
        }
      ]

      // Create demo recognition schedules
      const demoSchedules = [
        {
          id: 'schedule-1',
          contractId: 'contract-1',
          period: '2024-01',
          recognizedAmount: 10000,
          currency: 'USD',
          status: 'recognized'
        },
        {
          id: 'schedule-2',
          contractId: 'contract-1',
          period: '2024-02',
          recognizedAmount: 10000,
          currency: 'USD',
          status: 'recognized'
        }
      ]

      // In a real implementation, these would be saved to the backend
      setContracts(demoContracts)
      setSchedules(demoSchedules)
      
      console.log('Demo data seeded successfully')
    } catch (error) {
      console.error('Error seeding demo data:', error)
      setError('Failed to seed demo data')
    } finally {
      setSeeding(false)
    }
  }

  async function seedMoreDemoData() {
    setSeeding(true)
    try {
      // Add more demo data
      const additionalContracts = [
        {
          id: 'contract-3',
          name: 'Maintenance Contract',
          customer: 'Gamma LLC',
          totalValue: 25000,
          currency: 'USD',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          recognitionMethod: 'straight_line'
        }
      ]

      setContracts(prev => [...prev, ...additionalContracts])
      console.log('Additional demo data seeded successfully')
    } catch (error) {
      console.error('Error seeding additional demo data:', error)
      setError('Failed to seed additional demo data')
    } finally {
      setSeeding(false)
    }
  }

    const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Recognition</h1>
            <p className="text-gray-600 mt-1">Manage revenue contracts and recognition schedules</p>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error?.message || error?.toString() || 'Unknown error'}</p>
            </CardContent>
          </Card>
        )}

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                  <p className="text-2xl font-bold text-blue-600">{contracts.length}</p>
                </div>
                <div className="text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Schedules</p>
                  <p className="text-2xl font-bold text-green-600">{schedules.length}</p>
                </div>
                <div className="text-green-600">
                  <CalendarDays className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(schedules.reduce((sum, s) => sum + (s.amount || 0), 0))}
                  </p>
                </div>
                <div className="text-purple-600">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue Contracts</CardTitle>
                <Badge variant="outline">{contracts.length} contracts</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : contracts.length > 0 ? (
                <div className="space-y-3">
                  {contracts.map((contract, index) => (
                    <div key={contract.id || index} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{contract.name}</div>
                          <div className="text-sm text-gray-500">ID: {contract.id}</div>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">No contracts found</p>
                  <p className="text-sm mt-1">This data comes from the backend API - currently empty</p>
                  <div className="mt-4">
                    <div className="flex items-center gap-2 justify-center">
                      <Button onClick={seedDemoData} disabled={seeding}>
                        {seeding ? 'Seeding…' : 'Seed Demo Data'}
                      </Button>
                      <Button onClick={seedMoreDemoData} variant="outline" disabled={seeding}>
                        {seeding ? 'Seeding…' : 'Seed More'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recognition Schedules</CardTitle>
                <Badge variant="outline">{schedules.length} schedules</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : schedules.length > 0 ? (
                <div className="space-y-3">
                  {schedules.map((schedule, index) => (
                    <div key={schedule.id || index} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{schedule.name}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Method: {schedule.method?.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(schedule.amount, schedule.currency)}</div>
                          <Badge variant="secondary">{schedule.method}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">No schedules found</p>
                  <p className="text-sm mt-1">This data comes from the backend API - currently empty</p>
                  <div className="mt-4">
                    <div className="flex items-center gap-2 justify-center">
                      <Button onClick={seedDemoData} disabled={seeding}>
                        {seeding ? 'Seeding…' : 'Seed Demo Data'}
                      </Button>
                      <Button onClick={seedMoreDemoData} variant="outline" disabled={seeding}>
                        {seeding ? 'Seeding…' : 'Seed More'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
