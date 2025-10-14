import { useState, useRef } from "react"
import { Filter, X, Save } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

interface FilterSet {
  id: string
  name: string
  filters: {
    dateRange?: string
    amountMin?: number
    amountMax?: number
    categories?: string[]
    clients?: string[]
    status?: string[]
  }
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void
  activeFilters: any
}

export function AdvancedFilters({ onFiltersChange, activeFilters }: AdvancedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<FilterSet[]>([
    {
      id: "recent-expenses",
      name: "Recent Expenses",
      filters: { dateRange: "last-30-days", categories: ["Expenses"] },
    },
    {
      id: "high-value",
      name: "High Value Transactions",
      filters: { amountMin: 1000, categories: ["Transactions"] },
    },
  ])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newFilterName, setNewFilterName] = useState("")

  const categories = ["Transactions", "Clients", "Reports", "Invoices", "Expenses", "Banking"]
  const clients = ["Acme Corp", "TechStart Inc", "Local Bakery", "Global Solutions"]
  const statuses = ["Active", "Pending", "Completed", "Overdue"]

  const toggleFilter = (type: string, value: string) => {
    const currentValues = activeFilters[type] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value]

    onFiltersChange({ ...activeFilters, [type]: newValues })
  }

  const setAmountRange = (min?: number, max?: number) => {
    onFiltersChange({ ...activeFilters, amountMin: min, amountMax: max })
  }

  const idCounterRef = useRef(0)

  const saveCurrentFilter = () => {
    if (!newFilterName.trim()) return

    const newFilter: FilterSet = {
      id: `filter-${idCounterRef.current++}`,
      name: newFilterName,
      filters: activeFilters,
    }

    setSavedFilters((prev) => [...prev, newFilter])
    setNewFilterName("")
    setShowSaveDialog(false)
  }

  const loadFilter = (filterSet: FilterSet) => {
    onFiltersChange(filterSet.filters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(activeFilters).some((key) => {
    const value = activeFilters[key]
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ""
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Advanced Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
              {Object.values(activeFilters).flat().filter(Boolean).length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Advanced Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Saved Filters */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Saved Filters</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {savedFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs bg-transparent"
                  onClick={() => loadFilter(filter)}
                >
                  {filter.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Categories</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeFilters.categories?.includes(category) ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => toggleFilter("categories", category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Clients */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Clients</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {clients.map((client) => (
                <Button
                  key={client}
                  variant={activeFilters.clients?.includes(client) ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => toggleFilter("clients", client)}
                >
                  {client}
                </Button>
              ))}
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Amount Range</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                placeholder="Min"
                className="h-8 text-xs"
                value={activeFilters.amountMin || ""}
                onChange={(e) => setAmountRange(Number(e.target.value) || undefined, activeFilters.amountMax)}
              />
              <Input
                type="number"
                placeholder="Max"
                className="h-8 text-xs"
                value={activeFilters.amountMax || ""}
                onChange={(e) => setAmountRange(activeFilters.amountMin, Number(e.target.value) || undefined)}
              />
            </div>
            <div className="flex gap-1 mt-1">
              {[
                { label: "$0-100", min: 0, max: 100 },
                { label: "$100-500", min: 100, max: 500 },
                { label: "$500-1K", min: 500, max: 1000 },
                { label: "$1K+", min: 1000, max: undefined },
              ].map((range) => (
                <Button
                  key={range.label}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs bg-transparent"
                  onClick={() => setAmountRange(range.min, range.max)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Date Range</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {[
                { label: "Today", value: "today" },
                { label: "Last 7 days", value: "last-7-days" },
                { label: "Last 30 days", value: "last-30-days" },
                { label: "This month", value: "this-month" },
                { label: "Last month", value: "last-month" },
              ].map((range) => (
                <Button
                  key={range.value}
                  variant={activeFilters.dateRange === range.value ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onFiltersChange({ ...activeFilters, dateRange: range.value })}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Save Filter */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-border">
              {showSaveDialog ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Filter name"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button size="sm" onClick={saveCurrentFilter} className="h-8">
                    <Save className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)} className="h-8">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)} className="w-full">
                  Save Current Filter
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
