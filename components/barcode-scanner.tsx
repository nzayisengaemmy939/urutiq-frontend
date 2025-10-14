"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Camera, 
  CameraOff, 
  QrCode, 
  Search, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onProductFound?: (product: any) => void
  trigger?: React.ReactNode
  className?: string
}

interface ScanResult {
  barcode: string
  timestamp: Date
  success: boolean
  product?: any
  error?: string
}

export function BarcodeScanner({ onScan, onProductFound, trigger, className }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [manualBarcode, setManualBarcode] = useState('')
  const [activeTab, setActiveTab] = useState('camera')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  
  const webcamRef = useRef<Webcam>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const { toast } = useToast()

  // Initialize barcode reader
  useEffect(() => {
    if (isOpen) {
      readerRef.current = new BrowserMultiFormatReader()
    }
    return () => {
      if (readerRef.current) {
        readerRef.current.reset()
      }
    }
  }, [isOpen])

  // Check camera permission
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      checkCameraPermission()
    }
  }, [isOpen, activeTab])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setHasPermission(true)
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      setHasPermission(false)
      toast({
        title: "Camera Permission Required",
        description: "Please allow camera access to use barcode scanning.",
        variant: "destructive"
      })
    }
  }

  const startScanning = useCallback(async () => {
    if (!readerRef.current || !webcamRef.current) return

    try {
      setIsScanning(true)
      
      const videoElement = webcamRef.current.video
      if (!videoElement) {
        throw new Error('Camera not available')
      }

      const result = await readerRef.current.decodeFromVideoElement(videoElement)
      
      if (result) {
        const barcode = result.getText()
        handleScanResult(barcode)
      }
    } catch (error) {
      console.error('Scanning error:', error)
      // Continue scanning on error
      setTimeout(() => {
        if (isScanning) {
          startScanning()
        }
      }, 100)
    }
  }, [isScanning])

  const stopScanning = () => {
    setIsScanning(false)
    if (readerRef.current) {
      readerRef.current.reset()
    }
  }

  const handleScanResult = async (barcode: string) => {
    const timestamp = new Date()
    
    try {
      // Look up product by barcode
      const product = await lookupProductByBarcode(barcode)
      
      const result: ScanResult = {
        barcode,
        timestamp,
        success: true,
        product
      }
      
      setScanResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
      onScan(barcode)
      
      if (product && onProductFound) {
        onProductFound(product)
      }
      
      toast({
        title: "Barcode Scanned",
        description: product ? `Found: ${product.name}` : `Barcode: ${barcode}`,
      })
      
      // Stop scanning after successful scan
      stopScanning()
      
    } catch (error) {
      const result: ScanResult = {
        barcode,
        timestamp,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      setScanResults(prev => [result, ...prev.slice(0, 9)])
      
      toast({
        title: "Scan Error",
        description: `Failed to process barcode: ${barcode}`,
        variant: "destructive"
      })
    }
  }

  const lookupProductByBarcode = async (barcode: string) => {
    // This would typically call your API to find a product by barcode/SKU
    // For now, return mock data
    return {
      id: `product-${barcode}`,
      name: `Product ${barcode}`,
      sku: barcode,
      price: 29.99,
      stock: 10,
      category: 'Electronics'
    }
  }

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      handleScanResult(manualBarcode.trim())
      setManualBarcode('')
    }
  }

  const clearResults = () => {
    setScanResults([])
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const videoConstraints = {
    width: isFullscreen ? 1280 : 640,
    height: isFullscreen ? 720 : 480,
    facingMode: 'environment' // Use back camera on mobile
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <QrCode className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className={`${isFullscreen ? 'max-w-6xl h-[90vh]' : 'max-w-2xl'} p-0`}>
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera Scan
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera" className="space-y-4">
              {hasPermission === false ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
                    <p className="text-muted-foreground mb-4">
                      Please allow camera access to use barcode scanning.
                    </p>
                    <Button onClick={checkCameraPermission}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Permission
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      videoConstraints={videoConstraints}
                      className="w-full rounded-lg border"
                    />
                    
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                        <div className="bg-white/90 p-4 rounded-lg flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          <span className="text-sm font-medium">Scanning...</span>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    {!isScanning ? (
                      <Button onClick={startScanning} className="flex-1">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Scanning
                      </Button>
                    ) : (
                      <Button onClick={stopScanning} variant="destructive" className="flex-1">
                        <CameraOff className="w-4 h-4 mr-2" />
                        Stop Scanning
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-barcode">Enter Barcode/SKU</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-barcode"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Enter barcode or SKU..."
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                  <Button onClick={handleManualSubmit} disabled={!manualBarcode.trim()}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Scan Results */}
          {scanResults.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Scans</CardTitle>
                <Button variant="outline" size="sm" onClick={clearResults}>
                  Clear
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {scanResults.slice(0, 5).map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{result.barcode}</p>
                        {result.product && (
                          <p className="text-sm text-muted-foreground">{result.product.name}</p>
                        )}
                        {result.error && (
                          <p className="text-sm text-red-600">{result.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Error'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BarcodeScanner
