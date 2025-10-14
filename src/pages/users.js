import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { PageLayout } from "../components/page-layout";
import { useToast } from "../hooks/use-toast";
import { useState, useEffect } from "react";
import { apiService } from "../lib/api";
import { Users, UserPlus, Shield, Mail, Calendar, CheckCircle } from "lucide-react";
export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await apiService.getUsers();
            setUsers(data.users);
        }
        catch (error) {
            console.error('Error loading users:', error);
            toast({
                title: "Error",
                description: "Failed to load users. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadUsers();
    }, []);
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'accountant': return 'bg-blue-100 text-blue-800';
            case 'auditor': return 'bg-purple-100 text-purple-800';
            case 'employee': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getInitials = (name, email) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        return email[0].toUpperCase();
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "User Management" }), _jsx("p", { className: "text-muted-foreground", children: "Manage users, roles, and access permissions" })] }), _jsxs(Button, { children: [_jsx(UserPlus, { className: "mr-2 h-4 w-4" }), "Add User"] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Users" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: users.length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Active users in the system" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "MFA Enabled" }), _jsx(Shield, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: users.filter(user => user.mfaEnabled).length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Users with 2FA protection" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Admins" }), _jsx(Shield, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: users.filter(user => user.role === 'admin').length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Administrative users" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "All Users" }), _jsx(CardDescription, { children: "View and manage all users in your organization" })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "text-muted-foreground", children: "Loading users..." }) })) : users.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [_jsx(Users, { className: "h-12 w-12 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-semibold", children: "No users found" }), _jsx("p", { className: "text-muted-foreground", children: "Get started by adding your first user" }), _jsxs(Button, { className: "mt-4", children: [_jsx(UserPlus, { className: "mr-2 h-4 w-4" }), "Add User"] })] })) : (_jsx("div", { className: "space-y-4", children: users.map((user) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Avatar, { className: "h-10 w-10", children: _jsx(AvatarFallback, { children: getInitials(user.name, user.email) }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h3", { className: "font-semibold", children: user.name || 'No name set' }), _jsx(Badge, { className: getRoleColor(user.role), children: user.role }), user.mfaEnabled && (_jsxs(Badge, { variant: "outline", className: "text-green-600 border-green-600", children: [_jsx(CheckCircle, { className: "mr-1 h-3 w-3" }), "2FA"] }))] }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-muted-foreground", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "mr-1 h-3 w-3" }), user.email] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "mr-1 h-3 w-3" }), "Joined ", formatDate(user.createdAt)] })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", children: "Edit" }), _jsx(Button, { variant: "outline", size: "sm", children: "Reset Password" })] })] }, user.id))) })) })] })] }) }));
}
