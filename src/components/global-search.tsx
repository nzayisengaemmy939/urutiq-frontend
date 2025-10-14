import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Calculator,
  FileText,
  Users,
  CreditCard,
  TrendingUp,
  Lightbulb,
  Filter,
  DollarSign,
  Building2,
  X,
  ChevronDown,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { Badge } from "../components/ui/badge"
import { useKeyboardNavigation } from "./keyboard-navigation-provider"

const searchDatabase = [
  // Quick Actions
  {
    id: "expense",
    icon: Calculator,
    label: "Record expense",
    category: "Quick Actions",
    shortcut: "Ctrl+E",
    action: "expense",
    type: "action",
  },
  {
    id: "invoice",
    icon: FileText,
    label: "Create invoice",
    category: "Quick Actions",
    shortcut: "Ctrl+I",
    action: "invoice",
    type: "action",
  },
  {
    id: "client",
    icon: Users,
    label: "Add new client",
    category: "Quick Actions",
    shortcut: "Ctrl+N",
    action: "client",
    type: "action",
  },

  // Transactions
  {
    id: "tx1",
    icon: CreditCard,
    label: "Office supplies - $245.50",
    category: "Transactions",
    date: "2024-01-15",
    amount: 245.5,
    client: "Acme Corp",
    type: "transaction",
  },
  {
    id: "tx2",
    icon: DollarSign,
    label: "Consulting payment - $2,500.00",
    category: "Transactions",
    date: "2024-01-14",
    amount: 2500.0,
    client: "TechStart Inc",
    type: "transaction",
  },
  {
    id: "tx3",
    icon: CreditCard,
    label: "Software subscription - $99.00",
    category: "Transactions",
    date: "2024-01-13",
    amount: 99.0,
    client: "Local Bakery",
    type: "transaction",
  },

  // Clients
  { id: "client1", icon: Building2, label: "Acme Corp", category: "Clients", type: "client", status: "active" },
  { id: "client2", icon: Building2, label: "TechStart Inc", category: "Clients", type: "client", status: "active" },
  { id: "client3", icon: Building2, label: "Local Bakery", category: "Clients", type: "client", status: "pending" },

  // Reports
  { id: "report1", icon: TrendingUp, label: "Profit & Loss Report", category: "Reports", type: "report" },
  { id: "report2", icon: FileText, label: "Balance Sheet", category: "Reports", type: "report" },
  { id: "report3", icon: Calculator, label: "Tax Summary", category: "Reports", type: "report" },

  // AI Suggestions
  {
    id: "ai1",
    icon: Lightbulb,
    label: "AI insights for Acme Corp",
    category: "AI Suggestions",
    action: "insights",
    type: "ai",
  },
  {
    id: "ai2",
    icon: Lightbulb,
    label: "Duplicate expense detected",
    category: "AI Suggestions",
    action: "duplicate",
    type: "ai",
  },
]

interface SearchFilters {
  category: string[]
  dateRange: string
  amountRange: string
  client: string[]
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [query, setQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: SearchFilters }>>([])
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    category: [],
    dateRange: "",
    amountRange: "",
    client: [],
  })
  const [showFilters, setShowFilters] = useState(false)
  const { setFocusedElement } = useKeyboardNavigation()

  const searchResults = useMemo(() => {
    if (!query.trim()) return searchDatabase.slice(0, 10)

    const searchTerms = query.toLowerCase().split(" ")

    return searchDatabase
      .map((item) => {
        let score = 0
        const itemText = `${item.label} ${item.category}`.toLowerCase()

        // Exact match bonus
        if (itemText.includes(query.toLowerCase())) score += 10

        // Term matching
        searchTerms.forEach((term) => {
          if (itemText.includes(term)) score += 5
          // Fuzzy matching for typos
          if (itemText.includes(term.slice(0, -1)) && term.length > 3) score += 2
        })

        // Category filtering
        if (activeFilters.category.length > 0 && !activeFilters.category.includes(item.category)) {
          score = 0
        }

        // Client filtering
        if (activeFilters.client.length > 0 && item.client && !activeFilters.client.includes(item.client)) {
          score = 0
        }

        // Amount filtering
        if (activeFilters.amountRange && item.amount) {
          const [min, max] = activeFilters.amountRange.split("-").map(Number)
          if (item.amount < min || item.amount > max) score = 0
        }

        return { ...item, score }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
  }, [query, activeFilters])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSelect = (selectedValue: string, action?: string) => {
    setValue(selectedValue)
    setOpen(false)

    // Add to recent searches
    setRecentSearches((prev) => {
      const updated = [selectedValue, ...prev.filter((item) => item !== selectedValue)]
      return updated.slice(0, 5)
    })

    if (action) {
      console.log(`[v0] Executing action: ${action}`)
    }
  }

  const addFilter = (type: keyof SearchFilters, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: Array.isArray(prev[type]) ? [...(prev[type] as string[]), value] : value,
    }))
  }

  const removeFilter = (type: keyof SearchFilters, value?: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: Array.isArray(prev[type]) ? (prev[type] as string[]).filter((v) => v !== value) : "",
    }))
  }

  const clearAllFilters = () => {
    setActiveFilters({
      category: [],
      dateRange: "",
      amountRange: "",
      client: [],
    })
  }

  const saveCurrentFilters = () => {
    const name = `Filter ${savedFilters.length + 1}`
    setSavedFilters((prev) => [...prev, { name, filters: activeFilters }])
  }

  const hasActiveFilters = Object.values(activeFilters).some((filter) =>
    Array.isArray(filter) ? filter.length > 0 : filter !== "",
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Global search - Press Ctrl+K to open"
          data-search-input
          className="w-80 justify-start text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border relative"
          onFocus={() => setFocusedElement("global-search")}
          onBlur={() => setFocusedElement(null)}
        >
          <Search className="mr-2 h-4 w-4" />
          Search anything... (Ctrl+K)
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {Object.values(activeFilters).flat().filter(Boolean).length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b border-border">
            <CommandInput
              placeholder="Search transactions, clients, reports..."
              aria-label="Search input"
              className="flex-1 focus:ring-0 focus:border-transparent border-0"
              value={query}
              onValueChange={setQuery}
            />
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="mr-2 gap-1">
              <Filter className="w-4 h-4" />
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {showFilters && (
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Categories</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["Transactions", "Clients", "Reports", "Quick Actions"].map((cat) => (
                      <Button
                        key={cat}
                        variant={activeFilters.category.includes(cat) ? "default" : "outline"}
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() =>
                          activeFilters.category.includes(cat)
                            ? removeFilter("category", cat)
                            : addFilter("category", cat)
                        }
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Amount Range</label>
                  <div className="flex gap-1 mt-1">
                    {["0-100", "100-500", "500-1000", "1000+"].map((range) => (
                      <Button
                        key={range}
                        variant={activeFilters.amountRange === range ? "default" : "outline"}
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() =>
                          activeFilters.amountRange === range
                            ? removeFilter("amountRange")
                            : setActiveFilters((prev) => ({ ...prev, amountRange: range }))
                        }
                      >
                        ${range}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 text-xs bg-transparent"
                    >
                      Clear All
                    </Button>
                  )}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveCurrentFilters}
                      className="h-6 text-xs bg-transparent"
                    >
                      Save Filter
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="p-2 border-b border-border">
              <div className="flex flex-wrap gap-1">
                {activeFilters.category.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs gap-1">
                    {cat}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("category", cat)} />
                  </Badge>
                ))}
                {activeFilters.amountRange && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    ${activeFilters.amountRange}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("amountRange")} />
                  </Badge>
                )}
              </div>
            </div>
          )}

          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found for "{query}"
                <div className="mt-2 text-xs">Try adjusting your search terms or filters</div>
              </div>
            </CommandEmpty>

            {savedFilters.length > 0 && query === "" && (
              <CommandGroup heading="Saved Filters">
                {savedFilters.map((filter, index) => (
                  <CommandItem
                    key={`filter-${index}`}
                    onSelect={() => setActiveFilters(filter.filters)}
                    className="flex items-center justify-between focus:bg-muted focus:text-foreground"
                  >
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      {filter.name}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {recentSearches.length > 0 && query === "" && (
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((search, index) => (
                  <CommandItem
                    key={`recent-${index}`}
                    value={search}
                    onSelect={() => {
                      setQuery(search)
                      handleSelect(search)
                    }}
                    className="flex items-center justify-between focus:bg-muted focus:text-foreground"
                  >
                    <div className="flex items-center">
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                      {search}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {Object.entries(
              searchResults.reduce(
                (acc, item) => {
                  if (!acc[item.category]) acc[item.category] = []
                  acc[item.category].push(item)
                  return acc
                },
                {} as Record<string, typeof searchResults>,
              ),
            ).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(item.label, item.action)}
                    className="flex items-center justify-between focus:bg-muted focus:text-foreground cursor-pointer"
                    role="option"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <item.icon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {item.client && (
                        <Badge variant="outline" className="text-xs">
                          {item.client}
                        </Badge>
                      )}
                      {item.shortcut && (
                        <kbd className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                          {item.shortcut}
                        </kbd>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
