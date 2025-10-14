import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { PageLayout } from "../components/page-layout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Plus, Users, Building2, Shield, Settings as SettingsIcon, Edit, Trash2, Crown, UserCheck, Activity } from "lucide-react";
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { securityApi } from '@/lib/api/security';
export default function SettingsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    // Modal and action states
    const [showAddUserModal, setShowAddUserModal] = React.useState(false);
    const [showEditUserModal, setShowEditUserModal] = React.useState(false);
    const [showDeleteUserDialog, setShowDeleteUserDialog] = React.useState(false);
    const [showAddOrgModal, setShowAddOrgModal] = React.useState(false);
    const [showEditOrgModal, setShowEditOrgModal] = React.useState(false);
    const [showDeleteOrgDialog, setShowDeleteOrgDialog] = React.useState(false);
    const [showAuditLogModal, setShowAuditLogModal] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [selectedOrg, setSelectedOrg] = React.useState(null);
    // Form states
    const [userForm, setUserForm] = React.useState({
        name: '',
        email: '',
        role: 'employee',
        password: ''
    });
    const [orgForm, setOrgForm] = React.useState({
        name: '',
        industry: '',
        country: '',
        currency: 'USD',
        taxId: '',
        fiscalYearStart: '01-01'
    });
    // Fetch real data
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => apiService.getUsers(),
        enabled: !!user
    });
    const { data: companiesData, isLoading: companiesLoading } = useQuery({
        queryKey: ['companies'],
        queryFn: () => apiService.getCompanies(),
        enabled: !!user
    });
    const { data: auditLogsData, isLoading: auditLogsLoading } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: () => securityApi.getAuditLogs(1, 10),
        enabled: !!user
    });
    // Mutations for user management
    const addUserMutation = useMutation({
        mutationFn: async (userData) => {
            return await apiService.createUser(userData);
        },
        onSuccess: () => {
            toast.success('User added successfully');
            setShowAddUserModal(false);
            setUserForm({ name: '', email: '', role: 'employee', password: '' });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            const message = error?.message || 'Failed to add user';
            toast.error(message);
        }
    });
    const editUserMutation = useMutation({
        mutationFn: async ({ userId, userData }) => {
            return await apiService.updateUser(userId, userData);
        },
        onSuccess: () => {
            toast.success('User updated successfully');
            setShowEditUserModal(false);
            setSelectedUser(null);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            const message = error?.message || 'Failed to update user';
            toast.error(message);
        }
    });
    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            return await apiService.deleteUser(userId);
        },
        onSuccess: () => {
            toast.success('User deleted successfully');
            setShowDeleteUserDialog(false);
            setSelectedUser(null);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            const message = error?.message || 'Failed to delete user';
            toast.error(message);
        }
    });
    // Mutations for organization management
    const addOrgMutation = useMutation({
        mutationFn: async (orgData) => {
            return await apiService.createCompany(orgData);
        },
        onSuccess: () => {
            toast.success('Organization added successfully');
            setShowAddOrgModal(false);
            setOrgForm({ name: '', industry: '', country: '', currency: 'USD', taxId: '', fiscalYearStart: '01-01' });
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
        onError: (error) => {
            const message = error?.message || 'Failed to add organization';
            toast.error(message);
        }
    });
    const editOrgMutation = useMutation({
        mutationFn: async ({ orgId, orgData }) => {
            return await apiService.updateCompany(orgId, orgData);
        },
        onSuccess: () => {
            toast.success('Organization updated successfully');
            setShowEditOrgModal(false);
            setSelectedOrg(null);
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
        onError: (error) => {
            const message = error?.message || 'Failed to update organization';
            toast.error(message);
        }
    });
    const deleteOrgMutation = useMutation({
        mutationFn: async (orgId) => {
            return await apiService.deleteCompany(orgId);
        },
        onSuccess: () => {
            toast.success('Organization deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
        onError: (error) => {
            const message = error?.message || 'Failed to delete organization';
            toast.error(message);
        }
    });
    // Calculate real metrics
    const totalUsers = usersData?.totalCount || 0;
    const activeUsers = usersData?.users?.filter((u) => u.lastActiveAt && new Date(u.lastActiveAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0;
    const totalCompanies = companiesData?.data?.length || 0;
    const adminUsers = usersData?.users?.filter((u) => u.role === 'admin' || u.role === 'owner').length || 0;
    // Handler functions
    const handleAddUser = () => {
        setUserForm({ name: '', email: '', role: 'employee', password: '' });
        setShowAddUserModal(true);
    };
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setUserForm({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'employee',
            password: ''
        });
        setShowEditUserModal(true);
    };
    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteUserDialog(true);
    };
    const handleAddOrg = () => {
        setOrgForm({ name: '', industry: '', country: '', currency: 'USD', taxId: '', fiscalYearStart: '01-01' });
        setShowAddOrgModal(true);
    };
    const handleEditOrg = (org) => {
        setSelectedOrg(org);
        setOrgForm({
            name: org.name || '',
            industry: org.industry || '',
            country: org.country || '',
            currency: org.currency || 'USD',
            taxId: org.taxId || '',
            fiscalYearStart: org.fiscalYearStart || '01-01'
        });
        setShowEditOrgModal(true);
    };
    const handleViewAuditLog = () => {
        setShowAuditLogModal(true);
    };
    const handleSubmitUser = () => {
        if (showAddUserModal) {
            addUserMutation.mutate(userForm);
        }
        else if (showEditUserModal && selectedUser) {
            editUserMutation.mutate({ userId: selectedUser.id, userData: userForm });
        }
    };
    const handleSubmitOrg = () => {
        if (showAddOrgModal) {
            addOrgMutation.mutate(orgForm);
        }
        else if (showEditOrgModal && selectedOrg) {
            editOrgMutation.mutate({ orgId: selectedOrg.id, orgData: orgForm });
        }
    };
    const handleConfirmDeleteUser = () => {
        if (selectedUser) {
            deleteUserMutation.mutate(selectedUser.id);
        }
    };
    const handleDeleteOrg = (org) => {
        setSelectedOrg(org);
        setShowDeleteOrgDialog(true);
    };
    const handleConfirmDeleteOrg = () => {
        if (selectedOrg) {
            deleteOrgMutation.mutate(selectedOrg.id);
            setShowDeleteOrgDialog(false);
            setSelectedOrg(null);
        }
    };
    return (_jsxs(PageLayout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-balance", children: "User & Organization Management" }), _jsx("p", { className: "text-muted-foreground", children: "Manage users, roles, and organization settings" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(SettingsIcon, { className: "w-4 h-4 mr-2" }), "System Settings"] }), _jsxs(Button, { onClick: handleAddUser, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Invite User"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Users, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Total Users" }), _jsx("p", { className: "text-xl font-bold", children: usersLoading ? '...' : totalUsers })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(UserCheck, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Active Users" }), _jsx("p", { className: "text-xl font-bold", children: usersLoading ? '...' : activeUsers }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Last 7 days" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Organizations" }), _jsx("p", { className: "text-xl font-bold", children: companiesLoading ? '...' : totalCompanies })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center", children: _jsx(Shield, { className: "w-5 h-5 text-amber-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Admin Users" }), _jsx("p", { className: "text-xl font-bold", children: usersLoading ? '...' : adminUsers })] })] }) }) })] }), _jsxs(Tabs, { defaultValue: "users", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "users", children: "Users" }), _jsx(TabsTrigger, { value: "organizations", children: "Organizations" }), _jsx(TabsTrigger, { value: "roles", children: "Roles & Permissions" }), _jsx(TabsTrigger, { value: "security", children: "Security" }), _jsx(TabsTrigger, { value: "company", children: "Company Settings" })] }), _jsx(TabsContent, { value: "users", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Team Members" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { defaultValue: "all", children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Users" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "inactive", children: "Inactive" })] })] }), _jsxs(Button, { onClick: handleAddUser, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add User"] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: usersLoading ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(Activity, { className: "w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading users..." })] }) })) : usersData?.users?.length === 0 ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(Users, { className: "w-8 h-8 mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No users found" })] }) })) : (usersData?.users?.map((user, index) => {
                                                    const isActive = user.lastActiveAt && new Date(user.lastActiveAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                                    const lastActiveText = user.lastActiveAt
                                                        ? new Date(user.lastActiveAt).toLocaleDateString() === new Date().toLocaleDateString()
                                                            ? 'Today'
                                                            : new Date(user.lastActiveAt).toLocaleDateString() === new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString()
                                                                ? 'Yesterday'
                                                                : `${Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / (24 * 60 * 60 * 1000))} days ago`
                                                        : 'Never';
                                                    return (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { className: "w-10 h-10", children: [_jsx(AvatarImage, { src: user.avatar || "/placeholder.svg", alt: user.name || user.email }), _jsx(AvatarFallback, { children: (user.name || user.email)
                                                                                    .split(" ")
                                                                                    .map((n) => n[0])
                                                                                    .join("")
                                                                                    .toUpperCase() })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: user.name || user.email }), (user.role === "owner" || user.role === "Owner") && _jsx(Crown, { className: "w-4 h-4 text-amber-500" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: user.email }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [user.mfaEnabled ? '🔐 MFA Enabled' : '🔓 MFA Disabled', " \u2022 Created ", new Date(user.createdAt).toLocaleDateString()] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: user.role === "owner" || user.role === "Owner" ? "default" :
                                                                                    user.role === "admin" || user.role === "Admin" ? "secondary" :
                                                                                        "outline", children: user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User' }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Last active: ", lastActiveText] })] }), _jsx(Badge, { variant: isActive ? "default" : "secondary", children: isActive ? "Active" : "Inactive" }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleEditUser(user), children: _jsx(Edit, { className: "w-4 h-4" }) }), (user.role !== "owner" && user.role !== "Owner") && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteUser(user), children: _jsx(Trash2, { className: "w-4 h-4" }) }))] })] })] }, user.id || index));
                                                })) }) })] }) }), _jsx(TabsContent, { value: "company", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-center justify-between", children: _jsx(CardTitle, { children: "Company Settings" }) }) }), _jsx(CardContent, { children: _jsx(CompanySettingsForm, {}) })] }) }), _jsx(TabsContent, { value: "organizations", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Organizations" }), _jsxs(Button, { onClick: handleAddOrg, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Organization"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: companiesLoading ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(Activity, { className: "w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading organizations..." })] }) })) : companiesData?.data?.length === 0 ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(Building2, { className: "w-8 h-8 mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No organizations found" })] }) })) : (companiesData?.data?.map((company, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "w-6 h-6 text-cyan-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: company.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [company.industry || 'Business', " \u2022", company.country || 'Unknown Country', " \u2022 Created ", new Date(company.createdAt).toLocaleDateString()] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [company._count?.transactions || 0, " transactions \u2022", company._count?.customers || 0, " customers \u2022", company._count?.vendors || 0, " vendors"] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Badge, { variant: "default", children: company.currency || 'USD' }), _jsx(Badge, { variant: "secondary", children: company.taxId ? 'Tax Registered' : 'No Tax ID' }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleEditOrg(company), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteOrg(company), children: _jsx(Trash2, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(SettingsIcon, { className: "w-4 h-4" }) })] })] })] }, company.id || index)))) }) })] }) }), _jsx(TabsContent, { value: "roles", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "User Roles" }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Custom Role"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: usersLoading ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(Activity, { className: "w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading roles..." })] }) })) : ((() => {
                                                            // Calculate role statistics from real user data
                                                            const roleStats = usersData?.users?.reduce((acc, user) => {
                                                                const role = user.role || 'employee';
                                                                if (!acc[role]) {
                                                                    acc[role] = { count: 0, users: [] };
                                                                }
                                                                acc[role].count++;
                                                                acc[role].users.push(user);
                                                                return acc;
                                                            }, {}) || {};
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
                                                            };
                                                            return Object.entries(roleStats).map(([roleKey, stats]) => {
                                                                const roleDef = roleDefinitions[roleKey] || {
                                                                    name: roleKey.charAt(0).toUpperCase() + roleKey.slice(1),
                                                                    description: "Custom role with specific permissions",
                                                                    permissions: ["Custom Permissions"]
                                                                };
                                                                return (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-medium", children: roleDef.name }), roleKey === "owner" && _jsx(Crown, { className: "w-4 h-4 text-amber-500" })] }), _jsxs(Badge, { variant: "outline", children: [stats.count, " users"] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: roleDef.description }), _jsx("div", { className: "flex flex-wrap gap-1", children: roleDef.permissions.map((permission, pIndex) => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: permission }, pIndex))) })] }, roleKey));
                                                            });
                                                        })()) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Permission Settings" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "font-medium", children: "Financial Data Access" }), [
                                                                        { name: "View Financial Reports", enabled: true },
                                                                        { name: "Edit Transactions", enabled: true },
                                                                        { name: "Delete Transactions", enabled: false },
                                                                        { name: "Export Data", enabled: true },
                                                                    ].map((permission, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: permission.name }), _jsx(Switch, { checked: permission.enabled })] }, index)))] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "font-medium", children: "User Management" }), [
                                                                        { name: "Invite Users", enabled: true },
                                                                        { name: "Edit User Roles", enabled: false },
                                                                        { name: "Delete Users", enabled: false },
                                                                    ].map((permission, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: permission.name }), _jsx(Switch, { checked: permission.enabled })] }, index)))] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "font-medium", children: "System Settings" }), [
                                                                        { name: "Modify Organization Settings", enabled: false },
                                                                        { name: "Manage Integrations", enabled: true },
                                                                        { name: "Access AI Settings", enabled: true },
                                                                    ].map((permission, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: permission.name }), _jsx(Switch, { checked: permission.enabled })] }, index)))] })] }) })] })] }) }), _jsx(TabsContent, { value: "security", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Security Settings" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "font-medium", children: "Authentication" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Two-Factor Authentication" }), _jsx(Switch, { checked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Single Sign-On (SSO)" }), _jsx(Switch, { checked: false })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Password Requirements" }), _jsx(Switch, { checked: true })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "font-medium", children: "Session Management" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Auto-logout after inactivity" }), _jsxs(Select, { defaultValue: "30", children: [_jsx(SelectTrigger, { className: "w-24", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "15", children: "15 min" }), _jsx(SelectItem, { value: "30", children: "30 min" }), _jsx(SelectItem, { value: "60", children: "1 hour" }), _jsx(SelectItem, { value: "120", children: "2 hours" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Concurrent Sessions" }), _jsxs(Select, { defaultValue: "3", children: [_jsx(SelectTrigger, { className: "w-16", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1", children: "1" }), _jsx(SelectItem, { value: "3", children: "3" }), _jsx(SelectItem, { value: "5", children: "5" }), _jsx(SelectItem, { value: "unlimited", children: "\u221E" })] })] })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Security Events" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: auditLogsLoading ? (_jsx("div", { className: "flex items-center justify-center p-4", children: _jsxs("div", { className: "text-center", children: [_jsx(Activity, { className: "w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading security events..." })] }) })) : auditLogsData?.data?.length === 0 ? (_jsx("div", { className: "flex items-center justify-center p-4", children: _jsxs("div", { className: "text-center", children: [_jsx(Shield, { className: "w-6 h-6 mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No security events found" })] }) })) : (auditLogsData?.data?.map((log, index) => {
                                                                const getEventDisplayName = (action) => {
                                                                    switch (action) {
                                                                        case 'LOGIN_SUCCESS': return 'User login';
                                                                        case 'LOGIN_FAILED': return 'Failed login attempt';
                                                                        case 'PASSWORD_CHANGED': return 'Password changed';
                                                                        case 'MFA_ENABLED': return '2FA enabled';
                                                                        case 'MFA_DISABLED': return '2FA disabled';
                                                                        case 'TOKEN_REFRESH': return 'Session refreshed';
                                                                        case 'USER_CREATED': return 'User created';
                                                                        case 'USER_UPDATED': return 'User updated';
                                                                        case 'SECURITY_ALERT': return 'Security alert';
                                                                        default: return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                                                                    }
                                                                };
                                                                const getStatusFromAction = (action) => {
                                                                    switch (action) {
                                                                        case 'LOGIN_SUCCESS':
                                                                        case 'PASSWORD_CHANGED':
                                                                        case 'MFA_ENABLED':
                                                                        case 'TOKEN_REFRESH':
                                                                        case 'USER_CREATED':
                                                                        case 'USER_UPDATED':
                                                                            return 'success';
                                                                        case 'LOGIN_FAILED':
                                                                        case 'SECURITY_ALERT':
                                                                            return 'failed';
                                                                        default:
                                                                            return 'info';
                                                                    }
                                                                };
                                                                const getTimeAgo = (timestamp) => {
                                                                    const now = new Date();
                                                                    const logTime = new Date(timestamp);
                                                                    const diffMs = now.getTime() - logTime.getTime();
                                                                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                                                    const diffDays = Math.floor(diffHours / 24);
                                                                    if (diffHours < 1)
                                                                        return 'Just now';
                                                                    if (diffHours < 24)
                                                                        return `${diffHours} hours ago`;
                                                                    if (diffDays < 7)
                                                                        return `${diffDays} days ago`;
                                                                    return logTime.toLocaleDateString();
                                                                };
                                                                const status = getStatusFromAction(log.action);
                                                                const eventName = getEventDisplayName(log.action);
                                                                const timeAgo = getTimeAgo(log.timestamp);
                                                                return (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: eventName }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [log.user?.name || log.user?.email || 'System', log.ipAddress && ` • ${log.ipAddress}`] })] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: status === "success" ? "default" : status === "failed" ? "destructive" : "secondary", children: status }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: timeAgo })] })] }, log.id || index));
                                                            })) }), _jsx(Button, { variant: "outline", className: "w-full mt-4 bg-transparent", onClick: handleViewAuditLog, children: "View Full Audit Log" })] })] })] }) })] })] }), _jsx(Dialog, { open: showAddUserModal, onOpenChange: setShowAddUserModal, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add New User" }), _jsx(DialogDescription, { children: "Create a new user account for your organization." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Full Name" }), _jsx(Input, { id: "name", value: userForm.name, onChange: (e) => setUserForm({ ...userForm, name: e.target.value }), placeholder: "Enter full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: userForm.email, onChange: (e) => setUserForm({ ...userForm, email: e.target.value }), placeholder: "Enter email address" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "role", children: "Role" }), _jsxs(Select, { value: userForm.role, onValueChange: (value) => setUserForm({ ...userForm, role: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "employee", children: "Employee" }), _jsx(SelectItem, { value: "admin", children: "Admin" }), _jsx(SelectItem, { value: "owner", children: "Owner" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", value: userForm.password, onChange: (e) => setUserForm({ ...userForm, password: e.target.value }), placeholder: "Enter password" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowAddUserModal(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitUser, disabled: addUserMutation.isPending, children: addUserMutation.isPending ? 'Adding...' : 'Add User' })] })] }) }), _jsx(Dialog, { open: showEditUserModal, onOpenChange: setShowEditUserModal, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit User" }), _jsx(DialogDescription, { children: "Update user information and permissions." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-name", children: "Full Name" }), _jsx(Input, { id: "edit-name", value: userForm.name, onChange: (e) => setUserForm({ ...userForm, name: e.target.value }), placeholder: "Enter full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-email", children: "Email" }), _jsx(Input, { id: "edit-email", type: "email", value: userForm.email, onChange: (e) => setUserForm({ ...userForm, email: e.target.value }), placeholder: "Enter email address" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-role", children: "Role" }), _jsxs(Select, { value: userForm.role, onValueChange: (value) => setUserForm({ ...userForm, role: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "employee", children: "Employee" }), _jsx(SelectItem, { value: "admin", children: "Admin" }), _jsx(SelectItem, { value: "owner", children: "Owner" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-password", children: "New Password (optional)" }), _jsx(Input, { id: "edit-password", type: "password", value: userForm.password, onChange: (e) => setUserForm({ ...userForm, password: e.target.value }), placeholder: "Enter new password" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowEditUserModal(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitUser, disabled: editUserMutation.isPending, children: editUserMutation.isPending ? 'Updating...' : 'Update User' })] })] }) }), _jsx(AlertDialog, { open: showDeleteUserDialog, onOpenChange: setShowDeleteUserDialog, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Delete User" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to delete ", _jsx("strong", { children: selectedUser?.name || selectedUser?.email }), "? This action cannot be undone and will remove all access to the system."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: handleConfirmDeleteUser, disabled: deleteUserMutation.isPending, children: deleteUserMutation.isPending ? 'Deleting...' : 'Delete User' })] })] }) }), _jsx(AlertDialog, { open: showDeleteOrgDialog, onOpenChange: setShowDeleteOrgDialog, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Delete Organization" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to delete ", _jsx("strong", { children: selectedOrg?.name }), "? This action cannot be undone and will remove all organization data."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: handleConfirmDeleteOrg, disabled: deleteOrgMutation.isPending, children: deleteOrgMutation.isPending ? 'Deleting...' : 'Delete Organization' })] })] }) }), _jsx(Dialog, { open: showAddOrgModal, onOpenChange: setShowAddOrgModal, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add New Organization" }), _jsx(DialogDescription, { children: "Create a new organization for your business." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "org-name", children: "Organization Name" }), _jsx(Input, { id: "org-name", value: orgForm.name, onChange: (e) => setOrgForm({ ...orgForm, name: e.target.value }), placeholder: "Enter organization name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "org-industry", children: "Industry" }), _jsx(Input, { id: "org-industry", value: orgForm.industry, onChange: (e) => setOrgForm({ ...orgForm, industry: e.target.value }), placeholder: "Enter industry" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "org-country", children: "Country" }), _jsx(Input, { id: "org-country", value: orgForm.country, onChange: (e) => setOrgForm({ ...orgForm, country: e.target.value }), placeholder: "Enter country" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "org-currency", children: "Currency" }), _jsxs(Select, { value: orgForm.currency, onValueChange: (value) => setOrgForm({ ...orgForm, currency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" }), _jsx(SelectItem, { value: "CAD", children: "CAD" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "org-taxid", children: "Tax ID" }), _jsx(Input, { id: "org-taxid", value: orgForm.taxId, onChange: (e) => setOrgForm({ ...orgForm, taxId: e.target.value }), placeholder: "Enter tax ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "org-fiscal-year", children: "Fiscal Year Start" }), _jsx(Input, { id: "org-fiscal-year", value: orgForm.fiscalYearStart, onChange: (e) => setOrgForm({ ...orgForm, fiscalYearStart: e.target.value }), placeholder: "MM-DD (e.g., 01-01)" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowAddOrgModal(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitOrg, disabled: addOrgMutation.isPending, children: addOrgMutation.isPending ? 'Adding...' : 'Add Organization' })] })] }) }), _jsx(Dialog, { open: showEditOrgModal, onOpenChange: setShowEditOrgModal, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Organization" }), _jsx(DialogDescription, { children: "Update organization information and settings." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-org-name", children: "Organization Name" }), _jsx(Input, { id: "edit-org-name", value: orgForm.name, onChange: (e) => setOrgForm({ ...orgForm, name: e.target.value }), placeholder: "Enter organization name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-org-industry", children: "Industry" }), _jsx(Input, { id: "edit-org-industry", value: orgForm.industry, onChange: (e) => setOrgForm({ ...orgForm, industry: e.target.value }), placeholder: "Enter industry" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-org-country", children: "Country" }), _jsx(Input, { id: "edit-org-country", value: orgForm.country, onChange: (e) => setOrgForm({ ...orgForm, country: e.target.value }), placeholder: "Enter country" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-org-currency", children: "Currency" }), _jsxs(Select, { value: orgForm.currency, onValueChange: (value) => setOrgForm({ ...orgForm, currency: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USD", children: "USD" }), _jsx(SelectItem, { value: "EUR", children: "EUR" }), _jsx(SelectItem, { value: "GBP", children: "GBP" }), _jsx(SelectItem, { value: "CAD", children: "CAD" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-org-taxid", children: "Tax ID" }), _jsx(Input, { id: "edit-org-taxid", value: orgForm.taxId, onChange: (e) => setOrgForm({ ...orgForm, taxId: e.target.value }), placeholder: "Enter tax ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "edit-org-fiscal-year", children: "Fiscal Year Start" }), _jsx(Input, { id: "edit-org-fiscal-year", value: orgForm.fiscalYearStart, onChange: (e) => setOrgForm({ ...orgForm, fiscalYearStart: e.target.value }), placeholder: "MM-DD (e.g., 01-01)" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowEditOrgModal(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitOrg, disabled: editOrgMutation.isPending, children: editOrgMutation.isPending ? 'Updating...' : 'Update Organization' })] })] }) }), _jsx(Dialog, { open: showAuditLogModal, onOpenChange: setShowAuditLogModal, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Full Audit Log" }), _jsx(DialogDescription, { children: "Complete security event history for your organization." })] }), _jsx("div", { className: "space-y-3", children: auditLogsLoading ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(Activity, { className: "w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading audit logs..." })] }) })) : auditLogsData?.data?.length === 0 ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(Shield, { className: "w-8 h-8 mx-auto mb-2 text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No audit logs found" })] }) })) : (auditLogsData?.data?.map((log, index) => {
                                const getEventDisplayName = (action) => {
                                    switch (action) {
                                        case 'LOGIN_SUCCESS': return 'User login';
                                        case 'LOGIN_FAILED': return 'Failed login attempt';
                                        case 'PASSWORD_CHANGED': return 'Password changed';
                                        case 'MFA_ENABLED': return '2FA enabled';
                                        case 'MFA_DISABLED': return '2FA disabled';
                                        case 'TOKEN_REFRESH': return 'Session refreshed';
                                        case 'USER_CREATED': return 'User created';
                                        case 'USER_UPDATED': return 'User updated';
                                        case 'SECURITY_ALERT': return 'Security alert';
                                        default: return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                                    }
                                };
                                const getStatusFromAction = (action) => {
                                    switch (action) {
                                        case 'LOGIN_SUCCESS':
                                        case 'PASSWORD_CHANGED':
                                        case 'MFA_ENABLED':
                                        case 'TOKEN_REFRESH':
                                        case 'USER_CREATED':
                                        case 'USER_UPDATED':
                                            return 'success';
                                        case 'LOGIN_FAILED':
                                        case 'SECURITY_ALERT':
                                            return 'failed';
                                        default:
                                            return 'info';
                                    }
                                };
                                const status = getStatusFromAction(log.action);
                                const eventName = getEventDisplayName(log.action);
                                return (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: eventName }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [log.user?.name || log.user?.email || 'System', log.ipAddress && ` • ${log.ipAddress}`] }), _jsx("p", { className: "text-xs text-muted-foreground", children: new Date(log.timestamp).toLocaleString() })] }), _jsx("div", { className: "text-right", children: _jsx(Badge, { variant: status === "success" ? "default" : status === "failed" ? "destructive" : "secondary", children: status }) })] }, log.id || index));
                            })) }), _jsx(DialogFooter, { children: _jsx(Button, { variant: "outline", onClick: () => setShowAuditLogModal(false), children: "Close" }) })] }) })] }));
}
function CompanySettingsForm() {
    const { ready: authReady } = useDemoAuth('settings-page');
    const { data: companies } = useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const res = await apiService.getCompanies();
            return res.data;
        },
        enabled: authReady
    });
    const [companyId, setCompanyId] = React.useState('');
    const [pctLocal, setPctLocal] = React.useState('2');
    const [absLocal, setAbsLocal] = React.useState('5');
    const [pctImport, setPctImport] = React.useState('2');
    const [absImport, setAbsImport] = React.useState('5');
    const { data: settings } = useQuery({
        queryKey: ['company-settings', companyId],
        queryFn: async () => {
            if (!companyId)
                return null;
            const res = await fetch(`/api/internal/company-settings?companyId=${companyId}`);
            if (!res.ok)
                throw new Error('Failed to load settings');
            return res.json();
        },
        enabled: !!companyId
    });
    React.useEffect(() => {
        if (settings?.items) {
            const pL = settings.items.find((s) => s.key === 'three_way_tolerance_pct_local')?.value;
            const aL = settings.items.find((s) => s.key === 'three_way_tolerance_abs_local')?.value;
            const pI = settings.items.find((s) => s.key === 'three_way_tolerance_pct_import')?.value;
            const aI = settings.items.find((s) => s.key === 'three_way_tolerance_abs_import')?.value;
            if (pL !== undefined)
                setPctLocal(String(pL));
            if (aL !== undefined)
                setAbsLocal(String(aL));
            if (pI !== undefined)
                setPctImport(String(pI));
            if (aI !== undefined)
                setAbsImport(String(aI));
        }
    }, [settings]);
    const save = useMutation({
        mutationFn: async () => {
            if (!companyId)
                return;
            const headers = { 'Content-Type': 'application/json' };
            await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId, key: 'three_way_tolerance_pct_local', value: pctLocal }) });
            await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId, key: 'three_way_tolerance_abs_local', value: absLocal }) });
            await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId, key: 'three_way_tolerance_pct_import', value: pctImport }) });
            await fetch('/api/internal/company-settings', { method: 'POST', headers, body: JSON.stringify({ companyId, key: 'three_way_tolerance_abs_import', value: absImport }) });
        },
        onSuccess: () => {
            toast.success('Company settings saved successfully');
        },
        onError: (error) => {
            toast.error('Failed to save company settings');
            console.error('Save error:', error);
        }
    });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("div", { className: "col-span-1", children: [_jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Company" }), _jsxs(Select, { value: companyId, onValueChange: setCompanyId, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsx(SelectContent, { children: (Array.isArray(companies) ? companies : companies?.data || []).map((c) => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id))) })] })] }), _jsxs("div", { className: "col-span-1", children: [_jsx("div", { className: "text-sm font-medium mb-1", children: "Local % tolerance" }), _jsx(Input, { type: "number", step: "0.1", value: pctLocal, onChange: (e) => setPctLocal(e.target.value) })] }), _jsxs("div", { className: "col-span-1", children: [_jsx("div", { className: "text-sm font-medium mb-1", children: "Local $ tolerance" }), _jsx(Input, { type: "number", step: "0.01", value: absLocal, onChange: (e) => setAbsLocal(e.target.value) })] }), _jsxs("div", { className: "col-span-1", children: [_jsx("div", { className: "text-sm font-medium mb-1", children: "Import % tolerance" }), _jsx(Input, { type: "number", step: "0.1", value: pctImport, onChange: (e) => setPctImport(e.target.value) })] }), _jsxs("div", { className: "col-span-1 col-start-2", children: [_jsx("div", { className: "text-sm font-medium mb-1", children: "Import $ tolerance" }), _jsx(Input, { type: "number", step: "0.01", value: absImport, onChange: (e) => setAbsImport(e.target.value) })] })] }), _jsx("div", { className: "flex justify-end gap-2", children: _jsx(Button, { variant: "outline", disabled: !companyId || save.isPending, onClick: () => save.mutate(), children: save.isPending ? 'Saving...' : 'Save' }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Tax Settings" }) }), _jsx(CardContent, { className: "space-y-4", children: _jsx(TaxSettings, { companyId: companyId }) })] })] }));
}
function TaxSettings({ companyId }) {
    const [taxInclusive, setTaxInclusive] = React.useState(false);
    const [rounding, setRounding] = React.useState('round');
    const [defaultJurisdiction, setDefaultJurisdiction] = React.useState('');
    const [nexus, setNexus] = React.useState([]);
    const jurisdictionsQuery = useQuery({
        queryKey: ['tax-jurisdictions', companyId],
        queryFn: async () => {
            if (!companyId)
                return [];
            const res = await fetch('/api/tax/jurisdictions');
            if (!res.ok)
                throw new Error('Failed to load jurisdictions');
            return res.json();
        },
        enabled: !!companyId
    });
    const configQuery = useQuery({
        queryKey: ['tax-config', companyId],
        queryFn: async () => {
            if (!companyId)
                return null;
            const res = await fetch(`/api/tax/config?companyId=${companyId}`);
            if (!res.ok)
                throw new Error('Failed to load tax config');
            return res.json();
        },
        enabled: !!companyId
    });
    const nexusQuery = useQuery({
        queryKey: ['tax-nexus', companyId],
        queryFn: async () => {
            if (!companyId)
                return [];
            const res = await fetch(`/api/tax/nexus?companyId=${companyId}`);
            if (!res.ok)
                throw new Error('Failed to load tax nexus');
            return res.json();
        },
        enabled: !!companyId
    });
    React.useEffect(() => {
        const data = configQuery.data;
        if (data) {
            if (typeof data.taxInclusive === 'boolean')
                setTaxInclusive(data.taxInclusive);
            if (data.roundingMethod)
                setRounding(data.roundingMethod);
            if (data.defaultJurisdictionId)
                setDefaultJurisdiction(data.defaultJurisdictionId);
        }
    }, [configQuery.data]);
    React.useEffect(() => {
        const nx = nexusQuery.data;
        if (Array.isArray(nx)) {
            setNexus(nx.map((n) => n.jurisdictionId || n));
        }
    }, [nexusQuery.data]);
    const saveTax = useMutation({
        mutationFn: async () => {
            if (!companyId)
                return;
            const headers = { 'Content-Type': 'application/json' };
            await fetch(`/api/tax/config?companyId=${companyId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ taxInclusive, roundingMethod: rounding, defaultJurisdictionId: defaultJurisdiction })
            });
            await fetch(`/api/tax/nexus?companyId=${companyId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ jurisdictions: nexus })
            });
        },
        onSuccess: () => {
            toast.success('Tax settings saved successfully');
        },
        onError: (error) => {
            toast.error('Failed to save tax settings');
            console.error('Tax save error:', error);
        }
    });
    const jurisdictions = jurisdictionsQuery.data || [];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "col-span-1 flex items-center justify-between border rounded-lg p-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Prices include tax" }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Inclusive vs exclusive taxation" })] }), _jsx(Switch, { checked: taxInclusive, onCheckedChange: setTaxInclusive, disabled: !companyId })] }), _jsxs("div", { className: "col-span-1", children: [_jsx("div", { className: "text-sm font-medium mb-1", children: "Rounding Method" }), _jsxs(Select, { value: rounding, onValueChange: (v) => setRounding(v), disabled: !companyId, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select method" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "round", children: "Round (nearest)" }), _jsx(SelectItem, { value: "floor", children: "Floor" }), _jsx(SelectItem, { value: "ceil", children: "Ceil" })] })] })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("div", { className: "text-sm font-medium mb-1", children: "Default Jurisdiction" }), _jsxs(Select, { value: defaultJurisdiction, onValueChange: setDefaultJurisdiction, disabled: !companyId || jurisdictionsQuery.isLoading, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: jurisdictionsQuery.isLoading ? "Loading..." : "Select jurisdiction" }) }), _jsx(SelectContent, { children: jurisdictions.map((j) => (_jsxs(SelectItem, { value: j.id, children: [j.name, " (", j.code, ")"] }, j.id))) })] })] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium mb-2", children: "Nexus Jurisdictions" }), jurisdictionsQuery.isLoading ? (_jsx("div", { className: "text-sm text-muted-foreground", children: "Loading jurisdictions..." })) : jurisdictionsQuery.isError ? (_jsx("div", { className: "text-sm text-red-500", children: "Failed to load jurisdictions" })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2 max-h-48 overflow-auto p-2 border rounded-lg", children: jurisdictions.map((j) => {
                            const checked = nexus.includes(j.id);
                            return (_jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", className: "h-4 w-4", checked: checked, disabled: !companyId, onChange: (e) => {
                                            const isChecked = e.target.checked;
                                            setNexus((prev) => {
                                                if (isChecked)
                                                    return Array.from(new Set([...prev, j.id]));
                                                return prev.filter((x) => x !== j.id);
                                            });
                                        } }), _jsxs("span", { children: [j.name, " (", j.code, ")"] })] }, j.id));
                        }) }))] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", disabled: !companyId || saveTax.isPending, onClick: () => saveTax.mutate(), children: saveTax.isPending ? 'Saving...' : 'Save Tax Settings' }) })] }));
}
