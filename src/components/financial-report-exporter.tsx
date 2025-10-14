import { useState } from 'react'
import { Button } from './ui/button'
import { Download, FileText, Table, FileSpreadsheet } from 'lucide-react'
import { useToast } from './ui/use-toast'
import { config } from '../lib/config'


interface FinancialReportExporterProps {
  reportType: 'balance-sheet' | 'profit-loss' | 'cash-flow' | 'ratios'
  reportData: any
  companyId: string
  disabled?: boolean
}

export function FinancialReportExporter({
  reportType,
  reportData,
  companyId,
  disabled = false
}: FinancialReportExporterProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportData) {
      toast({
        title: "No Data Available",
        description: "Please generate a report before exporting.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token')
      const tenantId = localStorage.getItem('tenant_id')
      
      // Call the export API endpoint using native fetch for blob handling
      const response = await fetch(`${config.api.baseUrl}/api/enhanced-financial-reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId || 'tenant_demo'
        },
        body: JSON.stringify({
          report: reportData?.data || reportData,
          format
        })
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`)
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const reportName = reportType.replace('-', '_').toUpperCase()
      link.download = `${reportName}_${companyId}_${timestamp}.${format}`
      
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `${reportName} exported successfully as ${format.toUpperCase()}`,
      })

    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export Failed",
        description: `Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }


  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportReport('pdf')}
        disabled={disabled || isExporting || !reportData}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        {isExporting ? 'Exporting...' : 'PDF'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportReport('excel')}
        disabled={disabled || isExporting || !reportData}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Excel'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportReport('csv')}
        disabled={disabled || isExporting || !reportData}
        className="flex items-center gap-2"
      >
        <Table className="h-4 w-4" />
        {isExporting ? 'Exporting...' : 'CSV'}
      </Button>
    </div>
  )
}

// Alternative: Dropdown Export Component
interface ExportDropdownProps {
  reportType: 'balance-sheet' | 'profit-loss' | 'cash-flow' | 'ratios'
  reportData: any
  companyId: string
  disabled?: boolean
}

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

export function FinancialReportExportDropdown({
  reportType,
  reportData,
  companyId,
  disabled = false
}: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportData) {
      toast({
        title: "No Data Available",
        description: "Please generate a report before exporting.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token')
      const tenantId = localStorage.getItem('tenant_id')
      
      // Call the export API endpoint using native fetch for blob handling
      const response = await fetch(`${config.api.baseUrl}/api/enhanced-financial-reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId || 'tenant_demo'
        },
        body: JSON.stringify({
          report: reportData?.data || reportData,
          format
        })
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`)
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const timestamp = new Date().toISOString().split('T')[0]
      const reportName = reportType.replace('-', '_').toUpperCase()
      link.download = `${reportName}_${companyId}_${timestamp}.${format}`
      
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `${reportName} exported successfully as ${format.toUpperCase()}`,
      })

    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export Failed",
        description: `Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isExporting || !reportData}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => exportReport('pdf')}
          disabled={disabled || isExporting || !reportData}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => exportReport('excel')}
          disabled={disabled || isExporting || !reportData}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => exportReport('csv')}
          disabled={disabled || isExporting || !reportData}
          className="flex items-center gap-2"
        >
          <Table className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
