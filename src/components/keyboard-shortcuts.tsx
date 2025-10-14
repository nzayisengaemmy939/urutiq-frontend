import { useState } from "react"
import { Keyboard, X, Search, Plus, Calculator, FileText, BarChart3, Brain, Settings } from "lucide-react"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"

interface Shortcut {
  key: string
  description: string
  category: string
  icon: React.ComponentType<{ className?: string }>
}

const shortcuts: Shortcut[] = [
  // Navigation
  { key: "Ctrl + /", description: "Search sidebar menu", category: "Navigation", icon: Search },
  { key: "Ctrl + K", description: "Open global search", category: "Navigation", icon: Search },
  { key: "Ctrl + N", description: "Quick add transaction", category: "Navigation", icon: Plus },
  
  // Quick Actions
  { key: "Ctrl + E", description: "Record expense", category: "Quick Actions", icon: Calculator },
  { key: "Ctrl + I", description: "Create invoice", category: "Quick Actions", icon: FileText },
  { key: "Ctrl + R", description: "Generate report", category: "Quick Actions", icon: BarChart3 },
  
  // AI Features
  { key: "Ctrl + A", description: "Open AI insights", category: "AI Features", icon: Brain },
  
  // System
  { key: "Ctrl + ,", description: "Open settings", category: "System", icon: Settings },
  { key: "Escape", description: "Close modal/dialog", category: "System", icon: Settings },
]

const categories = ["Navigation", "Quick Actions", "AI Features", "System"]

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredShortcuts = selectedCategory === "all" 
    ? shortcuts 
    : shortcuts.filter(shortcut => shortcut.category === selectedCategory)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <Keyboard className="h-3 w-3 mr-1" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Shortcuts Grid */}
          <div className="grid gap-3">
            {filteredShortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <shortcut.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{shortcut.description}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {shortcut.category}
                    </Badge>
                  </div>
                </div>
                <kbd className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
            <h4 className="font-medium text-cyan-800 mb-2">💡 Tips</h4>
            <ul className="text-sm text-cyan-700 space-y-1">
              <li>• Use Ctrl + / to quickly search the sidebar menu</li>
              <li>• Press Ctrl + K to open global search from anywhere</li>
              <li>• Most shortcuts work from any page in the application</li>
              <li>• Hover over buttons to see tooltips with shortcuts</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
