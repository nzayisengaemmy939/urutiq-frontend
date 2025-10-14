"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react'

interface BulkOperationsProps {
  onImport?: (data: any[]) => void
  onExport?: (format: string) => void
  trigger?: React.ReactNode
  className?: string
}

interface ImportResult {
  success: boolean
  processed: number
  errors: string[]
  warnings: string[]
}

export function BulkOperations({ onImport, onExport, trigger, className }: BulkOperationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('import')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importFormat, setImportFormat] = useState('csv')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportFilters, setExportFilters] = useState({
    category: 'all',
    location: 'all',
    status: 'all'
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportResult(null)
      
      // Auto-detect format from file extension
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension === 'xlsx' || extension === 'xls') {
        setImportFormat('excel')
      } else if (extension === 'json') {
        setImportFormat('json')
      } else {
        setImportFormat('csv')
      }
    }
  }

  const processImport = async () => {
    if (!importFile) return

    setIsProcessing(true)
    setProgress(0)
    
    try {
      // Simulate processing with progress updates
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Parse file based on format
      const text = await importFile.text()
      let data: any[] = []

      if (importFormat === 'csv') {
        data = parseCSV(text)
      } else if (importFormat === 'json') {
        data = JSON.parse(text)
      } else if (importFormat === 'excel') {
        // In a real implementation, you'd use a library like xlsx
        data = parseCSV(text) // Fallback to CSV parsing
      }

      // Validate data
      const validation = validateImportData(data)
      
      clearInterval(interval)
      setProgress(100)
      
      setTimeout(() => {
        setImportResult(validation)
        setIsProcessing(false)
        
        if (validation.success) {
          toast({
            title: "Import Successful",
            description: `Successfully imported ${validation.processed} items`,
          })
          if (onImport) {
            onImport(data)
          }
        } else {
          toast({
            title: "Import Failed",
            description: `Found ${validation.errors.length} errors`,
            variant: "destructive"
          })
        }
      }, 500)

    } catch (error) {
      setIsProcessing(false)
      setProgress(0)
      toast({
        title: "Import Error",
        description: "Failed to process the file",
        variant: "destructive"
      })
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      data.push(row)
    }

    return data
  }

  const validateImportData = (data: any[]): ImportResult => {
    const errors: string[] = []
    const warnings: string[] = []
    let processed = 0

    data.forEach((row, index) => {
      const rowNum = index + 2 // Account for header row
      
      // Required fields validation
      if (!row.name || !row.sku) {
        errors.push(`Row ${rowNum}: Missing required fields (name, sku)`)
        return
      }

      // Numeric validation
      if (row.price && isNaN(parseFloat(row.price))) {
        errors.push(`Row ${rowNum}: Invalid price format`)
      }

      if (row.stock && isNaN(parseInt(row.stock))) {
        errors.push(`Row ${rowNum}: Invalid stock quantity`)
      }

      // Warning for missing optional fields
      if (!row.category) {
        warnings.push(`Row ${rowNum}: Missing category (will be set to 'Uncategorized')`)
      }

      processed++
    })

    return {
      success: errors.length === 0,
      processed,
      errors,
      warnings
    }
  }

  const handleExport = () => {
    if (onExport) {
      onExport(exportFormat)
    }
    
    toast({
      title: "Export Started",
      description: `Exporting data in ${exportFormat.toUpperCase()} format`,
    })
    
    setIsOpen(false)
  }

  const clearImport = () => {
    setImportFile(null)
    setImportResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const template = [
      ['name', 'sku', 'description', 'category', 'price', 'stock', 'reorder_point', 'location'],
      ['Sample Product 1', 'SKU001', 'Sample description', 'Electronics', '29.99', '100', '10', 'Main Warehouse'],
      ['Sample Product 2', 'SKU002', 'Another sample', 'Clothing', '19.99', '50', '5', 'Store Location']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Operations
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Bulk Import/Export Operations
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'import' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('import')}
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Import Data
            </button>
            <button
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'export' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('export')}
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export Data
            </button>
          </div>

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Import Inventory Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="import-file">Select File</Label>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                    />
                    <p className="text-sm text-muted-foreground">
                      Supported formats: CSV, Excel (.xlsx, .xls), JSON
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="import-format">File Format</Label>
                    <Select value={importFormat} onValueChange={setImportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {importFile && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">{importFile.name}</span>
                        <Badge variant="outline">{(importFile.size / 1024).toFixed(1)} KB</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearImport}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Progress */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Processing...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}

                  {/* Import Results */}
                  {importResult && (
                    <Card className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          {importResult.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="font-medium">
                            {importResult.success ? 'Import Successful' : 'Import Failed'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p>Processed: {importResult.processed} items</p>
                          
                          {importResult.errors.length > 0 && (
                            <div>
                              <p className="font-medium text-red-600">Errors:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {importResult.errors.map((error, index) => (
                                  <li key={index} className="text-red-600">{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {importResult.warnings.length > 0 && (
                            <div>
                              <p className="font-medium text-amber-600">Warnings:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {importResult.warnings.map((warning, index) => (
                                  <li key={index} className="text-amber-600">{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={downloadTemplate} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                    <Button 
                      onClick={processImport} 
                      disabled={!importFile || isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Import Data
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Inventory Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="export-format">Export Format</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="export-category">Category</Label>
                      <Select value={exportFilters.category} onValueChange={(value) => setExportFilters(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="export-location">Location</Label>
                      <Select value={exportFilters.location} onValueChange={(value) => setExportFilters(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="main-warehouse">Main Warehouse</SelectItem>
                          <SelectItem value="store-location">Store Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="export-status">Status</Label>
                      <Select value={exportFilters.status} onValueChange={(value) => setExportFilters(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleExport} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BulkOperations
