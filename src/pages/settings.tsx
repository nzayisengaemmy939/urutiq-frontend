import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Switch } from "../components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { PageLayout } from "../components/page-layout"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog"
import { Plus, Users, Building2, Shield, Settings as SettingsIcon, Edit, Trash2, Crown, UserCheck, Activity } from "lucide-react"
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDemoAuth } from '@/hooks/useDemoAuth'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { apiService } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { securityApi } from '@/lib/api/security'

export default function SettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  // Modal and action states
  const [showAddUserModal, setShowAddUserModal] = React.useState(false)
  const [showEditUserModal, setShowEditUserModal] = React.useState(false)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = React.useState(false)
  const [showAddOrgModal, setShowAddOrgModal] = React.useState(false)
  const [showEditOrgModal, setShowEditOrgModal] = React.useState(false)
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = React.useState(false)
  const [showAuditLogModal, setShowAuditLogModal] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [selectedOrg, setSelectedOrg] = React.useState<any>(null)
  
  // Form states
  const [userForm, setUserForm] = React.useState({
    name: '',
    email: '',
    role: 'employee',
    password: ''
  })
  const [orgForm, setOrgForm] = React.useState({
    name: '',
    industry: '',
    country: '',
    currency: 'USD',
    taxId: '',
    fiscalYearStart: '01-01'
  })
  
  // Fetch real data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers(),
    enabled: !!user
  })

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiService.getCompanies(),
    enabled: !!user
  })

  const { data: auditLogsData, isLoading: auditLogsLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => securityApi.getAuditLogs(1, 10),
    enabled: !!user
  })

  // Mutations for user management
  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiService.createUser(userData)
    },
    onSuccess: () => {
      toast.success('User added successfully')
      setShowAddUserModal(false)
      setUserForm({ name: '', email: '', role: 'employee', password: '' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to add user'
      toast.error(message)
    }
  })

  const editUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string, userData: any }) => {
      return await apiService.updateUser(userId, userData)
    },
    onSuccess: () => {
      toast.success('User updated successfully')
      setShowEditUserModal(false)
      setSelectedUser(null)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update user'
      toast.error(message)
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiService.deleteUser(userId)
    },
    onSuccess: () => {
      toast.success('User deleted successfully')
      setShowDeleteUserDialog(false)
      setSelectedUser(null)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete user'
      toast.error(message)
    }
  })

  // Mutations for organization management
  const addOrgMutation = useMutation({
    mutationFn: async (orgData: any) => {
      return await apiService.createCompany(orgData)
    },
    onSuccess: () => {
      toast.success('Organization added successfully')
      setShowAddOrgModal(false)
      setOrgForm({ name: '', industry: '', country: '', currency: 'USD', taxId: '', fiscalYearStart: '01-01' })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to add organization'
      toast.error(message)
    }
  })

  const editOrgMutation = useMutation({
    mutationFn: async ({ orgId, orgData }: { orgId: string, orgData: any }) => {
      return await apiService.updateCompany(orgId, orgData)
    },
    onSuccess: () => {
      toast.success('Organization updated successfully')
      setShowEditOrgModal(false)
      setSelectedOrg(null)
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update organization'
      toast.error(message)
    }
  })

  const deleteOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      return await apiService.deleteCompany(orgId)
    },
    onSuccess: () => {
      toast.success('Organization deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete organization'
      toast.error(message)
    }
  })

  // Calculate real metrics
  const totalUsers = usersData?.totalCount || 0
  const activeUsers = usersData?.users?.filter((u: any) => u.lastActiveAt && new Date(u.lastActiveAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0
  const totalCompanies = companiesData?.data?.length || 0
  const adminUsers = usersData?.users?.filter((u: any) => u.role === 'admin' || u.role === 'owner').length || 0

  // Handler functions
  const handleAddUser = () => {
    setUserForm({ name: '', email: '', role: 'employee', password: '' })
    setShowAddUserModal(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'employee',
      password: ''
    })
    setShowEditUserModal(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setShowDeleteUserDialog(true)
  }

  const handleAddOrg = () => {
    setOrgForm({ name: '', industry: '', country: '', currency: 'USD', taxId: '', fiscalYearStart: '01-01' })
    setShowAddOrgModal(true)
  }

  const handleEditOrg = (org: any) => {
    setSelectedOrg(org)
    setOrgForm({
      name: org.name || '',
      industry: org.industry || '',
      country: org.country || '',
      currency: org.currency || 'USD',
      taxId: org.taxId || '',
      fiscalYearStart: org.fiscalYearStart || '01-01'
    })
    setShowEditOrgModal(true)
  }

  const handleViewAuditLog = () => {
    setShowAuditLogModal(true)
  }

  const handleSubmitUser = () => {
    if (showAddUserModal) {
      addUserMutation.mutate(userForm)
    } else if (showEditUserModal && selectedUser) {
      editUserMutation.mutate({ userId: selectedUser.id, userData: userForm })
    }
  }

  const handleSubmitOrg = () => {
    if (showAddOrgModal) {
      addOrgMutation.mutate(orgForm)
    } else if (showEditOrgModal && selectedOrg) {
      editOrgMutation.mutate({ orgId: selectedOrg.id, orgData: orgForm })
    }
  }

  const handleConfirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id)
    }
  }

  const handleDeleteOrg = (org: any) => {
    setSelectedOrg(org)
    setShowDeleteOrgDialog(true)
  }

  const handleConfirmDeleteOrg = () => {
    if (selectedOrg) {
      deleteOrgMutation.mutate(selectedOrg.id)
      setShowDeleteOrgDialog(false)
      setSelectedOrg(null)
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
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
          <Button onClick={handleAddUser}>
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
                <p className="text-xl font-bold">{usersLoading ? '...' : totalUsers}</p>
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
                <p className="text-xl font-bold">{usersLoading ? '...' : activeUsers}</p>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
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
                <p className="text-xl font-bold">{companiesLoading ? '...' : totalCompanies}</p>
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
                <p className="text-xl font-bold">{usersLoading ? '...' : adminUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="company">Company Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
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
                  <Button onClick={handleAddUser}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading users...</p>
                    </div>
                  </div>
                ) : usersData?.users?.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No users found</p>
                    </div>
                  </div>
                ) : (
                  usersData?.users?.map((user: any, index: number) => {
                    const isActive = user.lastActiveAt && new Date(user.lastActiveAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    const lastActiveText = user.lastActiveAt 
                      ? new Date(user.lastActiveAt).toLocaleDateString() === new Date().toLocaleDateString()
                        ? 'Today'
                        : new Date(user.lastActiveAt).toLocaleDateString() === new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString()
                        ? 'Yesterday'
                        : `${Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / (24 * 60 * 60 * 1000))} days ago`
                      : 'Never'
                    
                    return (
                      <div
                        key={user.id || index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || user.email} />
                            <AvatarFallback>
                              {(user.name || user.email)
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.name || user.email}</p>
                              {(user.role === "owner" || user.role === "Owner") && <Crown className="w-4 h-4 text-amber-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.mfaEnabled ? '🔐 MFA Enabled' : '🔓 MFA Disabled'} • 
                              Created {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge
                              variant={
                                user.role === "owner" || user.role === "Owner" ? "default" : 
                                user.role === "admin" || user.role === "Admin" ? "secondary" : 
                                "outline"
                              }
                            >
                              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last active: {lastActiveText}
                            </p>
                          </div>
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {(user.role !== "owner" && user.role !== "Owner") && (
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Company Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CompanySettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Organizations</CardTitle>
                <Button onClick={handleAddOrg}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Organization
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companiesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading organizations...</p>
                    </div>
                  </div>
                ) : companiesData?.data?.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No organizations found</p>
                    </div>
                  </div>
                ) : (
                  companiesData?.data?.map((company: any, index: number) => (
                    <div
                      key={company.id || index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {company.industry || 'Business'} • 
                            {company.country || 'Unknown Country'} • 
                            Created {new Date(company.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {company._count?.transactions || 0} transactions • 
                            {company._count?.customers || 0} customers • 
                            {company._count?.vendors || 0} vendors
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="default">
                          {company.currency || 'USD'}
                        </Badge>
                        <Badge variant="secondary">
                          {company.taxId ? 'Tax Registered' : 'No Tax ID'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditOrg(company)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteOrg(company)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <SettingsIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
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
                  {usersLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center">
                        <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading roles...</p>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      // Calculate role statistics from real user data
                      const roleStats = usersData?.users?.reduce((acc: any, user: any) => {
                        const role = user.role || 'employee'
                        if (!acc[role]) {
                          acc[role] = { count: 0, users: [] }
                        }
                        acc[role].count++
                        acc[role].users.push(user)
                        return acc
                      }, {}) || {}

                      const roleDefinitions = {
                        owner: {
                          name: "Owner",
                          description: "Full system access and control",
                          permissions: ["All Permissions", "System Administration", "User Management"]
                        },
                        admin: {
                          name: "Admin", 
                          description: "Administrative access to most features",
                          permissions: ["User Management", "Financial Data", "Reports", "Settings"]
                        },
                        employee: {
                          name: "Employee",
                          description: "Standard user access",
                          permissions: ["View Data", "Basic Reports", "Profile Management"]
                        }
                      }

                      return Object.entries(roleStats).map(([roleKey, stats]: [string, any]) => {
                        const roleDef = roleDefinitions[roleKey as keyof typeof roleDefinitions] || {
                          name: roleKey.charAt(0).toUpperCase() + roleKey.slice(1),
                          description: "Custom role with specific permissions",
                          permissions: ["Custom Permissions"]
                        }

                        return (
                          <div key={roleKey} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{roleDef.name}</h3>
                                {roleKey === "owner" && <Crown className="w-4 h-4 text-amber-500" />}
                              </div>
                              <Badge variant="outline">{stats.count} users</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{roleDef.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {roleDef.permissions.map((permission: string, pIndex: number) => (
                                <Badge key={pIndex} variant="secondary" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    })()
                  )}
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
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
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
                  {auditLogsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="text-center">
                        <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading security events...</p>
                      </div>
                    </div>
                  ) : auditLogsData?.data?.length === 0 ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="text-center">
                        <Shield className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No security events found</p>
                      </div>
                    </div>
                  ) : (
                    auditLogsData?.data?.map((log: any, index: number) => {
                      const getEventDisplayName = (action: string) => {
                        switch (action) {
                          case 'LOGIN_SUCCESS': return 'User login'
                          case 'LOGIN_FAILED': return 'Failed login attempt'
                          case 'PASSWORD_CHANGED': return 'Password changed'
                          case 'MFA_ENABLED': return '2FA enabled'
                          case 'MFA_DISABLED': return '2FA disabled'
                          case 'TOKEN_REFRESH': return 'Session refreshed'
                          case 'USER_CREATED': return 'User created'
                          case 'USER_UPDATED': return 'User updated'
                          case 'SECURITY_ALERT': return 'Security alert'
                          default: return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                        }
                      }

                      const getStatusFromAction = (action: string) => {
                        switch (action) {
                          case 'LOGIN_SUCCESS':
                          case 'PASSWORD_CHANGED':
                          case 'MFA_ENABLED':
                          case 'TOKEN_REFRESH':
                          case 'USER_CREATED':
                          case 'USER_UPDATED':
                            return 'success'
                          case 'LOGIN_FAILED':
                          case 'SECURITY_ALERT':
                            return 'failed'
                          default:
                            return 'info'
                        }
                      }

                      const getTimeAgo = (timestamp: string) => {
                        const now = new Date()
                        const logTime = new Date(timestamp)
                        const diffMs = now.getTime() - logTime.getTime()
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                        const diffDays = Math.floor(diffHours / 24)

                        if (diffHours < 1) return 'Just now'
                        if (diffHours < 24) return `${diffHours} hours ago`
                        if (diffDays < 7) return `${diffDays} days ago`
                        return logTime.toLocaleDateString()
                      }

                      const status = getStatusFromAction(log.action)
                      const eventName = getEventDisplayName(log.action)
                      const timeAgo = getTimeAgo(log.timestamp)

                      return (
                        <div key={log.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{eventName}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.user?.name || log.user?.email || 'System'} 
                              {log.ipAddress && ` • ${log.ipAddress}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={status === "success" ? "default" : status === "failed" ? "destructive" : "secondary"}>
                              {status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={handleViewAuditLog}>
                  View Full Audit Log
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUser} disabled={addUserMutation.isPending}>
              {addUserMutation.isPending ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUser} disabled={editUserMutation.isPending}>
              {editUserMutation.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name || selectedUser?.email}</strong>? 
              This action cannot be undone and will remove all access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteUser} disabled={deleteUserMutation.isPending}>
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Organization Confirmation Dialog */}
      <AlertDialog open={showDeleteOrgDialog} onOpenChange={setShowDeleteOrgDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedOrg?.name}</strong>? 
              This action cannot be undone and will remove all organization data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteOrg} disabled={deleteOrgMutation.isPending}>
              {deleteOrgMutation.isPending ? 'Deleting...' : 'Delete Organization'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Organization Modal */}
      <Dialog open={showAddOrgModal} onOpenChange={setShowAddOrgModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization for your business.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <Label htmlFor="org-industry">Industry</Label>
              <Input
                id="org-industry"
                value={orgForm.industry}
                onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })}
                placeholder="Enter industry"
              />
            </div>
            <div>
              <Label htmlFor="org-country">Country</Label>
              <Input
                id="org-country"
                value={orgForm.country}
                onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })}
                placeholder="Enter country"
              />
            </div>
            <div>
              <Label htmlFor="org-currency">Currency</Label>
              <Select value={orgForm.currency} onValueChange={(value) => setOrgForm({ ...orgForm, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="org-taxid">Tax ID</Label>
              <Input
                id="org-taxid"
                value={orgForm.taxId}
                onChange={(e) => setOrgForm({ ...orgForm, taxId: e.target.value })}
                placeholder="Enter tax ID"
              />
            </div>
            <div>
              <Label htmlFor="org-fiscal-year">Fiscal Year Start</Label>
              <Input
                id="org-fiscal-year"
                value={orgForm.fiscalYearStart}
                onChange={(e) => setOrgForm({ ...orgForm, fiscalYearStart: e.target.value })}
                placeholder="MM-DD (e.g., 01-01)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOrgModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOrg} disabled={addOrgMutation.isPending}>
              {addOrgMutation.isPending ? 'Adding...' : 'Add Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Modal */}
      <Dialog open={showEditOrgModal} onOpenChange={setShowEditOrgModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-org-name">Organization Name</Label>
              <Input
                id="edit-org-name"
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <Label htmlFor="edit-org-industry">Industry</Label>
              <Input
                id="edit-org-industry"
                value={orgForm.industry}
                onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })}
                placeholder="Enter industry"
              />
            </div>
            <div>
              <Label htmlFor="edit-org-country">Country</Label>
              <Input
                id="edit-org-country"
                value={orgForm.country}
                onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })}
                placeholder="Enter country"
              />
            </div>
            <div>
              <Label htmlFor="edit-org-currency">Currency</Label>
              <Select value={orgForm.currency} onValueChange={(value) => setOrgForm({ ...orgForm, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-org-taxid">Tax ID</Label>
              <Input
                id="edit-org-taxid"
                value={orgForm.taxId}
                onChange={(e) => setOrgForm({ ...orgForm, taxId: e.target.value })}
                placeholder="Enter tax ID"
              />
            </div>
            <div>
              <Label htmlFor="edit-org-fiscal-year">Fiscal Year Start</Label>
              <Input
                id="edit-org-fiscal-year"
                value={orgForm.fiscalYearStart}
                onChange={(e) => setOrgForm({ ...orgForm, fiscalYearStart: e.target.value })}
                placeholder="MM-DD (e.g., 01-01)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditOrgModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOrg} disabled={editOrgMutation.isPending}>
              {editOrgMutation.isPending ? 'Updating...' : 'Update Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Audit Log Modal */}
      <Dialog open={showAuditLogModal} onOpenChange={setShowAuditLogModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Audit Log</DialogTitle>
            <DialogDescription>
              Complete security event history for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {auditLogsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading audit logs...</p>
                </div>
              </div>
            ) : auditLogsData?.data?.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No audit logs found</p>
                </div>
              </div>
            ) : (
              auditLogsData?.data?.map((log: any, index: number) => {
                const getEventDisplayName = (action: string) => {
                  switch (action) {
                    case 'LOGIN_SUCCESS': return 'User login'
                    case 'LOGIN_FAILED': return 'Failed login attempt'
                    case 'PASSWORD_CHANGED': return 'Password changed'
                    case 'MFA_ENABLED': return '2FA enabled'
                    case 'MFA_DISABLED': return '2FA disabled'
                    case 'TOKEN_REFRESH': return 'Session refreshed'
                    case 'USER_CREATED': return 'User created'
                    case 'USER_UPDATED': return 'User updated'
                    case 'SECURITY_ALERT': return 'Security alert'
                    default: return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                  }
                }

                const getStatusFromAction = (action: string) => {
                  switch (action) {
                    case 'LOGIN_SUCCESS':
                    case 'PASSWORD_CHANGED':
                    case 'MFA_ENABLED':
                    case 'TOKEN_REFRESH':
                    case 'USER_CREATED':
                    case 'USER_UPDATED':
                      return 'success'
                    case 'LOGIN_FAILED':
                    case 'SECURITY_ALERT':
                      return 'failed'
                    default:
                      return 'info'
                  }
                }

                const status = getStatusFromAction(log.action)
                const eventName = getEventDisplayName(log.action)

                return (
                  <div key={log.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{eventName}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user?.name || log.user?.email || 'System'} 
                        {log.ipAddress && ` • ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={status === "success" ? "default" : status === "failed" ? "destructive" : "secondary"}>
                        {status}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuditLogModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              {(Array.isArray(companies) ? companies : (companies as any)?.data || []).map((c: any) => (
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
    enabled: !!companyId
  })

  const configQuery = useQuery({
    queryKey: ['tax-config', companyId],
    queryFn: async () => {
      if (!companyId) return null
      const res = await fetch(`/api/tax/config?companyId=${companyId}`)
      if (!res.ok) throw new Error('Failed to load tax config')
      return res.json()
    },
    enabled: !!companyId
  })

  const nexusQuery = useQuery({
    queryKey: ['tax-nexus', companyId],
    queryFn: async () => {
      if (!companyId) return []
      const res = await fetch(`/api/tax/nexus?companyId=${companyId}`)
      if (!res.ok) throw new Error('Failed to load tax nexus')
      return res.json()
    },
    enabled: !!companyId
  })

  React.useEffect(() => {
    const data = configQuery.data as any
    if (data) {
      if (typeof data.taxInclusive === 'boolean') setTaxInclusive(data.taxInclusive)
      if (data.roundingMethod) setRounding(data.roundingMethod)
      if (data.defaultJurisdictionId) setDefaultJurisdiction(data.defaultJurisdictionId)
    }
  }, [configQuery.data])

  React.useEffect(() => {
    const nx = nexusQuery.data as any
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

  const jurisdictions = (jurisdictionsQuery.data as any) || []

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
