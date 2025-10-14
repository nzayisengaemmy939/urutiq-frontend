import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageLayout } from "@/components/page-layout"
import { Plus, Users, Building2, Shield, Settings as SettingsIcon, Edit, Trash2, Crown, UserCheck } from "lucide-react"
import React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useDemoAuth } from '@/hooks/useDemoAuth'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { apiService } from '@/lib/api'
import { CompanyManagement } from '@/components/company-management'
import { OrganizationManagement } from '@/components/organization-management'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState('users')

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['users', 'company', 'organizations', 'roles', 'security']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <PageLayout>
      <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">User & Organization Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and organization settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <SettingsIcon className="w-4 h-4 mr-2" />
            System Settings
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Organization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold">22</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admin Users</p>
                <p className="text-xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Navigation */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <nav className="flex space-x-8" aria-label="Settings navigation">
          <button
            onClick={() => scrollToSection('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            aria-current={activeSection === 'users' ? 'page' : undefined}
          >
            Users
          </button>
          <button
            onClick={() => scrollToSection('company')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'company'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            aria-current={activeSection === 'company' ? 'page' : undefined}
          >
            Company Settings
          </button>
          <button
            onClick={() => scrollToSection('organizations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'organizations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            aria-current={activeSection === 'organizations' ? 'page' : undefined}
          >
            Organizations
          </button>
          <button
            onClick={() => scrollToSection('roles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            aria-current={activeSection === 'roles' ? 'page' : undefined}
          >
            Roles & Permissions
          </button>
          <button
            onClick={() => scrollToSection('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            aria-current={activeSection === 'security' ? 'page' : undefined}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="space-y-6">

        <section id="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "John Smith",
                    email: "john.smith@company.com",
                    role: "Owner",
                    organization: "Acme Corp",
                    status: "active",
                    lastActive: "2 hours ago",
                    avatar: "/placeholder.svg?height=40&width=40",
                  },
                  {
                    name: "Sarah Johnson",
                    email: "sarah.j@company.com",
                    role: "Admin",
                    organization: "Acme Corp",
                    status: "active",
                    lastActive: "1 day ago",
                    avatar: "/placeholder.svg?height=40&width=40",
                  },
                  {
                    name: "Mike Davis",
                    email: "mike.davis@company.com",
                    role: "Accountant",
                    organization: "Tech Solutions",
                    status: "active",
                    lastActive: "3 hours ago",
                    avatar: "/placeholder.svg?height=40&width=40",
                  },
                  {
                    name: "Emily Chen",
                    email: "emily.chen@company.com",
                    role: "Bookkeeper",
                    organization: "Acme Corp",
                    status: "inactive",
                    lastActive: "1 week ago",
                    avatar: "/placeholder.svg?height=40&width=40",
                  },
                ].map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {user.role === "Owner" && <Crown className="w-4 h-4 text-amber-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.organization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge
                          variant={user.role === "Owner" ? "default" : user.role === "Admin" ? "secondary" : "outline"}
                        >
                          {user.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">Last active: {user.lastActive}</p>
                      </div>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.role !== "Owner" && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="company" className="space-y-4">
          <CompanyManagement />
        </section>

        <section id="organizations" className="space-y-4">
          <OrganizationManagement />
        </section>

        <section id="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Roles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Roles</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Custom Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Owner",
                      description: "Full system access and control",
                      users: 1,
                      permissions: ["All Permissions"],
                    },
                    {
                      name: "Admin",
                      description: "Administrative access to most features",
                      users: 3,
                      permissions: ["User Management", "Financial Data", "Reports"],
                    },
                    {
                      name: "Accountant",
                      description: "Full accounting and financial access",
                      users: 8,
                      permissions: ["Financial Data", "Reports", "Transactions"],
                    },
                    {
                      name: "Bookkeeper",
                      description: "Basic transaction and data entry",
                      users: 12,
                      permissions: ["Data Entry", "Basic Reports"],
                    },
                  ].map((role, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{role.name}</h3>
                          {role.name === "Owner" && <Crown className="w-4 h-4 text-amber-500" />}
                        </div>
                        <Badge variant="outline">{role.users} users</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission, pIndex) => (
                          <Badge key={pIndex} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Permission Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">Financial Data Access</h3>
                    {[
                      { name: "View Financial Reports", enabled: true },
                      { name: "Edit Transactions", enabled: true },
                      { name: "Delete Transactions", enabled: false },
                      { name: "Export Data", enabled: true },
                    ].map((permission, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{permission.name}</span>
                        <Switch checked={permission.enabled} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-medium">User Management</h3>
                    {[
                      { name: "Invite Users", enabled: true },
                      { name: "Edit User Roles", enabled: false },
                      { name: "Delete Users", enabled: false },
                    ].map((permission, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{permission.name}</span>
                        <Switch checked={permission.enabled} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-medium">System Settings</h3>
                    {[
                      { name: "Modify Organization Settings", enabled: false },
                      { name: "Manage Integrations", enabled: true },
                      { name: "Access AI Settings", enabled: true },
                    ].map((permission, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{permission.name}</span>
                        <Switch checked={permission.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">Authentication</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Two-Factor Authentication</span>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Single Sign-On (SSO)</span>
                      <Switch checked={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Password Requirements</span>
                      <Switch checked={true} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-medium">Session Management</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-logout after inactivity</span>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Concurrent Sessions</span>
                      <Select defaultValue="3">
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="unlimited">∞</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Log */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      event: "User login",
                      user: "john.smith@company.com",
                      time: "2 hours ago",
                      status: "success",
                    },
                    {
                      event: "Password changed",
                      user: "sarah.j@company.com",
                      time: "1 day ago",
                      status: "success",
                    },
                    {
                      event: "Failed login attempt",
                      user: "unknown@email.com",
                      time: "2 days ago",
                      status: "failed",
                    },
                    {
                      event: "2FA enabled",
                      user: "mike.davis@company.com",
                      time: "3 days ago",
                      status: "success",
                    },
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{log.event}</p>
                        <p className="text-xs text-muted-foreground">{log.user}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  View Full Audit Log
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      </div>
    </PageLayout>
  )
}

function CompanySettingsForm() {
  const { ready: authReady } = useDemoAuth('settings-page')
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await apiService.getCompanies()
      return res.data
    },
    enabled: authReady
  })

  const [companyId, setCompanyId] = React.useState('')
  const [pctLocal, setPctLocal] = React.useState('2')
  const [absLocal, setAbsLocal] = React.useState('5')
  const [pctImport, setPctImport] = React.useState('2')
  const [absImport, setAbsImport] = React.useState('5')

  const { data: settings } = useQuery({
    queryKey: ['company-settings', companyId],
    queryFn: async () => {
      if (!companyId) return null
      const res = await fetch(`/api/internal/company-settings?companyId=${companyId}`)
      if (!res.ok) throw new Error('Failed to load settings')
      return res.json()
    },
    enabled: !!companyId
  })

  React.useEffect(() => {
    if (settings?.items) {
      const pL = settings.items.find((s: any) => s.key === 'three_way_tolerance_pct_local')?.value
      const aL = settings.items.find((s: any) => s.key === 'three_way_tolerance_abs_local')?.value
      const pI = settings.items.find((s: any) => s.key === 'three_way_tolerance_pct_import')?.value
      const aI = settings.items.find((s: any) => s.key === 'three_way_tolerance_abs_import')?.value
      if (pL !== undefined) setPctLocal(String(pL))
      if (aL !== undefined) setAbsLocal(String(aL))
      if (pI !== undefined) setPctImport(String(pI))
      if (aI !== undefined) setAbsImport(String(aI))
    }
  }, [settings])

  const save = useMutation({
    mutationFn: async () => {
      if (!companyId) return
      const headers = { 'Content-Type': 'application/json' }
      await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId, key: 'three_way_tolerance_pct_local', value: pctLocal }) })
      await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId, key: 'three_way_tolerance_abs_local', value: absLocal }) })
      await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId, key: 'three_way_tolerance_pct_import', value: pctImport }) })
      await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId, key: 'three_way_tolerance_abs_import', value: absImport }) })
    },
    onSuccess: () => {
      toast.success('Company settings saved successfully')
    },
    onError: (error) => {
      toast.error('Failed to save company settings')
      console.error('Save error:', error)
    }
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <div className="text-sm text-muted-foreground mb-1">Company</div>
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select company" /></SelectTrigger>
            <SelectContent>
              {(companies?.data || companies?.items || []).map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1">
          <div className="text-sm font-medium mb-1">Local % tolerance</div>
          <Input type="number" step="0.1" value={pctLocal} onChange={(e) => setPctLocal(e.target.value)} />
        </div>
        <div className="col-span-1">
          <div className="text-sm font-medium mb-1">Local $ tolerance</div>
          <Input type="number" step="0.01" value={absLocal} onChange={(e) => setAbsLocal(e.target.value)} />
        </div>
        <div className="col-span-1">
          <div className="text-sm font-medium mb-1">Import % tolerance</div>
          <Input type="number" step="0.1" value={pctImport} onChange={(e) => setPctImport(e.target.value)} />
        </div>
        <div className="col-span-1 col-start-2">
          <div className="text-sm font-medium mb-1">Import $ tolerance</div>
          <Input type="number" step="0.01" value={absImport} onChange={(e) => setAbsImport(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          disabled={!companyId || save.isPending} 
          onClick={() => save.mutate()}
        >
          {save.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Load jurisdictions, config, nexus */}
          <TaxSettings companyId={companyId} />
        </CardContent>
      </Card>
    </div>
  )
}

function TaxSettings({ companyId }: { companyId: string }) {
  const [taxInclusive, setTaxInclusive] = React.useState(false)
  const [rounding, setRounding] = React.useState<'round' | 'floor' | 'ceil'>('round')
  const [defaultJurisdiction, setDefaultJurisdiction] = React.useState('')
  const [nexus, setNexus] = React.useState<string[]>([])

  const jurisdictionsQuery = useQuery({
    queryKey: ['tax-jurisdictions', companyId],
    queryFn: async () => {
      if (!companyId) return []
      const res = await fetch('/api/tax/jurisdictions')
      if (!res.ok) throw new Error('Failed to load jurisdictions')
      return res.json()
    },
    enabled: !!companyId,
    onError: (error) => {
      toast.error('Failed to load tax jurisdictions')
      console.error('Jurisdictions error:', error)
    }
  })

  const configQuery = useQuery({
    queryKey: ['tax-config', companyId],
    queryFn: async () => {
      if (!companyId) return null
      const res = await fetch(`/api/tax/config?companyId=${companyId}`)
      if (!res.ok) throw new Error('Failed to load tax config')
      return res.json()
    },
    enabled: !!companyId,
    onError: (error) => {
      toast.error('Failed to load tax configuration')
      console.error('Config error:', error)
    }
  })

  const nexusQuery = useQuery({
    queryKey: ['tax-nexus', companyId],
    queryFn: async () => {
      if (!companyId) return []
      const res = await fetch(`/api/tax/nexus?companyId=${companyId}`)
      if (!res.ok) throw new Error('Failed to load tax nexus')
      return res.json()
    },
    enabled: !!companyId,
    onError: (error) => {
      toast.error('Failed to load tax nexus')
      console.error('Nexus error:', error)
    }
  })

  React.useEffect(() => {
    const data = configQuery.data
    if (data) {
      if (typeof data.taxInclusive === 'boolean') setTaxInclusive(data.taxInclusive)
      if (data.roundingMethod) setRounding(data.roundingMethod)
      if (data.defaultJurisdictionId) setDefaultJurisdiction(data.defaultJurisdictionId)
    }
  }, [configQuery.data])

  React.useEffect(() => {
    const nx = nexusQuery.data
    if (Array.isArray(nx)) {
      setNexus(nx.map((n: any) => n.jurisdictionId || n))
    }
  }, [nexusQuery.data])

  const saveTax = useMutation({
    mutationFn: async () => {
      if (!companyId) return
      const headers = { 'Content-Type': 'application/json' }
      await fetch(`/api/tax/config?companyId=${companyId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ taxInclusive, roundingMethod: rounding, defaultJurisdictionId: defaultJurisdiction })
      })
      await fetch(`/api/tax/nexus?companyId=${companyId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jurisdictions: nexus })
      })
    },
    onSuccess: () => {
      toast.success('Tax settings saved successfully')
    },
    onError: (error) => {
      toast.error('Failed to save tax settings')
      console.error('Tax save error:', error)
    }
  })

  const jurisdictions = jurisdictionsQuery.data || []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tax Inclusive Toggle */}
        <div className="col-span-1 flex items-center justify-between border rounded-lg p-3">
          <div>
            <div className="text-sm font-medium">Prices include tax</div>
            <div className="text-xs text-muted-foreground">Inclusive vs exclusive taxation</div>
          </div>
          <Switch checked={taxInclusive} onCheckedChange={setTaxInclusive} disabled={!companyId} />
        </div>

        {/* Rounding Method */}
        <div className="col-span-1">
          <div className="text-sm font-medium mb-1">Rounding Method</div>
          <Select value={rounding} onValueChange={(v) => setRounding(v as any)} disabled={!companyId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round">Round (nearest)</SelectItem>
              <SelectItem value="floor">Floor</SelectItem>
              <SelectItem value="ceil">Ceil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Default Jurisdiction */}
        <div className="col-span-2">
          <div className="text-sm font-medium mb-1">Default Jurisdiction</div>
          <Select value={defaultJurisdiction} onValueChange={setDefaultJurisdiction} disabled={!companyId || jurisdictionsQuery.isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={jurisdictionsQuery.isLoading ? "Loading..." : "Select jurisdiction"} />
            </SelectTrigger>
            <SelectContent>
              {jurisdictions.map((j: any) => (
                <SelectItem key={j.id} value={j.id}>{j.name} ({j.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Nexus multi-select (checkbox list) */}
      <div>
        <div className="text-sm font-medium mb-2">Nexus Jurisdictions</div>
        {jurisdictionsQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading jurisdictions...</div>
        ) : jurisdictionsQuery.isError ? (
          <div className="text-sm text-red-500">Failed to load jurisdictions</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-48 overflow-auto p-2 border rounded-lg">
            {jurisdictions.map((j: any) => {
              const checked = nexus.includes(j.id)
              return (
                <label key={j.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    disabled={!companyId}
                    onChange={(e) => {
                      const isChecked = e.target.checked
                      setNexus((prev) => {
                        if (isChecked) return Array.from(new Set([...prev, j.id]))
                        return prev.filter((x) => x !== j.id)
                      })
                    }}
                  />
                  <span>{j.name} ({j.code})</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          variant="outline" 
          disabled={!companyId || saveTax.isPending} 
          onClick={() => saveTax.mutate()}
        >
          {saveTax.isPending ? 'Saving...' : 'Save Tax Settings'}
        </Button>
      </div>
    </div>
  )
}
