import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Calculator,
  Globe,
  AlertCircle,
  Clock,
  DollarSign,
  Euro,
  PoundSterling,
  Circle,
  Play,
  Square,
  Settings
} from "lucide-react"
import { bankingApi } from '@/lib/api/banking'
import { getApiUrl, getAuthHeaders } from '@/lib/config'
import { currencyService } from '@/services/currency-service'
import { useToast } from '@/hooks/use-toast'
import { CurrencyAnalytics } from './currency-analytics'
import { CurrencyChart } from './currency-chart'

interface CurrencyInfo {
  symbol: string
  decimals: number
  name: string
}

interface ExchangeRate {
  fromCurrency: string
  toCurrency: string
  rate: number
  timestamp: string
  source: string
}

interface CurrencyConversion {
  amount: number
  fromCurrency: string
  toCurrency: string
  convertedAmount: number
  rate: number
  timestamp: string
}

interface CurrencyAlert {
  id: string
  fromCurrency: string
  toCurrency: string
  targetRate: number
  currentRate: number
  condition: 'above' | 'below'
  isActive: boolean
  createdAt: string
}

export function CurrencyDashboard() {
  const [currencies, setCurrencies] = useState<Record<string, CurrencyInfo>>({})
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [amount, setAmount] = useState('100')
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null)
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [popularRates, setPopularRates] = useState<ExchangeRate[]>([])
  const [alerts, setAlerts] = useState<CurrencyAlert[]>([])
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [newAlert, setNewAlert] = useState({
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    targetRate: 0.85,
    condition: 'below' as 'above' | 'below'
  })
  const { toast } = useToast()

  // Load currencies on component mount
  useEffect(() => {
    loadCurrencies()
    loadPopularRates()
    loadAlerts()
  }, [])

  const loadCurrencies = async () => {
    try {
      const response = await bankingApi.getCurrencies()
      setCurrencies(response.currencies)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load currencies",
        variant: "destructive"
      })
    }
  }

  const loadPopularRates = async () => {
    try {
      const popularPairs = [
        { from: 'USD', to: 'EUR' },
        { from: 'USD', to: 'GBP' },
        { from: 'USD', to: 'JPY' },
        { from: 'EUR', to: 'GBP' },
        { from: 'USD', to: 'CAD' },
        { from: 'USD', to: 'AUD' },
        { from: 'USD', to: 'FRW' },
        { from: 'EUR', to: 'FRW' }
      ]

      const rates = await Promise.all(
        popularPairs.map(async (pair) => {
          try {
            const response = await bankingApi.getExchangeRate(pair.from, pair.to)
            // Handle the response structure - the API returns { success: true, rate: {...} }
            return response.rate
          } catch (error) {
            return null
          }
        })
      )

      setPopularRates(rates.filter(rate => rate !== null))
    } catch (error) {
    }
  }

  const loadAlerts = async () => {
    try {
      const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || 'seed-company-1'
      const response = await fetch(getApiUrl(`api/currency-alerts?companyId=${companyId}`), {
        headers: {
          ...getAuthHeaders(),
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      } else {
        // Provide mock data when API is not available
        setAlerts([
          {
            id: '1',
            fromCurrency: 'USD',
            toCurrency: 'EUR',
            targetRate: 0.85,
            currentRate: 0.87,
            condition: 'above',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            fromCurrency: 'USD',
            toCurrency: 'GBP',
            targetRate: 0.75,
            currentRate: 0.73,
            condition: 'below',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Error loading currency alerts:', error)
      // Provide mock data when API is not available
      setAlerts([
        {
          id: '1',
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          targetRate: 0.85,
          currentRate: 0.87,
          condition: 'above',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          fromCurrency: 'USD',
          toCurrency: 'GBP',
          targetRate: 0.75,
          currentRate: 0.73,
          condition: 'below',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ])
    }
  }

  const convertCurrency = async () => {
    if (!amount || !fromCurrency || !toCurrency) return

    setLoading(true)
    try {
      // Check if user is authenticated, if not get a demo token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        try {
          const demoResponse = await fetch(getApiUrl('auth/demo-token'), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ sub: 'demo-user-1', tenantId: 'tenant_demo', roles: ['admin', 'accountant'] })
          })
          const demoData = await demoResponse.json()
          if (demoData.token) {
            localStorage.setItem('auth_token', demoData.token)
            localStorage.setItem('tenant_id', 'tenant_demo')
          }
        } catch (error) {
        }
      }

      const response = await bankingApi.convertCurrency(
        Number(amount),
        fromCurrency,
        toCurrency
      )
      
      // Handle the response structure - the API returns { success: true, conversion: {...} }
      const conversionData = response.conversion
      
      if (!conversionData) {
        // If response is empty, it might be an authentication or API error
        if (Object.keys(response || {}).length === 0) {
          throw new Error('Empty response from currency conversion API - check authentication and API status')
        }
        
        throw new Error('Invalid response structure from currency conversion API')
      }
      
      setConversion(conversionData)
      setLastUpdated(new Date())
      
      toast({
        title: "Conversion Complete",
        description: `${amount} ${fromCurrency} = ${conversionData.convertedAmount?.toFixed(2) || '0.00'} ${toCurrency}`,
      })
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Failed to convert currency",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getExchangeRate = async () => {
    if (!fromCurrency || !toCurrency) return

    setLoading(true)
    try {
      const response = await bankingApi.getExchangeRate(fromCurrency, toCurrency)
      // Handle the response structure - the API returns { success: true, rate: {...} }
      const rateData = response.rate
      setExchangeRate(rateData)
      setLastUpdated(new Date())
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get exchange rate",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshRates = async () => {
    setLoading(true)
    try {
      await loadPopularRates()
      if (fromCurrency && toCurrency) {
        await getExchangeRate()
      }
      if (!isLiveMode) {
        toast({
          title: "Rates Updated",
          description: "Exchange rates have been refreshed",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh rates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const startLiveRates = () => {
    if (refreshInterval) return // Already running
    
    setIsLiveMode(true)
    const interval = setInterval(() => {
      refreshRates()
    }, 30000) // Refresh every 30 seconds
    setRefreshInterval(interval)
    toast({
      title: "Live Rates Started",
      description: "Exchange rates will refresh every 30 seconds",
    })
  }

  const stopLiveRates = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
    setIsLiveMode(false)
    toast({
      title: "Live Rates Stopped",
      description: "Exchange rates will no longer auto-refresh",
    })
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshInterval])

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return <DollarSign className="w-4 h-4" />
      case 'EUR': return <Euro className="w-4 h-4" />
      case 'GBP': return <PoundSterling className="w-4 h-4" />
      case 'JPY': return <Circle className="w-4 h-4" />
      case 'FRW': return <Globe className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = currencies[currency]
    if (!currencyInfo) return `${amount.toFixed(2)} ${currency}`
    
    const formattedAmount = amount.toFixed(currencyInfo.decimals)
    return `${currencyInfo.symbol}${formattedAmount}`
  }

  const getRateChange = (_rate: ExchangeRate) => {
    // TODO: Implement real rate change calculation using historical data
    // For now, return null to indicate no change data available
    return null as { value: number; percentage: string; isPositive: boolean } | null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Currency Dashboard</h2>
          <p className="text-muted-foreground">Real-time exchange rates and currency conversion</p>
        </div>
        <div className="flex items-center gap-2">
          {isLiveMode ? (
            <Button onClick={stopLiveRates} variant="destructive">
              <Square className="w-4 h-4 mr-2" />
              Stop Live
            </Button>
          ) : (
            <Button onClick={startLiveRates} variant="default">
              <Play className="w-4 h-4 mr-2" />
              Start Live
            </Button>
          )}
          <Button onClick={refreshRates} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Rates
          </Button>
          {lastUpdated && (
            <Badge variant={isLiveMode ? "default" : "secondary"} className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {isLiveMode ? "Live" : "Updated"} {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="converter" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="converter">Converter</TabsTrigger>
          <TabsTrigger value="rates">Live Rates</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Currency Converter Tab */}
        <TabsContent value="converter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Currency Converter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-currency">From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center gap-2">
                            {getCurrencyIcon(code)}
                            {code} - {info.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-currency">To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center gap-2">
                            {getCurrencyIcon(code)}
                            {code} - {info.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={convertCurrency} disabled={loading} className="flex-1">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Convert
                </Button>
                <Button onClick={getExchangeRate} disabled={loading} variant="outline">
                  Get Rate
                </Button>
              </div>

              {conversion && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatCurrency(conversion.convertedAmount || 0, conversion.toCurrency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(conversion.amount || 0, conversion.fromCurrency)} at {conversion.rate?.toFixed(4) || '0.0000'} rate
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Updated {new Date(conversion.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {exchangeRate && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      1 {exchangeRate.fromCurrency} = {exchangeRate.rate?.toFixed(4) || '0.0000'} {exchangeRate.toCurrency}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Source: {exchangeRate.source} • {new Date(exchangeRate.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Live Exchange Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularRates.map((rate, index) => {
                  const change = getRateChange(rate)
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCurrencyIcon(rate.fromCurrency)}
                          <span className="font-semibold">{rate.fromCurrency}</span>
                          <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                          {getCurrencyIcon(rate.toCurrency)}
                          <span className="font-semibold">{rate.toCurrency}</span>
                        </div>
                        {change && (
                          <Badge variant={change.isPositive ? "default" : "destructive"}>
                            {change.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {change.percentage}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold">
                        {rate.rate?.toFixed(4) || '0.0000'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(rate.timestamp).toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Currency Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Alert */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Create New Alert</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Select value={newAlert.fromCurrency} onValueChange={(value) => setNewAlert({...newAlert, fromCurrency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies).map(([code, _info]) => (
                        <SelectItem key={code} value={code}>{code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newAlert.toCurrency} onValueChange={(value) => setNewAlert({...newAlert, toCurrency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies).map(([code, _info]) => (
                        <SelectItem key={code} value={code}>{code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newAlert.targetRate}
                    onChange={(e) => setNewAlert({...newAlert, targetRate: Number(e.target.value)})}
                    placeholder="Target Rate"
                  />
                  <Select value={newAlert.condition} onValueChange={(value: 'above' | 'below') => setNewAlert({...newAlert, condition: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="mt-3" size="sm">
                  Create Alert
                </Button>
              </div>

              {/* Active Alerts */}
              <div className="space-y-2">
                <h4 className="font-semibold">Active Alerts</h4>
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {getCurrencyIcon(alert.fromCurrency)}
                        <span className="font-medium">{alert.fromCurrency}</span>
                        <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                        {getCurrencyIcon(alert.toCurrency)}
                        <span className="font-medium">{alert.toCurrency}</span>
                      </div>
                      <Badge variant={alert.condition === 'above' ? 'default' : 'destructive'}>
                        {alert.condition === 'above' ? 'Above' : 'Below'} {alert.targetRate}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Current: {alert.currentRate?.toFixed(4) || '0.0000'}
                      </span>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        {/* Chart Tab */}
        <TabsContent value="chart" className="space-y-6">
          <CurrencyChart fromCurrency={fromCurrency} toCurrency={toCurrency} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <CurrencyAnalytics fromCurrency={fromCurrency} toCurrency={toCurrency} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Currency Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Display Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default From Currency</Label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(currencies).map(([code, info]) => (
                          <SelectItem key={code} value={code}>
                            <div className="flex items-center gap-2">
                              {getCurrencyIcon(code)}
                              {code} - {info.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default To Currency</Label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(currencies).map(([code, info]) => (
                          <SelectItem key={code} value={code}>
                            <div className="flex items-center gap-2">
                              {getCurrencyIcon(code)}
                              {code} - {info.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Live Rates Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Auto-refresh interval</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable notifications</Label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Cache Management</h4>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => currencyService.clearCache()}>
                    Clear Cache
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const stats = currencyService.getCacheStats()
                    toast({
                      title: "Cache Stats",
                      description: `Cache size: ${stats.size} items`,
                    })
                  }}>
                    View Cache Stats
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
