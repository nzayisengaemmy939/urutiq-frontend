import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { useMutation, useQuery } from "@tanstack/react-query"
import { expenseApi } from "../lib/api/accounting"

type ReceiptCaptureProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCompanyId?: string
  onCreated?: (expenseId: string) => void
}

export function ReceiptCaptureModal({ open, onOpenChange, defaultCompanyId, onCreated }: ReceiptCaptureProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [companyId, setCompanyId] = React.useState<string>(defaultCompanyId || "")
  const [vendorName, setVendorName] = React.useState<string>("")
  const [amount, setAmount] = React.useState<string>("")
  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0,10))
  const [categoryId, setCategoryId] = React.useState<string>("")
  const [description, setDescription] = React.useState<string>("")
  const [extracting, setExtracting] = React.useState(false)
  const [department, setDepartment] = React.useState<string>("")
  const [project, setProject] = React.useState<string>("")

  React.useEffect(() => {
    try {
      if (!companyId) {
        const stored = localStorage.getItem("company_id") || localStorage.getItem("companyId") || localStorage.getItem("company")
        if (stored) setCompanyId(stored)
      }
    } catch {}
  }, [companyId])

  const { data: categories } = useQuery({
    queryKey: ["expense-categories", companyId],
    enabled: !!companyId,
    queryFn: async () => expenseApi.getExpenseCategories({ companyId })
  })

  const uploadObjectUrl = (fileObj: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(fileObj)
    setPreviewUrl(url)
  }

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (f) uploadObjectUrl(f)
  }

  const runOcr = async () => {
    if (!file) return
    setExtracting(true)
    try {
      // Lazy load Tesseract.js from CDN to keep bundle light
      const loadTesseract = (): Promise<any> => new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && (window as any).Tesseract) return resolve((window as any).Tesseract)
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4.0.2/dist/tesseract.min.js'
        s.async = true
        s.onload = () => resolve((window as any).Tesseract)
        s.onerror = reject
        document.head.appendChild(s)
      })
      const Tesseract = await loadTesseract()
      const result = await Tesseract.recognize(file, 'eng', { logger: () => {} })
      const text = result?.data?.text || ''
      if (text) {
        // Simple heuristics for amount, date, vendor
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
        const maybeVendor = lines[0] || ''
        const amountMatch = text.match(/\$?\s*([0-9]{1,3}(?:[,][0-9]{3})*(?:\.[0-9]{2})|[0-9]+\.[0-9]{2})\b/g)
        const dateMatch = text.match(/\b(20[0-9]{2}[-\/.][0-1]?[0-9][-\/.][0-3]?[0-9]|[0-3]?[0-9][-\/.][0-1]?[0-9][-\/.](20[0-9]{2}))\b/)
        if (maybeVendor && !vendorName) setVendorName(maybeVendor.slice(0, 80))
        if (amountMatch && !amount) {
          const last = amountMatch[amountMatch.length - 1].replace(/\$/g, '').replace(/,/g, '').trim()
          setAmount(last)
        }
        if (dateMatch && !date) {
          const raw = dateMatch[0].replace(/[.]/g, '-').replace(/[\/]/g, '-')
          const parts = raw.split('-')
          const normalized = parts[0].length === 4 ? raw : `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
          setDate(normalized)
        }
        if (!description) setDescription(lines.slice(0, 3).join(' '))
      }
    } catch {
      // ignore
    } finally {
      setExtracting(false)
    }
  }

  const createExpenseMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(amount || "0")
      const payload = {
        companyId: companyId,
        amount: isFinite(amt) ? amt : 0,
        taxAmount: 0,
        totalAmount: isFinite(amt) ? amt : 0,
        expenseDate: date,
        categoryId: categoryId || (categories?.[0]?.id || ""),
        description: description || `Receipt from ${vendorName || "Unknown Vendor"}`,
        department: department || undefined,
        project: project || undefined,
        vendorId: undefined,
      } as any
      const created = await expenseApi.createExpense(payload)
      return created
    },
    onSuccess: (exp: any) => {
      onCreated?.(exp?.id)
      // persist selected company
      try { localStorage.setItem("company_id", companyId) } catch {}
      onOpenChange(false)
      // reset
      setFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null)
      setVendorName(""); setAmount(""); setDescription("")
    }
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!createExpenseMutation.isPending) onOpenChange(v) }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Scan Receipt (Quick Add)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Company</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {/* Companies are provided globally elsewhere; fallback to current only */}
                  {companyId && (<SelectItem value={companyId}>{companyId}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Vendor</Label>
              <Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="e.g., Starbucks" />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {(categories || []).map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional notes" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Department (optional)</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Marketing" />
            </div>
            <div>
              <Label>Project (optional)</Label>
              <Input value={project} onChange={(e) => setProject(e.target.value)} placeholder="e.g., Q3 Launch" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Receipt (image or PDF)</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={onFileChange} />
            {previewUrl && (
              <div className="border rounded-md p-2">
                {/* For simplicity show image preview; PDF preview not embedded here */}
                <img src={previewUrl} alt="Receipt preview" className="max-h-64 object-contain" />
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={runOcr} disabled={!file || extracting}>{extracting ? 'Extracting...' : 'Extract with OCR'}</Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createExpenseMutation.isPending}>Cancel</Button>
            <Button onClick={() => createExpenseMutation.mutate()} disabled={!companyId || !amount || !date || createExpenseMutation.isPending}>
              {createExpenseMutation.isPending ? "Creating..." : "Create Expense"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


