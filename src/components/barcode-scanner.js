import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Camera, CameraOff, QrCode, Search, CheckCircle, AlertCircle, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
export function BarcodeScanner({ onScan, onProductFound, trigger, className }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState([]);
    const [manualBarcode, setManualBarcode] = useState('');
    const [activeTab, setActiveTab] = useState('camera');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const webcamRef = useRef(null);
    const readerRef = useRef(null);
    const { toast } = useToast();
    // Initialize barcode reader
    useEffect(() => {
        if (isOpen) {
            readerRef.current = new BrowserMultiFormatReader();
        }
        return () => {
            if (readerRef.current) {
                readerRef.current.reset();
            }
        };
    }, [isOpen]);
    // Check camera permission
    useEffect(() => {
        if (isOpen && activeTab === 'camera') {
            checkCameraPermission();
        }
    }, [isOpen, activeTab]);
    const checkCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasPermission(true);
            stream.getTracks().forEach(track => track.stop());
        }
        catch (error) {
            setHasPermission(false);
            toast({
                title: "Camera Permission Required",
                description: "Please allow camera access to use barcode scanning.",
                variant: "destructive"
            });
        }
    };
    const startScanning = useCallback(async () => {
        if (!readerRef.current || !webcamRef.current)
            return;
        try {
            setIsScanning(true);
            const videoElement = webcamRef.current.video;
            if (!videoElement) {
                throw new Error('Camera not available');
            }
            const result = await readerRef.current.decodeFromVideoElement(videoElement);
            if (result) {
                const barcode = result.getText();
                handleScanResult(barcode);
            }
        }
        catch (error) {
            console.error('Scanning error:', error);
            // Continue scanning on error
            setTimeout(() => {
                if (isScanning) {
                    startScanning();
                }
            }, 100);
        }
    }, [isScanning]);
    const stopScanning = () => {
        setIsScanning(false);
        if (readerRef.current) {
            readerRef.current.reset();
        }
    };
    const handleScanResult = async (barcode) => {
        const timestamp = new Date();
        try {
            // Look up product by barcode
            const product = await lookupProductByBarcode(barcode);
            const result = {
                barcode,
                timestamp,
                success: true,
                product
            };
            setScanResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
            onScan(barcode);
            if (product && onProductFound) {
                onProductFound(product);
            }
            toast({
                title: "Barcode Scanned",
                description: product ? `Found: ${product.name}` : `Barcode: ${barcode}`,
            });
            // Stop scanning after successful scan
            stopScanning();
        }
        catch (error) {
            const result = {
                barcode,
                timestamp,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            setScanResults(prev => [result, ...prev.slice(0, 9)]);
            toast({
                title: "Scan Error",
                description: `Failed to process barcode: ${barcode}`,
                variant: "destructive"
            });
        }
    };
    const lookupProductByBarcode = async (barcode) => {
        // This would typically call your API to find a product by barcode/SKU
        // For now, return mock data
        return {
            id: `product-${barcode}`,
            name: `Product ${barcode}`,
            sku: barcode,
            price: 29.99,
            stock: 10,
            category: 'Electronics'
        };
    };
    const handleManualSubmit = () => {
        if (manualBarcode.trim()) {
            handleScanResult(manualBarcode.trim());
            setManualBarcode('');
        }
    };
    const clearResults = () => {
        setScanResults([]);
    };
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };
    const videoConstraints = {
        width: isFullscreen ? 1280 : 640,
        height: isFullscreen ? 720 : 480,
        facingMode: 'environment' // Use back camera on mobile
    };
    return (_jsxs(Dialog, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DialogTrigger, { asChild: true, children: trigger || (_jsxs(Button, { variant: "outline", className: className, children: [_jsx(QrCode, { className: "w-4 h-4 mr-2" }), "Scan Barcode"] })) }), _jsxs(DialogContent, { className: `${isFullscreen ? 'max-w-6xl h-[90vh]' : 'max-w-2xl'} p-0`, children: [_jsx(DialogHeader, { className: "p-6 pb-0", children: _jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(QrCode, { className: "w-5 h-5" }), "Barcode Scanner"] }) }), _jsxs("div", { className: "p-6", children: [_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsxs(TabsTrigger, { value: "camera", className: "flex items-center gap-2", children: [_jsx(Camera, { className: "w-4 h-4" }), "Camera Scan"] }), _jsxs(TabsTrigger, { value: "manual", className: "flex items-center gap-2", children: [_jsx(Search, { className: "w-4 h-4" }), "Manual Entry"] })] }), _jsx(TabsContent, { value: "camera", className: "space-y-4", children: hasPermission === false ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "Camera Access Required" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Please allow camera access to use barcode scanning." }), _jsxs(Button, { onClick: checkCameraPermission, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry Permission"] })] }) })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Webcam, { ref: webcamRef, audio: false, videoConstraints: videoConstraints, className: "w-full rounded-lg border" }), isScanning && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg", children: _jsxs("div", { className: "bg-white/90 p-4 rounded-lg flex items-center gap-2", children: [_jsx("div", { className: "animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" }), _jsx("span", { className: "text-sm font-medium", children: "Scanning..." })] }) })), _jsx(Button, { variant: "outline", size: "sm", className: "absolute top-2 right-2", onClick: toggleFullscreen, children: isFullscreen ? _jsx(Minimize2, { className: "w-4 h-4" }) : _jsx(Maximize2, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "flex gap-2", children: !isScanning ? (_jsxs(Button, { onClick: startScanning, className: "flex-1", children: [_jsx(Camera, { className: "w-4 h-4 mr-2" }), "Start Scanning"] })) : (_jsxs(Button, { onClick: stopScanning, variant: "destructive", className: "flex-1", children: [_jsx(CameraOff, { className: "w-4 h-4 mr-2" }), "Stop Scanning"] })) })] })) }), _jsx(TabsContent, { value: "manual", className: "space-y-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "manual-barcode", children: "Enter Barcode/SKU" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { id: "manual-barcode", value: manualBarcode, onChange: (e) => setManualBarcode(e.target.value), placeholder: "Enter barcode or SKU...", onKeyPress: (e) => e.key === 'Enter' && handleManualSubmit() }), _jsx(Button, { onClick: handleManualSubmit, disabled: !manualBarcode.trim(), children: _jsx(Search, { className: "w-4 h-4" }) })] })] }) })] }), scanResults.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Recent Scans" }), _jsx(Button, { variant: "outline", size: "sm", onClick: clearResults, children: "Clear" })] }), _jsx(CardContent, { className: "space-y-3", children: scanResults.slice(0, 5).map((result, index) => (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [result.success ? (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" })) : (_jsx(AlertCircle, { className: "w-5 h-5 text-red-600" })), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: result.barcode }), result.product && (_jsx("p", { className: "text-sm text-muted-foreground", children: result.product.name })), result.error && (_jsx("p", { className: "text-sm text-red-600", children: result.error }))] })] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: result.success ? 'default' : 'destructive', children: result.success ? 'Success' : 'Error' }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: result.timestamp.toLocaleTimeString() })] })] }, index))) })] }))] })] })] }));
}
export default BarcodeScanner;
