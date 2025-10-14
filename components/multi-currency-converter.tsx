"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Calculator,
  Globe
} from "lucide-react"
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2'

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
      const response = await bankingApi.get('/currencies')
      setCurrencies(response.currencies || {})
    } catch (error) {
      console.error('Error loading currencies:', error)
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
      const response = await bankingApi.get(`/exchange-rates/${fromCurrency}/${toCurrency}`)
      setExchangeRate(response.rate)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading exchange rate:', error)
    }
  }

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
      const response = await bankingApi.post('/convert-currency', {
        amount: Number(amount),
        fromCurrency,
        toCurrency
      })
      setConversion(response.conversion)
    } catch (error) {
      console.error('Error converting currency:', error)
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

  const getRateChangeIcon = () => {
    if (!exchangeRate || exchangeRate.rate === 1) return null
    
    // Mock logic - in real app, compare with previous rate
    const isIncreasing = Math.random() > 0.5
    return isIncreasing ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Currency Converter
          </CardTitle>
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

          {/* Conversion Result */}
          {conversion && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(conversion.convertedAmount, toCurrency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(conversion.amount, fromCurrency)} = {formatCurrency(conversion.convertedAmount, toCurrency)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Exchange rate: 1 {fromCurrency} = {conversion.rate.toFixed(4)} {toCurrency}
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
                    1 {fromCurrency} = {exchangeRate.rate.toFixed(4)} {toCurrency}
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
