import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { bankingApi, BankAccount } from '@/lib/api/banking'

interface CashFlowForecastProps {
  companyId?: string
}

interface ForecastData {
  currentBalance: number
  forecast: Array<{
    date: string
    projectedBalance: number
    expectedChange: number
    confidence: number
  }>
  analysis: {
    dailyAverages: Record<number, number>
    recurringPatterns: number
    transactionCount: number
    averageDailyChange: number
  }
}

export function CashFlowForecast({ companyId }: CashFlowForecastProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [forecastDays, setForecastDays] = useState<number>(30)
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBankAccounts()
  }, [])

  useEffect(() => {
    if (selectedAccountId) {
      generateForecast()
    }
  }, [selectedAccountId, forecastDays])

  const loadBankAccounts = async () => {
    try {
      const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      const accounts = await bankingApi.getBankAccounts(currentCompanyId)
      setBankAccounts(accounts)
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id)
      }
    } catch (error) {
      console.error('Error loading bank accounts:', error)
      setError('Failed to load bank accounts')
    }
  }

  const generateForecast = async () => {
    if (!selectedAccountId) return

    setLoading(true)
    setError(null)
    
    try {
      const currentCompanyId = companyId || localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      
      const response = await fetch(`/api/cash-flow-forecast?bankAccountId=${selectedAccountId}&companyId=${currentCompanyId}&days=${forecastDays}`, {
        headers: {
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to generate forecast')
      }

      const data = await response.json()
      setForecastData(data)
    } catch (error: any) {
      console.error('Error generating forecast:', error)
      setError(error.message || 'Failed to generate forecast')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const selectedAccount = bankAccounts.find(acc => acc.id === selectedAccountId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cash Flow Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Bank Account</label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-32">
              <label className="text-sm font-medium mb-2 block">Forecast Period</label>
              <Select value={forecastDays.toString()} onValueChange={(value) => setForecastDays(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateForecast} disabled={loading || !selectedAccountId}>
              {loading ? 'Generating...' : 'Generate Forecast'}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {forecastData && (
        <>
          {/* Current Balance & Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Current Balance</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(forecastData.currentBalance)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Avg Daily Change</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(forecastData.analysis.averageDailyChange)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Transactions Analyzed</span>
                </div>
                <p className="text-2xl font-bold">
                  {forecastData.analysis.transactionCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Projected Balance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecastData.forecast.slice(0, 14).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-20">
                        {formatDate(day.date)}
                      </span>
                      <div className="flex items-center gap-2">
                        {day.expectedChange > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : day.expectedChange < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : null}
                        <span className={`text-sm ${day.expectedChange > 0 ? 'text-green-600' : day.expectedChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {day.expectedChange > 0 ? '+' : ''}{formatCurrency(day.expectedChange)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {formatCurrency(day.projectedBalance)}
                      </span>
                      <Badge className={getConfidenceColor(day.confidence)}>
                        {Math.round(day.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {forecastData.forecast.length > 14 && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    ... and {forecastData.forecast.length - 14} more days
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Daily Patterns</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(forecastData.analysis.dailyAverages).map(([day, avg]) => (
                      <div key={day} className="flex justify-between">
                        <span>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)]}:</span>
                        <span className={avg > 0 ? 'text-green-600' : avg < 0 ? 'text-red-600' : 'text-gray-600'}>
                          {formatCurrency(avg)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Patterns Identified</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Recurring Patterns:</span>
                      <span>{forecastData.analysis.recurringPatterns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Transactions:</span>
                      <span>{forecastData.analysis.transactionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Forecast Period:</span>
                      <span>{forecastDays} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
