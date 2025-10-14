"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Smartphone, 
  Monitor, 
  Tablet,
  Wifi,
  Signal,
  Battery,
  Clock,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User
} from "lucide-react"
import { MobileBankingInterface } from './mobile-banking-interface'
import { BankingDashboard } from './banking-dashboard'
import { AICategorization } from './ai-categorization'
import { MultiCurrencyConverter } from './multi-currency-converter'
import { PaymentProcessorManager } from './payment-processor-manager'
import { AdvancedAnalytics } from './advanced-analytics'
import { BankConnectionManager } from './bank-connection-manager'
import { MobileMoneyManager } from './mobile-money-manager'

interface ResponsiveBankingLayoutProps {
  companyId?: string
}

export function ResponsiveBankingLayout({ companyId }: ResponsiveBankingLayoutProps) {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [signalStrength, setSignalStrength] = useState(4)
  const [manualViewOverride, setManualViewOverride] = useState<'mobile' | 'tablet' | 'desktop' | null>(null)

  useEffect(() => {
    const checkDeviceType = () => {
      if (manualViewOverride) {
        setDeviceType(manualViewOverride)
        return
      }
      
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)

    // Simulate battery and signal updates
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(20, prev + (Math.random() - 0.5) * 2))
      setSignalStrength(prev => Math.max(1, Math.min(5, prev + (Math.random() - 0.5) * 0.5)))
    }, 5000)

    return () => {
      window.removeEventListener('resize', checkDeviceType)
      clearInterval(interval)
    }
  }, [manualViewOverride])

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />
      case 'tablet': return <Tablet className="w-5 h-5" />
      case 'desktop': return <Monitor className="w-5 h-5" />
    }
  }

  const getSignalIcon = () => {
    const bars = Math.floor(signalStrength)
    return (
      <div className="flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-1 h-${i < bars ? '3' : '1'} bg-green-500 rounded-sm`}
          />
        ))}
      </div>
    )
  }

  const getBatteryIcon = () => {
    const level = Math.floor(batteryLevel / 20)
    return (
      <div className="flex items-center gap-1">
        <div className="w-6 h-3 border border-gray-400 rounded-sm relative">
          <div
            className="bg-green-500 h-full rounded-sm"
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
        <div className="w-1 h-2 bg-gray-400 rounded-r-sm"></div>
      </div>
    )
  }

  const mobileTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'ai', label: 'AI', icon: '🤖' },
    { id: 'currency', label: 'Currency', icon: '💱' },
    { id: 'payments', label: 'Payments', icon: '💸' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'connections', label: 'Banks', icon: '🏦' },
    { id: 'mobile-money', label: 'Mobile Money', icon: '📱' }
  ]

  const renderMobileInterface = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Status Bar */}
      <div className="bg-black text-white text-xs px-4 py-1 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium">9:41</span>
        </div>
        <div className="flex items-center gap-2">
          {getSignalIcon()}
          <Wifi className="w-3 h-3" />
          {getBatteryIcon()}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <h1 className="text-lg font-semibold">Banking</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setManualViewOverride(manualViewOverride === 'desktop' ? null : 'desktop')}
            title="Switch to Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-3">
            {mobileTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className="flex items-center gap-2 justify-start"
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsMobileMenuOpen(false)
                }}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Content */}
      <div className="pb-20">
        {activeTab === 'dashboard' && <MobileBankingInterface />}
        {activeTab === 'transactions' && (
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Transaction list will be displayed here</p>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'ai' && (
          <div className="p-4">
            <AICategorization companyId={companyId} />
          </div>
        )}
        {activeTab === 'currency' && (
          <div className="p-4">
            <MultiCurrencyConverter />
          </div>
        )}
        {activeTab === 'payments' && (
          <div className="p-4">
            <PaymentProcessorManager />
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="p-4">
            <AdvancedAnalytics />
          </div>
        )}
        {activeTab === 'connections' && (
          <div className="p-4">
            <BankConnectionManager />
          </div>
        )}
        {activeTab === 'mobile-money' && (
          <div className="p-4">
            <MobileMoneyManager />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {mobileTabs.slice(0, 5).map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTabletInterface = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Tablet Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tablet className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Banking Dashboard</h1>
            <Badge variant="secondary">Tablet View</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button 
                variant={deviceType === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'mobile' ? null : 'mobile')}
              >
                <Smartphone className="w-3 h-3" />
              </Button>
              <Button 
                variant={deviceType === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'tablet' ? null : 'tablet')}
              >
                <Tablet className="w-3 h-3" />
              </Button>
              <Button 
                variant={deviceType === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'desktop' ? null : 'desktop')}
              >
                <Monitor className="w-3 h-3" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Tablet Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ai">AI Features</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="mobile-money">Mobile Money</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <BankingDashboard companyId={companyId} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AICategorization companyId={companyId} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <BankConnectionManager />
          </TabsContent>

          <TabsContent value="mobile-money" className="space-y-6">
            <MobileMoneyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  const renderDesktopInterface = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Monitor className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-semibold">Banking Management</h1>
            <Badge variant="secondary">Desktop View</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={deviceType === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'mobile' ? null : 'mobile')}
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Mobile
              </Button>
              <Button 
                variant={deviceType === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'tablet' ? null : 'tablet')}
              >
                <Tablet className="w-4 h-4 mr-1" />
                Tablet
              </Button>
              <Button 
                variant={deviceType === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setManualViewOverride(manualViewOverride === 'desktop' ? null : 'desktop')}
              >
                <Monitor className="w-4 h-4 mr-1" />
                Desktop
              </Button>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="ai">AI Categorization</TabsTrigger>
            <TabsTrigger value="currency">Multi-Currency</TabsTrigger>
            <TabsTrigger value="payments">Payment Processors</TabsTrigger>
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="connections">Bank Connections</TabsTrigger>
            <TabsTrigger value="mobile-money">Mobile Money</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <BankingDashboard companyId={companyId} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Transaction management interface</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AICategorization companyId={companyId} />
          </TabsContent>

          <TabsContent value="currency" className="space-y-6">
            <MultiCurrencyConverter />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentProcessorManager />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <BankConnectionManager />
          </TabsContent>

          <TabsContent value="mobile-money" className="space-y-6">
            <MobileMoneyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  // Device-specific rendering
  switch (deviceType) {
    case 'mobile':
      return renderMobileInterface()
    case 'tablet':
      return renderTabletInterface()
    case 'desktop':
      return renderDesktopInterface()
    default:
      return renderDesktopInterface()
  }
}
