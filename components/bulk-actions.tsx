"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Trash2, Tag, Building2, Download, Upload, Zap, MoreHorizontal } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface BulkActionsProps {
  selectedItems: string[]
  totalItems: number
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkAction: (action: string) => void
}

const bulkActions = [
  { id: "categorize", label: "Bulk Categorize", icon: Tag, description: "Apply category to selected items" },
  { id: "assign-client", label: "Assign Client", icon: Building2, description: "Assign client to transactions" },
  { id: "export", label: "Export Selected", icon: Download, description: "Export selected items to CSV" },
  { id: "duplicate", label: "Duplicate", icon: Upload, description: "Create copies of selected items" },
  { id: "delete", label: "Delete Selected", icon: Trash2, description: "Remove selected items", destructive: true },
]

export function BulkActions({
  selectedItems,
  totalItems,
  onSelectAll,
  onClearSelection,
  onBulkAction,
}: BulkActionsProps) {
  const [showActions, setShowActions] = useState(false)

  if (selectedItems.length === 0) {
    return null
  }

  return (
    <Card className="bg-cyan-50 border-cyan-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedItems.length === totalItems}
                onCheckedChange={(checked) => (checked ? onSelectAll() : onClearSelection())}
              />
              <span className="text-sm font-medium">
                {selectedItems.length} of {totalItems} selected
              </span>
            </div>
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
              <Zap className="w-3 h-3 mr-1" />
              Bulk Actions Available
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear Selection
            </Button>

            <Popover open={showActions} onOpenChange={setShowActions}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <CheckSquare className="w-4 h-4" />
                  Bulk Actions
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-2">
                  <div className="text-sm font-medium text-foreground mb-2 px-2">
                    Actions for {selectedItems.length} items
                  </div>
                  <div className="space-y-1">
                    {bulkActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          onBulkAction(action.id)
                          setShowActions(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                          action.destructive ? "hover:bg-red-50 hover:text-red-700" : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <action.icon className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
