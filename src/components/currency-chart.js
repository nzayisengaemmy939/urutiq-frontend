import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, LineChart, RefreshCw, Download } from "lucide-react";
import { bankingApi } from '@/lib/api/banking';
import { useToast } from '@/hooks/use-toast';
export function CurrencyChart({ fromCurrency = 'USD', toCurrency = 'EUR' }) {
    const [historicalRates, setHistoricalRates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartType, setChartType] = useState('line');
    const [timeFrame, setTimeFrame] = useState('30d');
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);
    const { toast } = useToast();
    const loadHistoricalData = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = getStartDate(timeFrame);
            console.log('Loading historical data:', { fromCurrency, toCurrency, startDate, endDate, forceRefresh });
            let response;
            if (forceRefresh) {
                response = await bankingApi.forceRefreshHistorical(fromCurrency, toCurrency, startDate, endDate);
            }
            else {
                response = await bankingApi.getHistoricalRates(fromCurrency, toCurrency, startDate, endDate);
            }
            console.log('Historical data response:', response);
            if (response.success && response.rates && response.rates.length > 0) {
                setHistoricalRates(response.rates);
                setError(null);
                if (forceRefresh) {
                    toast({
                        title: "Chart Refreshed",
                        description: "Historical data has been refreshed with new values",
                    });
                }
            }
            else {
                setError('No historical data available for this currency pair');
                setHistoricalRates([]);
            }
        }
        catch (error) {
            console.error('Error loading historical data:', error);
            setError('Failed to load historical data');
            setHistoricalRates([]);
            toast({
                title: "Error",
                description: "Failed to load historical data",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const getStartDate = (timeFrame) => {
        const now = new Date();
        const days = {
            '1d': 1,
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };
        const startDate = new Date(now.getTime() - days[timeFrame] * 24 * 60 * 60 * 1000);
        return startDate.toISOString().split('T')[0];
    };
    useEffect(() => {
        if (fromCurrency && toCurrency) {
            loadHistoricalData();
        }
    }, [fromCurrency, toCurrency, timeFrame]);
    // Load data on component mount
    useEffect(() => {
        loadHistoricalData();
    }, []);
    useEffect(() => {
        if (historicalRates.length > 0) {
            // Add a small delay to ensure canvas is properly sized
            setTimeout(() => {
                drawChart();
            }, 100);
        }
    }, [historicalRates, chartType]);
    // Redraw chart when window resizes
    useEffect(() => {
        const handleResize = () => {
            if (historicalRates.length > 0) {
                drawChart();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [historicalRates]);
    const drawChart = () => {
        const canvas = canvasRef.current;
        if (!canvas || historicalRates.length === 0) {
            console.log('Chart draw skipped:', { canvas: !!canvas, ratesLength: historicalRates.length });
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.log('No canvas context available');
            return;
        }
        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        const width = rect.width;
        const height = rect.height;
        const padding = 40;
        console.log('Drawing chart:', { width, height, dataPoints: historicalRates.length });
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        // Set up data
        const data = historicalRates;
        // Validate data structure
        const validData = data.filter(d => typeof d.low === 'number' &&
            typeof d.high === 'number' &&
            typeof d.open === 'number' &&
            typeof d.close === 'number' &&
            !isNaN(d.low) && !isNaN(d.high) && !isNaN(d.open) && !isNaN(d.close));
        console.log('Valid data points:', validData.length, 'out of', data.length);
        if (validData.length === 0) {
            // Draw a message when no data
            ctx.fillStyle = '#6b7280';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No valid data available', width / 2, height / 2);
            return;
        }
        const minRate = Math.min(...validData.map(d => d.low));
        const maxRate = Math.max(...validData.map(d => d.high));
        const rateRange = maxRate - minRate;
        if (rateRange === 0) {
            // Draw a message when all values are the same
            ctx.fillStyle = '#6b7280';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('All values are the same', width / 2, height / 2);
            return;
        }
        const xStep = (width - 2 * padding) / (validData.length - 1);
        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height - 2 * padding) * (i / 5);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        // Draw axes
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        // Draw chart based on type
        switch (chartType) {
            case 'line':
                drawLineChart(ctx, validData, width, height, padding, minRate, rateRange, xStep);
                break;
            case 'candlestick':
                drawCandlestickChart(ctx, validData, width, height, padding, minRate, rateRange, xStep);
                break;
            case 'bar':
                drawBarChart(ctx, validData, width, height, padding, minRate, rateRange, xStep);
                break;
        }
        // Draw labels
        drawLabels(ctx, validData, width, height, padding, minRate, rateRange);
    };
    const drawLineChart = (ctx, data, _width, height, padding, minRate, rateRange, xStep) => {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((point, index) => {
            const x = padding + index * xStep;
            const y = height - padding - ((point.close - minRate) / rateRange) * (height - 2 * padding);
            if (index === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        // Draw points
        ctx.fillStyle = '#3b82f6';
        data.forEach((point, index) => {
            const x = padding + index * xStep;
            const y = height - padding - ((point.close - minRate) / rateRange) * (height - 2 * padding);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    };
    const drawCandlestickChart = (ctx, data, _width, height, padding, minRate, rateRange, xStep) => {
        const candleWidth = xStep * 0.6;
        data.forEach((point, index) => {
            const x = padding + index * xStep;
            const isGreen = point.close >= point.open;
            // High-Low line
            ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, height - padding - ((point.high - minRate) / rateRange) * (height - 2 * padding));
            ctx.lineTo(x, height - padding - ((point.low - minRate) / rateRange) * (height - 2 * padding));
            ctx.stroke();
            // Body
            const bodyTop = height - padding - ((Math.max(point.open, point.close) - minRate) / rateRange) * (height - 2 * padding);
            const bodyBottom = height - padding - ((Math.min(point.open, point.close) - minRate) / rateRange) * (height - 2 * padding);
            const bodyHeight = bodyBottom - bodyTop;
            ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
            ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
            // Border
            ctx.strokeStyle = isGreen ? '#059669' : '#dc2626';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        });
    };
    const drawBarChart = (ctx, data, _width, height, padding, minRate, rateRange, xStep) => {
        const barWidth = xStep * 0.6;
        data.forEach((point, index) => {
            const x = padding + index * xStep;
            const barHeight = ((point.close - minRate) / rateRange) * (height - 2 * padding);
            const y = height - padding - barHeight;
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
        });
    };
    const drawLabels = (ctx, data, width, height, padding, minRate, rateRange) => {
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const rate = minRate + (rateRange * i / 5);
            const y = height - padding - (height - 2 * padding) * (i / 5);
            ctx.fillText(rate.toFixed(4), padding - 10, y + 4);
        }
        // X-axis labels (show every 5th point)
        data.forEach((point, index) => {
            if (index % Math.ceil(data.length / 8) === 0) {
                const x = padding + index * ((width - 2 * padding) / (data.length - 1));
                const date = new Date(point.date);
                ctx.fillText(date.toLocaleDateString(), x, height - padding + 20);
            }
        });
    };
    const handleCanvasClick = (event) => {
        const canvas = canvasRef.current;
        if (!canvas || historicalRates.length === 0)
            return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const padding = 40;
        const width = canvas.offsetWidth;
        const xStep = (width - 2 * padding) / (historicalRates.length - 1);
        const index = Math.round((x - padding) / xStep);
        if (index >= 0 && index < historicalRates.length) {
            setSelectedPoint(historicalRates[index]);
        }
    };
    const exportChart = () => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const link = document.createElement('a');
        link.download = `currency-chart-${fromCurrency}-${toCurrency}-${timeFrame}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };
    const getTrend = () => {
        if (historicalRates.length < 2)
            return 'neutral';
        const first = historicalRates[0].close;
        const last = historicalRates[historicalRates.length - 1].close;
        const change = (last - first) / first;
        return change > 0.02 ? 'bullish' : change < -0.02 ? 'bearish' : 'neutral';
    };
    const trend = getTrend();
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5" }), "Currency Chart - ", fromCurrency, "/", toCurrency] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Badge, { variant: trend === 'bullish' ? 'default' : trend === 'bearish' ? 'destructive' : 'secondary', children: [trend === 'bullish' && _jsx(TrendingUp, { className: "w-3 h-3 mr-1" }), trend === 'bearish' && _jsx(TrendingDown, { className: "w-3 h-3 mr-1" }), trend.charAt(0).toUpperCase() + trend.slice(1)] }) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsxs(Select, { value: chartType, onValueChange: (value) => setChartType(value), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "line", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(LineChart, { className: "w-4 h-4" }), "Line"] }) }), _jsx(SelectItem, { value: "candlestick", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4" }), "Candlestick"] }) }), _jsx(SelectItem, { value: "bar", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4" }), "Bar"] }) })] })] }), _jsxs(Select, { value: timeFrame, onValueChange: (value) => setTimeFrame(value), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1d", children: "1 Day" }), _jsx(SelectItem, { value: "7d", children: "7 Days" }), _jsx(SelectItem, { value: "30d", children: "30 Days" }), _jsx(SelectItem, { value: "90d", children: "90 Days" }), _jsx(SelectItem, { value: "1y", children: "1 Year" })] })] }), _jsxs(Button, { onClick: () => loadHistoricalData(true), disabled: loading, variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh"] }), _jsxs(Button, { onClick: exportChart, variant: "outline", size: "sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export"] })] }), _jsxs("div", { className: "relative", children: [_jsx("canvas", { ref: canvasRef, className: "w-full h-96 border rounded-lg cursor-crosshair", onClick: handleCanvasClick }), loading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white/80", children: _jsx(RefreshCw, { className: "w-8 h-8 animate-spin" }) })), error && !loading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white/80", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-500 mb-2", children: error }), _jsxs(Button, { onClick: () => loadHistoricalData(true), variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] }) })), !loading && !error && historicalRates.length === 0 && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white/80", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-500 mb-2", children: "No data available" }), _jsxs(Button, { onClick: () => loadHistoricalData(true), variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Load Data"] })] }) }))] }), selectedPoint && (_jsxs("div", { className: "mt-4 p-4 bg-muted rounded-lg", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Selected Point" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Date:" }), _jsx("div", { className: "font-semibold", children: new Date(selectedPoint.date).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Open:" }), _jsx("div", { className: "font-semibold", children: selectedPoint.open.toFixed(4) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "High:" }), _jsx("div", { className: "font-semibold", children: selectedPoint.high.toFixed(4) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Low:" }), _jsx("div", { className: "font-semibold", children: selectedPoint.low.toFixed(4) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Close:" }), _jsx("div", { className: "font-semibold", children: selectedPoint.close.toFixed(4) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Volume:" }), _jsx("div", { className: "font-semibold", children: selectedPoint.volume.toLocaleString() })] })] })] }))] })] }) }));
}
