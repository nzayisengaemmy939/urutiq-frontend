import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useMutation } from "@tanstack/react-query"
import { expenseApi } from "../lib/api/accounting"

type AttachReceiptModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseId: string | null
}

export function AttachReceiptModal({ open, onOpenChange, expenseId }: AttachReceiptModalProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  const onFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (f) setPreviewUrl(URL.createObjectURL(f))
  }

  const toDataUrl = (f: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(f)
  })

  const attachMutation = useMutation({
    mutationFn: async () => {
      if (!expenseId || !file) return
      const dataUrl = await toDataUrl(file)
      await expenseApi.updateExpense(expenseId, { receiptUrl: dataUrl } as any)
    },
    onSuccess: () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(null)
      setPreviewUrl(null)
      onOpenChange(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!attachMutation.isPending) onOpenChange(v) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Attach Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Receipt File</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={onFile} />
          </div>
          {previewUrl && (
            <div className="border rounded p-2">
              <img src={previewUrl} alt="Receipt preview" className="max-h-64 object-contain" />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={attachMutation.isPending}>Cancel</Button>
            <Button onClick={() => attachMutation.mutate()} disabled={!file || !expenseId || attachMutation.isPending}>{attachMutation.isPending ? 'Attaching...' : 'Attach'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


