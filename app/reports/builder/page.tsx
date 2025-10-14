'use client'

import React from 'react'
import apiService from '@/lib/api'
import { PageLayout } from '@/components/page-layout'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type BuilderItem = {
  id?: string
  name: string
  type: 'account' | 'calculation' | 'text' | 'chart'
  order?: number
  configuration?: any
  formula?: string
  accountIds?: string[]
}

export default function ReportBuilderPage() {
  const [companyId, setCompanyId] = React.useState<string>('seed-company-1')
  const [name, setName] = React.useState<string>('Custom Report')
  const [type, setType] = React.useState<'balance_sheet' | 'income_statement' | 'cash_flow' | 'equity' | 'custom'>('custom')
  const [description, setDescription] = React.useState<string>('')
  const [items, setItems] = React.useState<BuilderItem[]>([
    { name: 'Notes', type: 'text' },
  ])
  const [preview, setPreview] = React.useState<any | null>(null)
  const [saving, setSaving] = React.useState<boolean>(false)
  const [loadingPreview, setLoadingPreview] = React.useState<boolean>(false)
  const [accountOptions, setAccountOptions] = React.useState<Array<{ id: string; code: string; name: string }>>([])
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [accountSearch, setAccountSearch] = React.useState<string>('')
  const [params, setParams] = React.useState<Record<string, string>>({})
  const [schedules, setSchedules] = React.useState<any[]>([])
  const [newSchedule, setNewSchedule] = React.useState<{ name: string; frequency: 'daily'|'weekly'|'monthly'|'quarterly'|'yearly'; nextRun: string; recipients: string; format: 'pdf'|'excel'|'csv'; isActive: boolean }>({ name: '', frequency: 'monthly', nextRun: new Date().toISOString(), recipients: '', format: 'pdf', isActive: true })
  const [selectedReportId, setSelectedReportId] = React.useState<string>('')
  const [reportOptions, setReportOptions] = React.useState<any[]>([])
  const [delivery, setDelivery] = React.useState<{ format: 'pdf'|'excel'|'csv'|'json'; emailTo: string; emailSubject: string; emailBody: string; slackUrl: string; webhookUrl: string }>(
    { format: 'pdf', emailTo: '', emailSubject: '', emailBody: '', slackUrl: '', webhookUrl: '' }
  )
  const [expandedItemIdx, setExpandedItemIdx] = React.useState<number | null>(null)
  const [lineageData, setLineageData] = React.useState<any | null>(null)
  const [auditData, setAuditData] = React.useState<any | null>(null)
  const itemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    type: z.enum(['account','calculation','text','chart']),
    order: z.number().int().min(0).optional(),
    configuration: z.any().optional(),
    formula: z.string().optional(),
    accountIds: z.array(z.string().min(1)).optional()
  }).superRefine((val, ctx) => {
    if (val.type === 'account' && (!val.accountIds || val.accountIds.length === 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select at least one account', path: ['accountIds'] })
    }
    if (val.type === 'calculation' && (!val.formula || val.formula.trim().length === 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Formula is required', path: ['formula'] })
    }
  })

  const specSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['balance_sheet','income_statement','cash_flow','equity','custom']),
    description: z.string().optional(),
    items: z.array(itemSchema).min(1, 'Add at least one item')
  })

  React.useEffect(() => {
    // Load accounts for picker
    apiService.getAccounts(companyId).then((resp: any) => {
      const flat = resp?.flat || []
      setAccountOptions(flat.map((a: any) => ({ id: a.id, code: a.code, name: a.name })))
    }).catch(() => {})
    // Load reports to attach schedules
    apiService.listReports({ page: 1, limit: 50 }).then((r) => setReportOptions(r.reports || [])).catch(() => {})
  }, [companyId])

  React.useEffect(() => {
    if (!selectedReportId) { setSchedules([]); return }
    apiService.listReportSchedules(selectedReportId).then(setSchedules).catch(() => setSchedules([]))
  }, [selectedReportId])

  function addItem(kind: BuilderItem['type']) {
    const base: BuilderItem = { name: kind === 'text' ? 'Text' : kind, type: kind }
    setItems(prev => [...prev, base])
  }

  function moveItem(index: number, dir: -1 | 1) {
    setItems(prev => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      const tmp = next[index]
      next[index] = next[target]
      next[target] = tmp
      return next
    })
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, patch: Partial<BuilderItem>) {
    setItems(prev => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  async function doPreview() {
    // Client-side schema validation
    const specCandidate = {
      name,
      type,
      description,
      items: items.map((it, i) => ({ ...it, order: i }))
    }
    const parsed = specSchema.safeParse(specCandidate)
    if (!parsed.success) {
      const next: Record<string,string> = {}
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === 'name') next['name'] = String(issue.message)
        if (issue.path[0] === 'items' && typeof issue.path[1] === 'number') {
          const idx = issue.path[1]
          const field = String(issue.path[2] || 'name')
          next[`item_${idx}_${field === 'accountIds' ? 'accounts' : field}`] = String(issue.message)
        }
      }
      setErrors(next)
      return
    }
    setErrors({})
    setLoadingPreview(true)
    try {
      const resp = await apiService.previewReportBuilder({ companyId, spec: specCandidate })
      setPreview(resp.data ?? resp)
    } catch (e: any) {
      console.error('Preview failed', e)
      setPreview({ error: e.message || 'Preview failed' })
    } finally {
      setLoadingPreview(false)
    }
  }

  async function saveTemplate() {
    setSaving(true)
    try {
      const spec = {
        name,
        type,
        description,
        items: items.map((it, i) => ({
          ...it,
          order: i,
        }))
      }
      const resp = await apiService.saveReportBuilderTemplate({
        name,
        type,
        description,
        category: 'custom',
        isPublic: false,
        spec
      })
      alert('Template saved')
    } catch (e: any) {
      alert(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function download(filename: string, content: string, type = 'application/octet-stream') {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPreviewAsJSON() {
    if (!preview) return
    const data = preview.data ?? preview
    download(`${name || 'report'}-preview.json`, JSON.stringify(data, null, 2), 'application/json')
  }

  function exportPreviewAsCSV() {
    if (!preview) return
    const data = (preview.data ?? preview)
    const rows = Array.isArray(data.items) ? data.items : []
    if (!rows.length) { alert('No tabular items to export'); return }
    const headers = ['id','name','type','order','value']
    const csv = [headers.join(',')].concat(
      rows.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ).join('\n')
    download(`${name || 'report'}-preview.csv`, csv, 'text/csv')
  }

  async function createSchedule(reportId: string) {
    try {
      const payload = { ...newSchedule }
      if (!payload.name.trim()) {
        alert('Schedule name is required')
        return
      }
      const created = await apiService.createReportSchedule(reportId, payload)
      setSchedules(prev => [...prev, created])
      setNewSchedule({ name: '', frequency: 'monthly', nextRun: new Date().toISOString(), recipients: '', format: 'pdf', isActive: true })
      alert('Schedule created')
    } catch (e: any) {
      alert(e.message || 'Failed to create schedule')
    }
  }

  async function toggleScheduleActive(reportId: string, schedule: any) {
    try {
      const updated = await apiService.updateReportSchedule(reportId, schedule.id, { isActive: !schedule.isActive })
      setSchedules(prev => prev.map(s => s.id === schedule.id ? updated : s))
    } catch (e: any) {
      alert(e.message || 'Failed to update schedule')
    }
  }

  async function deleteSchedule(reportId: string, scheduleId: string) {
    try {
      await apiService.deleteReportSchedule(reportId, scheduleId)
      setSchedules(prev => prev.filter(s => s.id !== scheduleId))
    } catch (e: any) {
      alert(e.message || 'Failed to delete schedule')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function onDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((_, idx) => String(idx) === String(active.id))
    const newIndex = items.findIndex((_, idx) => String(idx) === String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    setItems(prev => arrayMove(prev, oldIndex, newIndex))
  }

  function DraggableItem({ index, children }: { index: number; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(index) })
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.6 : 1,
    }
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium">Company ID</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={companyId} onChange={e => setCompanyId(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Type</label>
              <select className="mt-1 w-full border rounded px-3 py-2" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="custom">Custom</option>
                <option value="balance_sheet">Balance Sheet</option>
                <option value="income_statement">Income Statement</option>
                <option value="cash_flow">Cash Flow</option>
                <option value="equity">Equity</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea className="mt-1 w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => addItem('text')}>Add Text</Button>
            <Button onClick={() => addItem('account')}>Add Account</Button>
            <Button onClick={() => addItem('calculation')}>Add Calculation</Button>
            <Button onClick={() => addItem('chart')}>Add Chart</Button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((it, i) => (
                  <DraggableItem key={i} index={i}>
              <div className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Item {i + 1}</div>
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-500">Drag to reorder</span>
                    <Button variant="destructive" onClick={() => removeItem(i)}>Remove</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm">Name</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={it.name} onChange={e => updateItem(i, { name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm">Type</label>
                    <select className="mt-1 w-full border rounded px-3 py-2" value={it.type} onChange={e => updateItem(i, { type: e.target.value as any })}>
                      <option value="text">Text</option>
                      <option value="account">Account</option>
                      <option value="calculation">Calculation</option>
                      <option value="chart">Chart</option>
                    </select>
                  </div>
                  {it.type === 'account' && (
                    <div className="col-span-2">
                      <label className="block text-sm">Accounts</label>
                      <div className="mt-1">
                        <input className="w-full border rounded px-3 py-2" placeholder="Search accounts..." value={accountSearch} onChange={e => setAccountSearch(e.target.value)} />
                        <div className="mt-2 max-h-40 overflow-auto border rounded">
                          {accountOptions.filter(a => (
                            (a.code?.toLowerCase().includes(accountSearch.toLowerCase()) || a.name?.toLowerCase().includes(accountSearch.toLowerCase()))
                          )).slice(0, 50).map(opt => {
                            const selected = (it.accountIds || []).includes(opt.id)
                            return (
                              <label key={opt.id} className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" checked={selected} onChange={(e) => {
                                  const next = new Set(it.accountIds || [])
                                  if (e.target.checked) next.add(opt.id)
                                  else next.delete(opt.id)
                                  updateItem(i, { accountIds: Array.from(next) })
                                }} />
                                <span>{opt.code} - {opt.name}</span>
                              </label>
                            )
                          })}
                        </div>
                        <div className="mt-2">
                          <Button variant="secondary" onClick={() => updateItem(i, { accountIds: [] })}>Clear</Button>
                        </div>
                      </div>
                      {it.accountIds && it.accountIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {it.accountIds.map((accId, idx) => {
                            const meta = accountOptions.find(a => a.id === accId)
                            return (
                              <span key={idx} className="inline-flex items-center gap-1 text-xs bg-gray-100 rounded px-2 py-1">
                                {meta ? `${meta.code} - ${meta.name}` : accId}
                                <button onClick={() => updateItem(i, { accountIds: (it.accountIds || []).filter(a => a !== accId) })}>×</button>
                              </span>
                            )
                          })}
                        </div>
                      )}
                      {errors[`item_${i}_accounts`] && <div className="text-xs text-red-600 mt-1">{errors[`item_${i}_accounts`]}</div>}
                    </div>
                  )}
                  {it.type === 'calculation' && (
                    <div className="col-span-2">
                      <label className="block text-sm">Formula</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" placeholder="sum(1,2,3)" value={it.formula || ''} onChange={e => updateItem(i, { formula: e.target.value })} />
                      {errors[`item_${i}_formula`] && <div className="text-xs text-red-600 mt-1">{errors[`item_${i}_formula`]}</div>}
                    </div>
                  )}
                  {it.type === 'text' && (
                    <div className="col-span-2">
                      <label className="block text-sm">Text</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" value={it.name} onChange={e => updateItem(i, { name: e.target.value })} />
                      {errors[`item_${i}_name`] && <div className="text-xs text-red-600 mt-1">{errors[`item_${i}_name`]}</div>}
                    </div>
                  )}

                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" onClick={async () => {
                    setExpandedItemIdx(i)
                    setLineageData(null)
                    setAuditData(null)
                    if (!selectedReportId) { alert('Select a report to view lineage'); return }
                    try {
                      const itemId = preview?.data?.items?.[i]?.id || preview?.items?.[i]?.id
                      if (!itemId) { alert('No item id available; save as report first.'); return }
                      const lineage = await apiService.getReportItemLineage(selectedReportId, itemId)
                      setLineageData(lineage)
                      const audit = await apiService.getReportItemAudit(selectedReportId, itemId)
                      setAuditData(audit)
                    } catch (e: any) { alert(e.message || 'Failed to fetch lineage/audit') }
                  }}>View Lineage</Button>
                </div>
                {expandedItemIdx === i && (
                  <div className="mt-3 border-t pt-3">
                    <h4 className="font-medium mb-2">Lineage</h4>
                    {!lineageData && <div className="text-sm text-gray-500">No data</div>}
                    {lineageData && lineageData.lineage && lineageData.lineage.length > 0 && (
                      <div className="max-h-60 overflow-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left">
                              <th className="pr-2">Date</th>
                              <th className="pr-2">Account</th>
                              <th className="pr-2">Memo</th>
                              <th className="pr-2">Debit</th>
                              <th>Credit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lineageData.lineage.map((row: any, idx: number) => (
                              <tr key={idx}>
                                <td className="pr-2">{String(row.date || '')}</td>
                                <td className="pr-2">{row.accountCode} {row.accountName}</td>
                                <td className="pr-2">{row.memo || ''}</td>
                                <td className="pr-2">{row.debit}</td>
                                <td>{row.credit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <h4 className="font-medium mb-2 mt-3">Audit</h4>
                    {auditData && auditData.executions && (
                      <div className="text-xs">Executions: {auditData.executions.length}</div>
                    )}
                  </div>
                )}
              </div>
                  </DraggableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex gap-2">
            <Button onClick={doPreview} disabled={loadingPreview}>{loadingPreview ? 'Previewing...' : 'Preview'}</Button>
            <Button onClick={saveTemplate} disabled={saving}>{saving ? 'Saving...' : 'Save as Template'}</Button>
          </div>
        </div>

        <div>
          <div className="border rounded p-4 h-full">
            <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
            <div className="flex gap-2 mb-3">
              <Button variant="secondary" onClick={exportPreviewAsJSON} disabled={!preview}>Export JSON</Button>
              <Button variant="secondary" onClick={exportPreviewAsCSV} disabled={!preview}>Export CSV</Button>
            </div>
            {!preview && <div className="text-sm text-gray-500">No preview yet</div>}
            {preview && preview.error && (
              <div className="text-red-600 text-sm">{String(preview.error)}</div>
            )}
            {preview && preview.data && (
              <pre className="text-xs overflow-auto max-h-[600px]">{JSON.stringify(preview.data, null, 2)}</pre>
            )}
            {preview && !preview.data && (
              <pre className="text-xs overflow-auto max-h-[600px]">{JSON.stringify(preview, null, 2)}</pre>
            )}
          </div>
          <div className="border rounded p-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Parameters</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Start Date (YYYY-MM-DD)</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={params.startDate || ''} onChange={e => setParams(prev => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">End Date (YYYY-MM-DD)</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={params.endDate || ''} onChange={e => setParams(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Department</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={params.department || ''} onChange={e => setParams(prev => ({ ...prev, department: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Project</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={params.project || ''} onChange={e => setParams(prev => ({ ...prev, project: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Location</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={params.location || ''} onChange={e => setParams(prev => ({ ...prev, location: e.target.value }))} />
              </div>
              {Object.entries(params).map(([k, v]) => (
                <div key={k} className="col-span-1">
                  <label className="block text-sm">{k}</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value={v} onChange={e => setParams(prev => ({ ...prev, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm">Add parameter</label>
                <div className="flex gap-2">
                  <input id="paramKey" placeholder="key" className="w-1/3 border rounded px-3 py-2" />
                  <input id="paramVal" placeholder="value" className="w-2/3 border rounded px-3 py-2" />
                  <Button onClick={() => {
                    const keyEl = document.getElementById('paramKey') as HTMLInputElement
                    const valEl = document.getElementById('paramVal') as HTMLInputElement
                    const k = keyEl?.value?.trim()
                    if (!k) return
                    setParams(prev => ({ ...prev, [k]: valEl?.value || '' }))
                    if (keyEl) keyEl.value = ''
                    if (valEl) valEl.value = ''
                  }}>Add</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded p-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Scheduling</h3>
            <div className="mb-3">
              <label className="block text-sm">Attach to existing report</label>
              <select className="mt-1 w-full border rounded px-3 py-2" value={selectedReportId} onChange={e => setSelectedReportId(e.target.value)}>
                <option value="">Select a report...</option>
                {reportOptions.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Name</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={newSchedule.name} onChange={e => setNewSchedule(s => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Frequency</label>
                <select className="mt-1 w-full border rounded px-3 py-2" value={newSchedule.frequency} onChange={e => setNewSchedule(s => ({ ...s, frequency: e.target.value as any }))}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Next Run (ISO)</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={newSchedule.nextRun} onChange={e => setNewSchedule(s => ({ ...s, nextRun: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Recipients (comma-separated emails)</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={newSchedule.recipients} onChange={e => setNewSchedule(s => ({ ...s, recipients: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Format</label>
                <select className="mt-1 w-full border rounded px-3 py-2" value={newSchedule.format} onChange={e => setNewSchedule(s => ({ ...s, format: e.target.value as any }))}>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newSchedule.isActive} onChange={e => setNewSchedule(s => ({ ...s, isActive: e.target.checked }))} /> Active
                </label>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (!selectedReportId) { alert('Select a report to attach schedule'); return }
                  createSchedule(selectedReportId)
                }}>Create Schedule</Button>
                <Button variant="secondary" onClick={async () => {
                  // Save current spec as a new report then schedule
                  try {
                    const spec = {
                      name,
                      type,
                      description,
                      items: items.map((it, i) => ({ ...it, order: i }))
                    }
                    const created = await apiService.createReportFromBuilder(spec as any)
                    const newId = (created as any)?.id || (created as any)?.data?.id
                    if (!newId) { alert('Failed to create report'); return }
                    setSelectedReportId(newId)
                    alert('Report created. You can now create a schedule.')
                  } catch (e: any) {
                    alert(e.message || 'Failed to create report')
                  }
                }}>Save as Report</Button>
              </div>
            </div>
            {schedules.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Existing Schedules</h4>
                <ul className="space-y-2">
                  {schedules.map((s, idx) => (
                    <li key={idx} className="text-sm border rounded px-3 py-2 flex items-center justify-between">
                      <span>{s.name} • {s.frequency} • Next: {s.nextRun} • {s.isActive ? 'Active' : 'Paused'}</span>
                      <span className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => toggleScheduleActive(selectedReportId, s)}>{s.isActive ? 'Pause' : 'Activate'}</Button>
                        <Button variant="destructive" onClick={() => deleteSchedule(selectedReportId, s.id)}>Delete</Button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border rounded p-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Ad-hoc Delivery</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Format</label>
                <select className="mt-1 w-full border rounded px-3 py-2" value={delivery.format} onChange={e => setDelivery(d => ({ ...d, format: e.target.value as any }))}>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div />
              <div className="col-span-2">
                <label className="block text-sm">Email To (comma-separated)</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={delivery.emailTo} onChange={e => setDelivery(d => ({ ...d, emailTo: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Email Subject</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={delivery.emailSubject} onChange={e => setDelivery(d => ({ ...d, emailSubject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Email Body</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={delivery.emailBody} onChange={e => setDelivery(d => ({ ...d, emailBody: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Slack Webhook URL</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={delivery.slackUrl} onChange={e => setDelivery(d => ({ ...d, slackUrl: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm">Generic Webhook URL</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={delivery.webhookUrl} onChange={e => setDelivery(d => ({ ...d, webhookUrl: e.target.value }))} />
              </div>
            </div>
            <div className="mt-3">
              <Button onClick={async () => {
                try {
                  const reportId = selectedReportId
                  if (!reportId) { alert('Select a report or save as report first'); return }
                  const channels: any = {}
                  if (delivery.emailTo.trim()) channels.email = { recipients: delivery.emailTo.split(',').map(s => s.trim()).filter(Boolean), subject: delivery.emailSubject || undefined, body: delivery.emailBody || undefined }
                  if (delivery.slackUrl.trim()) channels.slack = { webhookUrl: delivery.slackUrl.trim() }
                  if (delivery.webhookUrl.trim()) channels.webhook = { url: delivery.webhookUrl.trim() }
                  const resp = await apiService.deliverReport(reportId, { format: delivery.format, parameters: params, channels })
                  alert('Delivery requested')
                } catch (e: any) {
                  alert(e.message || 'Failed to deliver')
                }
              }}>Deliver Now</Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}


