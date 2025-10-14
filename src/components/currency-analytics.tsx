import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Target,
  Shield,
  RefreshCw,
  Calendar,
  DollarSign,
  Euro,
  PoundSterling,
  Circle
} from "lucide-react"
import { currencyService, CurrencyPair, MarketStatus } from '@/services/currency-service'
import { useToast } from '@/hooks/use-toast'

interface CurrencyAnalyticsComponentProps {
  fromCurrency: string
  toCurrency: string
}

export function CurrencyAnalytics({ fromCurrency, toCurrency }: CurrencyAnalyticsComponentProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [pairs, setPairs] = useState<CurrencyPair[]>([])
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const { toast } = useToast()

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [analyticsData, pairsData, marketData] = await Promise.all([
        currencyService.getCurrencyAnalytics(fromCurrency, toCurrency),
        currencyService.getPopularPairs(),
        currencyService.getMarketStatus()
      ])
      
      setAnalytics(analyticsData)
      setPairs(pairsData)
      setMarketStatus(marketData)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast({
        title: "Error",
        description: "Failed to load currency analytics",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fromCurrency && toCurrency) {
      loadAnalytics()
    }
  }, [fromCurrency, toCurrency])

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return <DollarSign className="w-4 h-4" />
      case 'EUR': return <Euro className="w-4 h-4" />
      case 'GBP': return <PoundSterling className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-600 bg-green-50'
      case 'bearish': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Status */}
      {marketStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Market Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={marketStatus.isOpen ? "default" : "secondary"}>
                  {marketStatus.isOpen ? "Open" : "Closed"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {marketStatus.timezone}
                </span>
              </div>
              {!marketStatus.isOpen && marketStatus.nextOpen && (
                <div className="text-sm text-muted-foreground">
                  Opens: {new Date(marketStatus.nextOpen).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Volatility</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.volatility)}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(analytics.trend)}
                    <span className="text-lg font-semibold capitalize">{analytics.trend}</span>
                  </div>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Support</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.support, 4)}</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resistance</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.resistance, 4)}</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Technical Indicators */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Technical Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold">RSI (14)</h4>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{formatNumber(analytics.rsi)}</div>
                  <Badge variant={analytics.rsi > 70 ? "destructive" : analytics.rsi < 30 ? "default" : "secondary"}>
                    {analytics.rsi > 70 ? "Overbought" : analytics.rsi < 30 ? "Oversold" : "Neutral"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">MA (7)</h4>
                <div className="text-2xl font-bold">{formatNumber(analytics.movingAverage7, 4)}</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">MA (30)</h4>
                <div className="text-2xl font-bold">{formatNumber(analytics.movingAverage30, 4)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Pairs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Popular Currency Pairs
            </CardTitle>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 Day</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pairs.map((pair, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getCurrencyIcon(pair.pair.split('/')[0])}
                    <span className="font-semibold">{pair.pair.split('/')[0]}</span>
                    <span className="text-muted-foreground">/</span>
                    {getCurrencyIcon(pair.pair.split('/')[1])}
                    <span className="font-semibold">{pair.pair.split('/')[1]}</span>
                  </div>
                  <div className="text-2xl font-bold">{formatNumber(pair.rate, 4)}</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-sm ${pair.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(pair.changePercent24h)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatNumber(pair.change24h, 6)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">High</div>
                    <div className="text-sm font-semibold">{formatNumber(pair.high24h, 4)}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Low</div>
                    <div className="text-sm font-semibold">{formatNumber(pair.low24h, 4)}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Volume</div>
                    <div className="text-sm font-semibold">{formatNumber(pair.volume24h)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={loadAnalytics} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </Button>
      </div>
    </div>
  )
}
