import { bankingApi } from '@/lib/api/banking';
class CurrencyService {
    constructor() {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "CACHE_TTL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 30000
        }); // 30 seconds
        Object.defineProperty(this, "RETRY_ATTEMPTS", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        Object.defineProperty(this, "RETRY_DELAY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        });
    }
    async withRetry(fn, attempts = this.RETRY_ATTEMPTS) {
        try {
            return await fn();
        }
        catch (error) {
            if (attempts > 1) {
                await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                return this.withRetry(fn, attempts - 1);
            }
            throw error;
        }
    }
    getCacheKey(endpoint, params) {
        return `${endpoint}${params ? `_${JSON.stringify(params)}` : ''}`;
    }
    isCacheValid(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return false;
        return Date.now() - cached.timestamp < cached.ttl;
    }
    setCache(key, data, ttl = this.CACHE_TTL) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    getCached(key) {
        const cached = this.cache.get(key);
        return cached ? cached.data : null;
    }
    async getExchangeRate(fromCurrency, toCurrency, date) {
        const cacheKey = this.getCacheKey('exchange-rate', { fromCurrency, toCurrency, date });
        if (this.isCacheValid(cacheKey)) {
            return this.getCached(cacheKey);
        }
        const rate = await this.withRetry(async () => {
            const response = await bankingApi.getExchangeRate(fromCurrency, toCurrency, date);
            return response.rate || response;
        });
        // Enhance with additional data
        const enhancedRate = {
            ...rate,
            change24h: this.calculateChange24h(rate.rate),
            changePercent24h: this.calculateChangePercent24h(rate.rate),
            high24h: this.calculateHigh24h(rate.rate),
            low24h: this.calculateLow24h(rate.rate),
            volume24h: this.calculateVolume24h(fromCurrency, toCurrency)
        };
        this.setCache(cacheKey, enhancedRate);
        return enhancedRate;
    }
    async getPopularPairs() {
        const cacheKey = this.getCacheKey('popular-pairs');
        if (this.isCacheValid(cacheKey)) {
            return this.getCached(cacheKey);
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
            ];
            const rates = await Promise.all(popularPairs.map(async (pair) => {
                try {
                    const rate = await this.getExchangeRate(pair.from, pair.to);
                    return {
                        pair: `${pair.from}/${pair.to}`,
                        rate: rate.rate,
                        change24h: rate.change24h || 0,
                        changePercent24h: rate.changePercent24h || 0,
                        high24h: rate.high24h || rate.rate,
                        low24h: rate.low24h || rate.rate,
                        volume24h: rate.volume24h || 0,
                        lastUpdated: rate.timestamp
                    };
                }
                catch (error) {
                    console.error(`Error fetching rate for ${pair.from}/${pair.to}:`, error);
                    return null;
                }
            }));
            return rates.filter(Boolean);
        });
        this.setCache(cacheKey, pairs, 60000); // Cache for 1 minute
        return pairs;
    }
    async getHistoricalRates(fromCurrency, toCurrency, startDate, endDate) {
        const cacheKey = this.getCacheKey('historical-rates', { fromCurrency, toCurrency, startDate, endDate });
        if (this.isCacheValid(cacheKey)) {
            return this.getCached(cacheKey);
        }
        const rates = await this.withRetry(async () => {
            const response = await bankingApi.getHistoricalRates(fromCurrency, toCurrency, startDate, endDate);
            return response.rates || response || [];
        });
        this.setCache(cacheKey, rates, 300000); // Cache for 5 minutes
        return rates;
    }
    async getCurrencyAnalytics(fromCurrency, toCurrency) {
        const cacheKey = this.getCacheKey('currency-analytics', { fromCurrency, toCurrency });
        if (this.isCacheValid(cacheKey)) {
            return this.getCached(cacheKey);
        }
        // Get historical data for analysis
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const historicalRates = await this.getHistoricalRates(fromCurrency, toCurrency, startDate, endDate);
        const analytics = {
            volatility: this.calculateVolatility(historicalRates),
            trend: this.calculateTrend(historicalRates),
            support: this.calculateSupport(historicalRates),
            resistance: this.calculateResistance(historicalRates),
            rsi: this.calculateRSI(historicalRates),
            movingAverage7: this.calculateMovingAverage(historicalRates, 7),
            movingAverage30: this.calculateMovingAverage(historicalRates, 30)
        };
        this.setCache(cacheKey, analytics, 300000); // Cache for 5 minutes
        return analytics;
    }
    async getMarketStatus() {
        const now = new Date();
        const utcHour = now.getUTCHours();
        // Forex market hours (simplified)
        const isOpen = (utcHour >= 0 && utcHour < 22); // 24/5 market
        const nextOpen = isOpen ? '' : this.getNextMarketOpen(now);
        const nextClose = isOpen ? this.getNextMarketClose(now) : '';
        return {
            isOpen,
            nextOpen,
            nextClose,
            timezone: 'UTC'
        };
    }
    async convertCurrency(amount, fromCurrency, toCurrency) {
        const response = await this.withRetry(async () => {
            return await bankingApi.convertCurrency(amount, fromCurrency, toCurrency);
        });
        const conversion = response.conversion || response;
        // Calculate fees (example: 0.1% fee)
        const fees = conversion.convertedAmount * 0.001;
        const totalCost = conversion.convertedAmount + fees;
        return {
            ...conversion,
            fees,
            totalCost
        };
    }
    // Helper methods for calculations
    calculateChange24h(currentRate) {
        // Simulate 24h change (in real app, compare with historical data)
        const change = (Math.random() - 0.5) * currentRate * 0.02;
        return Number(change.toFixed(6));
    }
    calculateChangePercent24h(currentRate) {
        const change24h = this.calculateChange24h(currentRate);
        return Number(((change24h / currentRate) * 100).toFixed(4));
    }
    calculateHigh24h(currentRate) {
        return Number((currentRate * (1 + Math.random() * 0.01)).toFixed(6));
    }
    calculateLow24h(currentRate) {
        return Number((currentRate * (1 - Math.random() * 0.01)).toFixed(6));
    }
    calculateVolume24h(fromCurrency, toCurrency) {
        // Simulate volume based on currency pair popularity
        const baseVolume = 1000000;
        const multiplier = this.getVolumeMultiplier(fromCurrency, toCurrency);
        return Math.floor(baseVolume * multiplier);
    }
    getVolumeMultiplier(fromCurrency, toCurrency) {
        const majorPairs = ['USD/EUR', 'USD/GBP', 'USD/JPY', 'EUR/GBP'];
        const pair = `${fromCurrency}/${toCurrency}`;
        return majorPairs.includes(pair) ? 1.5 : 0.8;
    }
    calculateVolatility(rates) {
        if (rates.length < 2)
            return 0;
        const returns = rates.slice(1).map((rate, i) => Math.log(rate.close / rates[i].close));
        const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
        return Number((Math.sqrt(variance) * 100).toFixed(4));
    }
    calculateTrend(rates) {
        if (rates.length < 2)
            return 'sideways';
        const firstRate = rates[0].close;
        const lastRate = rates[rates.length - 1].close;
        const change = (lastRate - firstRate) / firstRate;
        if (change > 0.02)
            return 'bullish';
        if (change < -0.02)
            return 'bearish';
        return 'sideways';
    }
    calculateSupport(rates) {
        if (rates.length === 0)
            return 0;
        return Math.min(...rates.map(r => r.low));
    }
    calculateResistance(rates) {
        if (rates.length === 0)
            return 0;
        return Math.max(...rates.map(r => r.high));
    }
    calculateRSI(rates) {
        if (rates.length < 14)
            return 50;
        const gains = [];
        const losses = [];
        for (let i = 1; i < rates.length; i++) {
            const change = rates[i].close - rates[i - 1].close;
            if (change > 0) {
                gains.push(change);
                losses.push(0);
            }
            else {
                gains.push(0);
                losses.push(Math.abs(change));
            }
        }
        const avgGain = gains.slice(-14).reduce((sum, gain) => sum + gain, 0) / 14;
        const avgLoss = losses.slice(-14).reduce((sum, loss) => sum + loss, 0) / 14;
        if (avgLoss === 0)
            return 100;
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        return Number(rsi.toFixed(2));
    }
    calculateMovingAverage(rates, period) {
        if (rates.length < period)
            return 0;
        const recentRates = rates.slice(-period);
        const sum = recentRates.reduce((sum, rate) => sum + rate.close, 0);
        return Number((sum / period).toFixed(6));
    }
    getNextMarketOpen(now) {
        const nextOpen = new Date(now);
        nextOpen.setUTCDate(nextOpen.getUTCDate() + 1);
        nextOpen.setUTCHours(0, 0, 0, 0);
        return nextOpen.toISOString();
    }
    getNextMarketClose(now) {
        const nextClose = new Date(now);
        nextClose.setUTCHours(22, 0, 0, 0);
        return nextClose.toISOString();
    }
    // Cache management
    clearCache() {
        this.cache.clear();
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
export const currencyService = new CurrencyService();
