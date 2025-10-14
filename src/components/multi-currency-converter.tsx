import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { 
  ArrowUpDown, 
  RefreshCw,
  Calculator,
  Globe,
  Clock,
  Play,
  Square
} from "lucide-react"
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2'
import { getApiUrl, getAuthHeaders } from '@/lib/config'
import { useToast } from '@/hooks/use-toast'

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

export function MultiCurrencyConverter() {
  const [currencies, setCurrencies] = useState<Record<string, CurrencyInfo>>({})
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [amount, setAmount] = useState('100')
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null)
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCurrencies()
  }, [])

  useEffect(() => {
    if (Object.keys(currencies).length > 0) {
      loadExchangeRate()
    }
  }, [fromCurrency, toCurrency])

  const loadCurrencies = async () => {
    try {
      const response = await bankingApi.getCurrencies()
      setCurrencies(response.currencies || {})
    } catch (error) {
    }
  }

  const loadExchangeRate = async () => {
    if (fromCurrency === toCurrency) {
      setExchangeRate({
        fromCurrency,
        toCurrency,
        rate: 1,
        timestamp: new Date().toISOString(),
        source: 'internal'
      })
      return
    }

    try {
      const response = await bankingApi.getExchangeRate(fromCurrency, toCurrency)
      // Handle the response structure - the API returns { success: true, rate: {...} }
      const rateData = response.rate
      setExchangeRate(rateData)
      setLastUpdated(new Date())
    } catch (error) {
    }
  }

  const forceRefreshRate = async () => {
    if (fromCurrency === toCurrency) return

    setLoading(true)
    try {
      const response = await bankingApi.forceRefreshRate(fromCurrency, toCurrency)
      const rateData = response.rate
      setExchangeRate(rateData)
      setLastUpdated(new Date())
      
      toast({
        title: "Rate Refreshed",
        description: `Fresh market rate: ${fromCurrency}/${toCurrency} = ${rateData.rate}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh exchange rate from market data",
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
      loadExchangeRate()
    }, 30000) // Refresh every 30 seconds
    setRefreshInterval(interval)
  }

  const stopLiveRates = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
    setIsLiveMode(false)
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshInterval])

  const convertCurrency = async () => {
    if (!amount || fromCurrency === toCurrency) {
      setConversion({
        amount: Number(amount),
        fromCurrency,
        toCurrency,
        convertedAmount: Number(amount),
        rate: 1,
        timestamp: new Date().toISOString()
      })
      return
    }

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
        fromCurrency,
        toCurrency,
        Number(amount)
      )
      
      // Handle the response structure - the API returns { success: true, conversion: {...} }
      const conversionData = response.conversion
      
      if (!conversionData) {
        throw new Error('Invalid response structure from currency conversion API')
      }
      
      setConversion(conversionData)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const formatCurrency = (amount: number, currency: string): string => {
    const currencyInfo = currencies[currency]
    if (!currencyInfo) return `${amount.toFixed(2)} ${currency}`

    const formattedAmount = amount.toFixed(currencyInfo.decimals)
    
    switch (currency) {
      case 'USD':
      case 'CAD':
      case 'AUD':
      case 'NZD':
      case 'SGD':
      case 'HKD':
        return `${currencyInfo.symbol}${formattedAmount}`
      case 'EUR':
        return `${formattedAmount} ${currencyInfo.symbol}`
      case 'GBP':
        return `${currencyInfo.symbol}${formattedAmount}`
      case 'JPY':
        return `${currencyInfo.symbol}${formattedAmount}`
      default:
        return `${formattedAmount} ${currencyInfo.symbol}`
    }
  }

  const formatExchangeRate = (rate: number): string => {
    // Show more precision for exchange rates (6 decimal places)
    return rate.toFixed(6)
  }

  const getRateChangeIcon = () => {
    if (!exchangeRate || exchangeRate.rate === 1) return null
    
    // TODO: Implement real trend calculation using historical data
    // For now, return null to indicate no trend data available
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Currency Converter
            </CardTitle>
            <div className="flex items-center gap-2">
              {isLiveMode ? (
                <Button onClick={stopLiveRates} size="sm" variant="destructive">
                  <Square className="w-3 h-3 mr-1" />
                  Stop Live
                </Button>
              ) : (
                <Button onClick={startLiveRates} size="sm" variant="default">
                  <Play className="w-3 h-3 mr-1" />
                  Start Live
                </Button>
              )}
              {lastUpdated && (
                <Badge variant={isLiveMode ? "default" : "secondary"} className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {isLiveMode ? "Live" : "Updated"} {lastUpdated.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="text-lg"
            />
          </div>

          {/* Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies).map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{code}</span>
                        <span className="text-muted-foreground">{info.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                className="rounded-full"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies).map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{code}</span>
                        <span className="text-muted-foreground">{info.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Convert Button */}
          <Button 
            onClick={convertCurrency} 
            disabled={loading || !amount}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert Currency'
            )}
          </Button>

          {/* Force Refresh Button */}
          <Button 
            onClick={forceRefreshRate} 
            disabled={loading || fromCurrency === toCurrency}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Refresh Market Rate
          </Button>

          {/* Conversion Result */}
          {conversion && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(conversion.convertedAmount || 0, toCurrency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(conversion.amount || 0, fromCurrency)} = {formatCurrency(conversion.convertedAmount || 0, toCurrency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Exchange rate: 1 {fromCurrency} = {formatExchangeRate(conversion.rate || 0)} {toCurrency}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Exchange Rate Information */}
      {exchangeRate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              Exchange Rate Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-medium">
                    1 {fromCurrency} = {formatExchangeRate(exchangeRate.rate || 0)} {toCurrency}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {exchangeRate.source === 'external_api' ? 'Live rate' : 'Internal rate'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRateChangeIcon()}
                  <Badge variant="secondary">
                    {exchangeRate.source}
                  </Badge>
                </div>
              </div>

              {lastUpdated && (
                <div className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleString()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">From Currency</div>
                  <div className="text-muted-foreground">
                    {currencies[fromCurrency]?.name} ({fromCurrency})
                  </div>
                </div>
                <div>
                  <div className="font-medium">To Currency</div>
                  <div className="text-muted-foreground">
                    {currencies[toCurrency]?.name} ({toCurrency})
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Currencies */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Currencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(currencies).map(([code, info]) => (
              <div key={code} className="flex items-center gap-2 p-2 border rounded-lg">
                <span className="font-medium">{code}</span>
                <span className="text-sm text-muted-foreground">{info.symbol}</span>
                <span className="text-xs text-muted-foreground">{info.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
