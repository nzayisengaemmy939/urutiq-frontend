import { bankingApi } from '@/lib/api/banking'

export interface CurrencyRate {
  fromCurrency: string
  toCurrency: string
  rate: number
  timestamp: string
  source: string
  change24h?: number
  changePercent24h?: number
  high24h?: number
  low24h?: number
  volume24h?: number
}

export interface CurrencyPair {
  pair: string
  rate: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  volume24h: number
  lastUpdated: string
}

export interface HistoricalRate {
  date: string
  rate: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface CurrencyAnalytics {
  volatility: number
  trend: 'bullish' | 'bearish' | 'sideways'
  support: number
  resistance: number
  rsi: number
  movingAverage7: number
  movingAverage30: number
}

export interface MarketStatus {
  isOpen: boolean
  nextOpen: string
  nextClose: string
  timezone: string
}

class CurrencyService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly CACHE_TTL = 30000 // 30 seconds
  private readonly RETRY_ATTEMPTS = 3
  private readonly RETRY_DELAY = 1000

  private async withRetry<T>(fn: () => Promise<T>, attempts = this.RETRY_ATTEMPTS): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (attempts > 1) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY))
        return this.withRetry(fn, attempts - 1)
      }
      throw error
    }
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    return `${endpoint}${params ? `_${JSON.stringify(params)}` : ''}`
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < cached.ttl
  }

  private setCache(key: string, data: any, ttl = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    return cached ? cached.data : null
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string, date?: string): Promise<CurrencyRate> {
    const cacheKey = this.getCacheKey('exchange-rate', { fromCurrency, toCurrency, date })
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached<CurrencyRate>(cacheKey)!
    }

    const rate = await this.withRetry(async () => {
      const response = await bankingApi.getExchangeRate(fromCurrency, toCurrency, date)
      return response.rate || response
    })

    // Enhance with additional data
    const enhancedRate: CurrencyRate = {
      ...rate,
      change24h: this.calculateChange24h(rate.rate),
      changePercent24h: this.calculateChangePercent24h(rate.rate),
      high24h: this.calculateHigh24h(rate.rate),
      low24h: this.calculateLow24h(rate.rate),
      volume24h: this.calculateVolume24h(fromCurrency, toCurrency)
    }

    this.setCache(cacheKey, enhancedRate)
    return enhancedRate
  }

  async getPopularPairs(): Promise<CurrencyPair[]> {
    const cacheKey = this.getCacheKey('popular-pairs')
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached<CurrencyPair[]>(cacheKey)!
    }

    const pairs = await this.withRetry(async () => {
      const popularPairs = [
        { from: 'USD', to: 'EUR' },
        { from: 'USD', to: 'GBP' },
        { from: 'USD', to: 'JPY' },
        { from: 'USD', to: 'CAD' },
        { from: 'USD', to: 'AUD' },
        { from: 'EUR', to: 'GBP' },
        { from: 'EUR', to: 'JPY' },
        { from: 'GBP', to: 'JPY' }
      ]

      const rates = await Promise.all(
        popularPairs.map(async (pair) => {
          try {
            const rate = await this.getExchangeRate(pair.from, pair.to)
            return {
              pair: `${pair.from}/${pair.to}`,
              rate: rate.rate,
              change24h: rate.change24h || 0,
              changePercent24h: rate.changePercent24h || 0,
              high24h: rate.high24h || rate.rate,
              low24h: rate.low24h || rate.rate,
              volume24h: rate.volume24h || 0,
              lastUpdated: rate.timestamp
            }
          } catch (error) {
            console.error(`Error fetching rate for ${pair.from}/${pair.to}:`, error)
            return null
          }
        })
      )

      return rates.filter(Boolean) as CurrencyPair[]
    })

    this.setCache(cacheKey, pairs, 60000) // Cache for 1 minute
    return pairs
  }

  async getHistoricalRates(
    fromCurrency: string, 
    toCurrency: string, 
    startDate: string, 
    endDate: string
  ): Promise<HistoricalRate[]> {
    const cacheKey = this.getCacheKey('historical-rates', { fromCurrency, toCurrency, startDate, endDate })
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached<HistoricalRate[]>(cacheKey)!
    }

    const rates = await this.withRetry(async () => {
      const response = await bankingApi.getHistoricalRates(fromCurrency, toCurrency, startDate, endDate)
      return response.rates || response || []
    })

    this.setCache(cacheKey, rates, 300000) // Cache for 5 minutes
    return rates
  }

  async getCurrencyAnalytics(fromCurrency: string, toCurrency: string): Promise<CurrencyAnalytics> {
    const cacheKey = this.getCacheKey('currency-analytics', { fromCurrency, toCurrency })
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached<CurrencyAnalytics>(cacheKey)!
    }

    // Get historical data for analysis
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const historicalRates = await this.getHistoricalRates(fromCurrency, toCurrency, startDate, endDate)
    
    const analytics: CurrencyAnalytics = {
      volatility: this.calculateVolatility(historicalRates),
      trend: this.calculateTrend(historicalRates),
      support: this.calculateSupport(historicalRates),
      resistance: this.calculateResistance(historicalRates),
      rsi: this.calculateRSI(historicalRates),
      movingAverage7: this.calculateMovingAverage(historicalRates, 7),
      movingAverage30: this.calculateMovingAverage(historicalRates, 30)
    }

    this.setCache(cacheKey, analytics, 300000) // Cache for 5 minutes
    return analytics
  }

  async getMarketStatus(): Promise<MarketStatus> {
    const now = new Date()
    const utcHour = now.getUTCHours()
    
    // Forex market hours (simplified)
    const isOpen = (utcHour >= 0 && utcHour < 22) // 24/5 market
    const nextOpen = isOpen ? '' : this.getNextMarketOpen(now)
    const nextClose = isOpen ? this.getNextMarketClose(now) : ''
    
    return {
      isOpen,
      nextOpen,
      nextClose,
      timezone: 'UTC'
    }
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<{
    amount: number
    fromCurrency: string
    toCurrency: string
    convertedAmount: number
    rate: number
    timestamp: string
    fees?: number
    totalCost?: number
  }> {
    const response = await this.withRetry(async () => {
      return await bankingApi.convertCurrency(amount, fromCurrency, toCurrency)
    })

    const conversion = response.conversion || response
    
    // Calculate fees (example: 0.1% fee)
    const fees = conversion.convertedAmount * 0.001
    const totalCost = conversion.convertedAmount + fees

    return {
      ...conversion,
      fees,
      totalCost
    }
  }

  // Helper methods for calculations
  private calculateChange24h(currentRate: number): number {
    // Simulate 24h change (in real app, compare with historical data)
    const change = (Math.random() - 0.5) * currentRate * 0.02
    return Number(change.toFixed(6))
  }

  private calculateChangePercent24h(currentRate: number): number {
    const change24h = this.calculateChange24h(currentRate)
    return Number(((change24h / currentRate) * 100).toFixed(4))
  }

  private calculateHigh24h(currentRate: number): number {
    return Number((currentRate * (1 + Math.random() * 0.01)).toFixed(6))
  }

  private calculateLow24h(currentRate: number): number {
    return Number((currentRate * (1 - Math.random() * 0.01)).toFixed(6))
  }

  private calculateVolume24h(fromCurrency: string, toCurrency: string): number {
    // Simulate volume based on currency pair popularity
    const baseVolume = 1000000
    const multiplier = this.getVolumeMultiplier(fromCurrency, toCurrency)
    return Math.floor(baseVolume * multiplier)
  }

  private getVolumeMultiplier(fromCurrency: string, toCurrency: string): number {
    const majorPairs = ['USD/EUR', 'USD/GBP', 'USD/JPY', 'EUR/GBP']
    const pair = `${fromCurrency}/${toCurrency}`
    return majorPairs.includes(pair) ? 1.5 : 0.8
  }

  private calculateVolatility(rates: HistoricalRate[]): number {
    if (rates.length < 2) return 0
    
    const returns = rates.slice(1).map((rate, i) => 
      Math.log(rate.close / rates[i].close)
    )
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length
    
    return Number((Math.sqrt(variance) * 100).toFixed(4))
  }

  private calculateTrend(rates: HistoricalRate[]): 'bullish' | 'bearish' | 'sideways' {
    if (rates.length < 2) return 'sideways'
    
    const firstRate = rates[0].close
    const lastRate = rates[rates.length - 1].close
    const change = (lastRate - firstRate) / firstRate
    
    if (change > 0.02) return 'bullish'
    if (change < -0.02) return 'bearish'
    return 'sideways'
  }

  private calculateSupport(rates: HistoricalRate[]): number {
    if (rates.length === 0) return 0
    return Math.min(...rates.map(r => r.low))
  }

  private calculateResistance(rates: HistoricalRate[]): number {
    if (rates.length === 0) return 0
    return Math.max(...rates.map(r => r.high))
  }

  private calculateRSI(rates: HistoricalRate[]): number {
    if (rates.length < 14) return 50
    
    const gains = []
    const losses = []
    
    for (let i = 1; i < rates.length; i++) {
      const change = rates[i].close - rates[i - 1].close
      if (change > 0) {
        gains.push(change)
        losses.push(0)
      } else {
        gains.push(0)
        losses.push(Math.abs(change))
      }
    }
    
    const avgGain = gains.slice(-14).reduce((sum, gain) => sum + gain, 0) / 14
    const avgLoss = losses.slice(-14).reduce((sum, loss) => sum + loss, 0) / 14
    
    if (avgLoss === 0) return 100
    
    const rs = avgGain / avgLoss
    const rsi = 100 - (100 / (1 + rs))
    
    return Number(rsi.toFixed(2))
  }

  private calculateMovingAverage(rates: HistoricalRate[], period: number): number {
    if (rates.length < period) return 0
    
    const recentRates = rates.slice(-period)
    const sum = recentRates.reduce((sum, rate) => sum + rate.close, 0)
    return Number((sum / period).toFixed(6))
  }

  private getNextMarketOpen(now: Date): string {
    const nextOpen = new Date(now)
    nextOpen.setUTCDate(nextOpen.getUTCDate() + 1)
    nextOpen.setUTCHours(0, 0, 0, 0)
    return nextOpen.toISOString()
  }

  private getNextMarketClose(now: Date): string {
    const nextClose = new Date(now)
    nextClose.setUTCHours(22, 0, 0, 0)
    return nextClose.toISOString()
  }

  // Cache management
  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const currencyService = new CurrencyService()

