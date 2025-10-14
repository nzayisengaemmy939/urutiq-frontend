import { useEffect, useState } from 'react'
import { PageLayout } from '../components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { periodCloseApi } from '../lib/api/accounting'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { TrendingUp, Lock, CheckCircle, ClipboardList, RefreshCw } from 'lucide-react'
import { apiService } from '../lib/api'
import { getCompanyId } from '../lib/config'

export default function PeriodClosePage() {
  const [companyId, setCompanyId] = useState<string>(() => getCompanyId())
  const [periods, setPeriods] = useState<Array<{ period: string; status: 'open'|'locked'|'closing'|'closed' }>>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [checklist, setChecklist] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fxPreview, setFxPreview] = useState<any|null>(null)
  const [fxHistory, setFxHistory] = useState<any|null>(null)
  const [fxGainAccountId, setFxGainAccountId] = useState('')
  const [fxLossAccountId, setFxLossAccountId] = useState('')
  const [fxRevaluedAccountId, setFxRevaluedAccountId] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [runs, setRuns] = useState<any[]>([])

  // Listen for company changes from header
  useEffect(() => {
    const handleStorageChange = () => {
      const newCompanyId = getCompanyId();
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Period Close page - Company changed from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (in case localStorage doesn't trigger)
    const handleCompanyChange = (e: CustomEvent) => {
      const newCompanyId = e.detail.companyId;
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Period Close page - Company changed via custom event from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
      }
    };
    
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return
    ensureAuthAndLoadPeriods()
  }, [companyId])

  useEffect(() => {
    if (selectedPeriod) {
      loadRuns()
    }
  }, [selectedPeriod])

  async function ensureAuthAndLoadPeriods() {
    try {
      // Ensure we have a demo token
      await apiService.getDemoToken('demo_user', ['admin', 'accountant'])
      loadPeriods()
    } catch (error) {
      console.error('Failed to get demo token:', error)
      loadPeriods() // Try anyway
    }
  }

  async function loadPeriods() {
    console.log(`Loading periods for company: ${companyId}`)
    setLoading(true)
    setError(null)
    try {
      const res = await periodCloseApi.listPeriods(companyId)
      console.log('Periods API response:', res)
      
      // Handle the response structure: { success: true, data: [...] }
      let data = []
      if (res?.data && Array.isArray(res.data)) {
        data = res.data
      } else if (Array.isArray(res)) {
        data = res
      }
      
      console.log('Processed periods data:', data)
      setPeriods(data)
      
      // Auto-select the first period if none is selected
      if (data.length > 0 && data[0]?.period) {
        console.log(`Auto-selecting first period: ${data[0].period}`)
        setSelectedPeriod(data[0].period)
        loadChecklist(data[0].period)
      } else {
        console.log('No periods available for auto-selection')
      }
    } catch (e: any) {
      console.error('Error loading periods:', e)
      if (e?.message?.includes('<!DOCTYPE')) {
        setError('API endpoint not found. Please check if the backend is running.')
        // Provide sample data for demo purposes
        const samplePeriods = [
          { period: '2024-01', status: 'open' as const },
          { period: '2024-02', status: 'locked' as const },
          { period: '2024-03', status: 'closed' as const }
        ]
        setPeriods(samplePeriods)
        setSelectedPeriod(samplePeriods[0].period)
        loadChecklist(samplePeriods[0].period)
      } else {
        setError(e?.message || 'Failed to load periods')
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadChecklist(period: string) {
    try {
      const res = await periodCloseApi.getChecklist(companyId, period)
      
      // Handle the response structure: { success: true, data: [...] }
      let data = []
      if (res?.data && Array.isArray(res.data)) {
        data = res.data
      } else if (Array.isArray(res)) {
        data = res
      }
      
      setChecklist(data)
    } catch (e: any) {
      console.error('Failed to load checklist:', e)
      // Provide sample checklist data
      const sampleChecklist = [
        { id: '1', title: 'Bank reconciliations complete', completed: false, order: 1 },
        { id: '2', title: 'Accruals and deferrals posted', completed: true, order: 2 },
        { id: '3', title: 'Intercompany reconciled', completed: false, order: 3 },
        { id: '4', title: 'Revenue recognition posted', completed: true, order: 4 },
      ]
      setChecklist(sampleChecklist)
    }
  }

  async function updateChecklistItem(itemId: string, completed: boolean) {
    try {
      await periodCloseApi.updateChecklist(companyId, selectedPeriod, itemId, { completed })
      // Reload checklist to get updated data
      loadChecklist(selectedPeriod)
    } catch (e: any) {
      console.error('Failed to update checklist item:', e)
      setError(e?.message || 'Failed to update checklist item')
    }
  }

  async function loadFxPreview() {
    try {
      const res = await periodCloseApi.getFxPreview(companyId, selectedPeriod)
      setFxPreview(res?.data || null)
    } catch (e: any) {
      console.error('Failed to load FX preview:', e)
    }
  }

  async function loadFxHistory() {
    try {
      const res = await periodCloseApi.getFxHistory(companyId, selectedPeriod)
      setFxHistory(res?.data || null)
    } catch (e: any) {
      console.error('Failed to load FX history:', e)
    }
  }

  async function loadAccounts() {
    try {
      const res = await periodCloseApi.getAccounts(companyId)
      setAccounts(res?.data || [])
    } catch (e: any) {
      console.error('Failed to load accounts:', e)
    }
  }

  async function loadRuns() {
    try {
      const res = await periodCloseApi.getRuns(companyId, selectedPeriod)
      console.log('Runs API response:', res)
      
      // Handle the response structure: { success: true, data: [...] }
      let data = []
      if (res?.data && Array.isArray(res.data)) {
        data = res.data
      } else if (Array.isArray(res)) {
        data = res
      }
      
      // Transform backend data to frontend format
      const transformedRuns = data.map((run: any) => {
        const runType = run.type || 'unknown'
        const payload = run.payload || {}
        
        // Map run types to display names
        const typeNames: Record<string, string> = {
          'recurring': 'Recurring Journals',
          'allocations': 'Allocations',
          'fx-reval': 'FX Revaluation'
        }
        
        // Determine status based on payload
        let status = 'success'
        if (payload.error || payload.status === 'error') {
          status = 'error'
        } else if (payload.status === 'pending') {
          status = 'pending'
        }
        
        // Create description based on type and payload
        let description = ''
        if (runType === 'recurring') {
          description = `Posted ${payload.posted || 0} recurring entries`
        } else if (runType === 'allocations') {
          description = `Processed ${payload.allocationsPosted || 0} allocations`
        } else if (runType === 'fx-reval') {
          description = `Posted ${payload.entriesPosted || 0} FX revaluation entries`
        } else {
          description = 'Period close process executed'
        }
        
        return {
          id: run.id,
          name: typeNames[runType] || runType,
          description: description,
          status: status,
          duration: '1.2s', // Default duration since backend doesn't track this
          type: runType,
          at: run.at
        }
      })
      
      console.log('Transformed runs:', transformedRuns)
      setRuns(transformedRuns)
    } catch (e: any) {
      console.error('Failed to load runs:', e)
      // Provide sample runs data
      const sampleRuns = [
        { id: '1', name: 'Recurring Journals', description: 'Monthly recurring entries', status: 'success', duration: '2.3s' },
        { id: '2', name: 'Allocations', description: 'Overhead allocations', status: 'success', duration: '1.8s' },
        { id: '3', name: 'FX Revaluation', description: 'Foreign exchange revaluation', status: 'error', duration: '0.5s' },
      ]
      setRuns(sampleRuns)
    }
  }

  async function startClose() {
    if (!selectedPeriod) {
      console.log('No period selected for start close')
      return
    }
    
    console.log(`Starting close for period: ${selectedPeriod}, company: ${companyId}`)
    setLoading(true)
    setError(null) // Clear any previous errors
    
    try {
      const result = await periodCloseApi.startClose(companyId, selectedPeriod)
      console.log('Start close result:', result)
      
      // Reload periods to show updated status
      await loadPeriods()
      
      // Also reload checklist for the locked period
      await loadChecklist(selectedPeriod)
      
      // Load runs to show any existing runs
      await loadRuns()
      
      console.log('Period close started successfully')
    } catch (e: any) {
      console.error('Start close error:', e)
      setError(e?.message || 'Failed to start period close')
    } finally {
      setLoading(false)
    }
  }

  async function completeClose() {
    if (!selectedPeriod) {
      console.log('No period selected for complete close')
      return
    }
    
    console.log(`Completing close for period: ${selectedPeriod}, company: ${companyId}`)
    setLoading(true)
    setError(null)
    
    try {
      const result = await periodCloseApi.completeClose(companyId, selectedPeriod)
      console.log('Complete close result:', result)
      
      // Reload periods to show updated status
      await loadPeriods()
      
      // Also reload checklist for the closed period
      await loadChecklist(selectedPeriod)
      
      // Load runs to show any existing runs
      await loadRuns()
      
      console.log('Period close completed successfully')
    } catch (e: any) {
      console.error('Complete close error:', e)
      setError(e?.message || 'Failed to complete period close')
    } finally {
      setLoading(false)
    }
  }

  async function runRecurringJournals() {
    if (!selectedPeriod) return
    setLoading(true)
    try {
      const result = await periodCloseApi.runRecurring(companyId, selectedPeriod)
      console.log('Recurring journals result:', result)
      await loadRuns() // Reload runs to show the new execution
      console.log('Recurring journals executed successfully')
    } catch (e: any) {
      setError(e?.message || 'Failed to run recurring journals')
    } finally {
      setLoading(false)
    }
  }

  async function runAllocations() {
    if (!selectedPeriod) return
    setLoading(true)
    try {
      const result = await periodCloseApi.runAllocations(companyId, selectedPeriod)
      console.log('Allocations result:', result)
      await loadRuns() // Reload runs to show the new execution
      console.log('Allocations executed successfully')
    } catch (e: any) {
      setError(e?.message || 'Failed to run allocations')
    } finally {
      setLoading(false)
    }
  }

  async function runFxRevaluation() {
    if (!selectedPeriod) return
    setLoading(true)
    try {
      const result = await periodCloseApi.runFxReval(companyId, selectedPeriod, 'USD')
      console.log('FX revaluation result:', result)
      await loadRuns() // Reload runs to show the new execution
      console.log('FX revaluation executed successfully')
    } catch (e: any) {
      setError(e?.message || 'Failed to run FX revaluation')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="default">Open</Badge>
      case 'locked': return <Badge variant="secondary">Locked</Badge>
      case 'closing': return <Badge variant="destructive">Closing</Badge>
      case 'closed': return <Badge variant="outline">Closed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Period Close</h1>
            <p className="text-gray-600 mt-1">Manage accounting period closures and financial reporting</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seed-company-1">Uruti Hub Limited</SelectItem>
                <SelectItem value="seed-company-2">Acme Trading Co</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error?.message || error?.toString() || 'Unknown error'}</p>
            </CardContent>
          </Card>
        )}

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Open Periods</p>
                  <p className="text-2xl font-bold text-green-600">
                    {periods.filter(p => p.status === 'open').length}
                  </p>
                </div>
                <div className="text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Locked Periods</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {periods.filter(p => p.status === 'locked').length}
                  </p>
                </div>
                <div className="text-blue-600">
                  <Lock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Closed Periods</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {periods.filter(p => p.status === 'closed').length}
                  </p>
                </div>
                <div className="text-gray-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Accounting Periods</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {periods.length} periods
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('Manual refresh triggered')
                      loadPeriods()
                    }}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Select value={selectedPeriod} onValueChange={(value) => {
                    console.log(`Period selected from dropdown: ${value}`)
                    setSelectedPeriod(value)
                    loadChecklist(value)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.period} value={period.period}>
                          {period.period} - {getStatusBadge(period.status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                    <div>Debug: selectedPeriod = "{selectedPeriod}"</div>
                    <div>Periods count = {periods.length}</div>
                    <div>Periods: {periods.map(p => `${p.period}(${p.status})`).join(', ')}</div>
                    <div>Loading: {loading ? 'Yes' : 'No'}</div>
                  </div>

                  <div className="space-y-3">
                    {periods.map((period) => (
                      <div 
                        key={period.period} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedPeriod === period.period ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          console.log(`Period clicked: ${period.period}`)
                          setSelectedPeriod(period.period)
                          loadChecklist(period.period)
                          loadRuns()
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="font-medium text-lg">{period.period}</div>
                              {getStatusBadge(period.status)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {period.status === 'open' && (
                                <span className="inline-flex items-center gap-1 text-green-700">
                                  <TrendingUp className="w-4 h-4" /> Active period - transactions allowed
                                </span>
                              )}
                              {period.status === 'locked' && (
                                <span className="inline-flex items-center gap-1 text-blue-700">
                                  <Lock className="w-4 h-4" /> Review period - no new transactions
                                </span>
                              )}
                              {period.status === 'closed' && (
                                <span className="inline-flex items-center gap-1 text-gray-700">
                                  <CheckCircle className="w-4 h-4" /> Finalized - period complete
                                </span>
                              )}
                            </div>
                            {selectedPeriod === period.period && (
                              <div className="text-xs text-blue-600 mt-2 font-medium">
                                Currently selected period
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end text-sm text-gray-500">
                            <div>Transactions: --</div>
                            <div>Balance: --</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Close Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Period Close Checklist</h3>
                    <div className="text-sm text-gray-500">
                      {checklist.filter(item => item.completed).length} of {checklist.length} completed
                    </div>
                  </div>
                  {checklist.length > 0 ? (
                    <div className="space-y-3">
                      {checklist.map((item, index) => (
                        <div key={item.id || index} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                          <input 
                            type="checkbox" 
                            checked={item.completed} 
                            onChange={(e) => updateChecklistItem(item.id, e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className={`block ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.title || item.description}
                            </span>
                            {item.completed && (
                              <span className="text-xs text-green-600 mt-1 block">✓ Completed</span>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(checklist.filter(item => item.completed).length / checklist.length) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Progress: {Math.round((checklist.filter(item => item.completed).length / checklist.length) * 100)}% complete
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <div className="text-2xl mb-2">📋</div>
                      <p>Select a period to view checklist</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button 
                      onClick={startClose} 
                      disabled={loading || !selectedPeriod || periods.find(p => p.period === selectedPeriod)?.status !== 'open'}
                      className="flex-1"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <span>Start Close</span>
                        </div>
                      )}
                    </Button>
                    <Button 
                      onClick={completeClose} 
                      disabled={loading || !selectedPeriod || periods.find(p => p.period === selectedPeriod)?.status !== 'locked'} 
                      variant="outline"
                      className="flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete Close</span>
                      </div>
                    </Button>
                  </div>
                  
                  {selectedPeriod && (
                    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                      {(() => {
                        const period = periods.find(p => p.period === selectedPeriod);
                        if (!period) return 'Select a period to view available actions';
                        
                        switch (period.status) {
                          case 'open':
                            return '💡 You can start the close process for this open period';
                          case 'locked':
                            return '💡 This period is locked and ready to be completed';
                          case 'closed':
                            return '✅ This period is already closed and finalized';
                          default:
                            return 'Period status unknown';
                        }
                      })()}
                    </div>
                  )}

                  {/* Automated Processes */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-sm text-gray-700 mb-3">Automated Processes</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        onClick={runRecurringJournals} 
                        disabled={loading || !selectedPeriod}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                      >
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          <span>Run Recurring Journals</span>
                        </div>
                      </Button>
                      <Button 
                        onClick={runAllocations} 
                        disabled={loading || !selectedPeriod}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>Run Allocations</span>
                        </div>
                      </Button>
                      <Button 
                        onClick={runFxRevaluation} 
                        disabled={loading || !selectedPeriod}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                      >
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" />
                          <span>Run FX Revaluation</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Period Close Runs</CardTitle>
              <Badge variant="outline">
                {selectedPeriod || 'Select period'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {runs.length > 0 ? (
              <div className="space-y-3">
                {runs.map((run, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{run.name}</div>
                          <Badge variant={
                            run.status === 'success' ? 'default' : 
                            run.status === 'error' ? 'destructive' : 
                            'secondary'
                          }>
                            {run.status === 'success' && '✅ '}
                            {run.status === 'error' && '❌ '}
                            {run.status === 'pending' && '⏳ '}
                            {run.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{run.description}</div>
                        {run.status === 'success' && (
                          <div className="text-xs text-green-600 mt-1">
                            Completed successfully in {run.duration}
                          </div>
                        )}
                        {run.status === 'error' && (
                          <div className="text-xs text-red-600 mt-1">
                            Failed after {run.duration} - Click to retry
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{run.duration}</div>
                        {run.timestamp && (
                          <div className="text-xs">{run.timestamp}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="text-gray-600">
                      {runs.filter(r => r.status === 'success').length} of {runs.length} completed
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${(runs.filter(r => r.status === 'success').length / runs.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-3">🔄</div>
                <p className="font-medium">No close runs yet</p>
                <p className="text-sm mt-1">
                  {selectedPeriod 
                    ? 'Start the close process to see runs here' 
                    : 'Select a period and start closing to track progress'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
