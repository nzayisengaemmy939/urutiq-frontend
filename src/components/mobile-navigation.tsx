import { useState } from "react"
import { Menu, X, Home, ShoppingCart, Receipt, Banknote, BarChart3, Brain, Settings, Package } from "lucide-react"
import { Button } from "../components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import { cn } from "../lib/utils"

const navigationItems = [
  { name: "Dashboard", icon: Home, href: "/", current: true },
  { name: "Sales & Invoicing", icon: ShoppingCart, href: "/sales" },
  { name: "Purchases & Expenses", icon: Receipt, href: "/purchases" },
  { name: "Banking & Cash", icon: Banknote, href: "/banking" },
  { name: "Inventory & Products", icon: Package, href: "/inventory" },
  { name: "Reports & Analytics", icon: BarChart3, href: "/reports" },
  { name: "AI Insights", icon: Brain, href: "/ai-insights" },
  { name: "Settings", icon: Settings, href: "/settings" },
]

export function MobileNavigation() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">U</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">UrutiIQ</h2>
                  <p className="text-xs text-muted-foreground">AI Accounting</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors",
                    item.current
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </a>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-border">
            <div className="bg-card p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">JD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">John Doe</p>
                  <p className="text-xs text-muted-foreground truncate">Senior Accountant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
