import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Eye, EyeOff, Lock, Mail, Brain, User, Building2, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../../lib/api";
const registerSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset, } = useForm({
        resolver: zodResolver(registerSchema),
    });
    const onSubmit = async (data) => {
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            const fullName = `${data.firstName} ${data.lastName}`.trim();
            const resp = await apiService.register({
                email: data.email,
                password: data.password,
                name: fullName,
                role: 'admin',
                companyName: data.companyName
            });
            if (resp.error)
                throw new Error(resp.error?.message || 'Registration failed');
            // Store company and tenant information if provided
            if (resp.companyId) {
                try {
                    localStorage.setItem('company_id', resp.companyId);
                    localStorage.setItem('company_name', resp.companyName || data.companyName);
                }
                catch { }
            }
            // Store tenant ID
            if (resp.tenantId) {
                try {
                    localStorage.setItem('tenant_id', resp.tenantId);
                }
                catch { }
            }
            setSuccess("Account created successfully! You can now sign in.");
            reset();
            setTimeout(() => navigate('/login'), 800);
        }
        catch (err) {
            setError(err.message || "Failed to create account. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 p-4", children: _jsxs(Card, { className: "w-full max-w-lg", children: [_jsxs(CardHeader, { className: "text-center space-y-2", children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center", children: _jsx(Brain, { className: "w-6 h-6 text-primary-foreground" }) }), _jsx(CardTitle, { className: "text-2xl font-bold", children: "Create your account" }), _jsx(CardDescription, { children: "Join UrutiIQ and start managing your accounting with AI" })] }), _jsxs(CardContent, { className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), success && (_jsx(Alert, { children: _jsx(AlertDescription, { children: success }) })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", children: "First Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "firstName", placeholder: "John", className: "pl-10", ...register("firstName"), disabled: isLoading })] }), errors.firstName && (_jsx("p", { className: "text-sm text-destructive", children: errors.firstName.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "lastName", placeholder: "Doe", className: "pl-10", ...register("lastName"), disabled: isLoading })] }), errors.lastName && (_jsx("p", { className: "text-sm text-destructive", children: errors.lastName.message }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "email", type: "email", placeholder: "john@company.com", className: "pl-10", ...register("email"), disabled: isLoading })] }), errors.email && (_jsx("p", { className: "text-sm text-destructive", children: errors.email.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "companyName", children: "Company Name" }), _jsxs("div", { className: "relative", children: [_jsx(Building2, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "companyName", placeholder: "Acme Corporation", className: "pl-10", ...register("companyName"), disabled: isLoading })] }), errors.companyName && (_jsx("p", { className: "text-sm text-destructive", children: errors.companyName.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone Number" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "phone", type: "tel", placeholder: "+1 (555) 123-4567", className: "pl-10", ...register("phone"), disabled: isLoading })] }), errors.phone && (_jsx("p", { className: "text-sm text-destructive", children: errors.phone.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "password", type: showPassword ? "text" : "password", placeholder: "Create a strong password", className: "pl-10 pr-10", ...register("password"), disabled: isLoading }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground", disabled: isLoading, children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] }), errors.password && (_jsx("p", { className: "text-sm text-destructive", children: errors.password.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "confirmPassword", type: showConfirmPassword ? "text" : "password", placeholder: "Confirm your password", className: "pl-10 pr-10", ...register("confirmPassword"), disabled: isLoading }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground", disabled: isLoading, children: showConfirmPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] }), errors.confirmPassword && (_jsx("p", { className: "text-sm text-destructive", children: errors.confirmPassword.message }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? "Creating account..." : "Create account" })] }), _jsxs("div", { className: "text-center text-sm text-muted-foreground", children: ["Already have an account?", " ", _jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Sign in" })] })] })] }) }));
}
