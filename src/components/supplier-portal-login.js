import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
export function SupplierPortalLogin({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // For demo purposes, we'll use a simple check
            // In a real implementation, you would have proper supplier authentication
            if (email && password) {
                // Mock supplier login - in real app, this would be a proper API call
                const mockSupplier = {
                    id: 'supplier-demo-1',
                    name: 'Demo Supplier Inc.',
                    email: email,
                    role: 'supplier',
                    isActive: true
                };
                // Store supplier info in localStorage for demo
                localStorage.setItem('supplier_info', JSON.stringify(mockSupplier));
                // Use the regular login flow but with supplier role
                await login(email, password);
                onSuccess?.();
            }
            else {
                setError('Please enter both email and password');
            }
        }
        catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsx(Building2, { className: "mx-auto h-12 w-12 text-blue-600" }), _jsx("h2", { className: "mt-6 text-3xl font-extrabold text-gray-900", children: "Supplier Portal" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Access your supplier dashboard and manage your account" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Sign in to your account" }), _jsx(CardDescription, { children: "Enter your supplier credentials to access the portal" })] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email address" }), _jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "supplier@example.com", required: true, disabled: isLoading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter your password", required: true, disabled: isLoading }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent", onClick: () => setShowPassword(!showPassword), disabled: isLoading, children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Signing in..."] })) : ('Sign in') })] }), _jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "px-2 bg-white text-gray-500", children: "Demo Credentials" }) })] }), _jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-600 mb-2", children: "For demo purposes, use any email and password:" }), _jsxs("div", { className: "text-xs text-gray-500 space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " supplier@demo.com"] }), _jsxs("p", { children: [_jsx("strong", { children: "Password:" }), " demo123"] })] })] })] })] })] }), _jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["Don't have an account?", ' ', _jsx("a", { href: "#", className: "font-medium text-blue-600 hover:text-blue-500", children: "Contact your account manager" })] }) })] }) }));
}
