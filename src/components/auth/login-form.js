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
import { Eye, EyeOff, Lock, Mail, Brain, User, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
const demoLoginSchema = z.object({
    username: z.string().trim().min(1, "Username is required"),
    role: z.enum(["admin", "accountant", "auditor", "employee"]),
});
export function LoginForm() {
    console.log("🔐 LoginForm: Component rendering...");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDemoMode, setIsDemoMode] = useState(false);
    const { login, loginWithDemo } = useAuth();
    const navigate = useNavigate();
    const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const { register: registerDemo, handleSubmit: handleDemoSubmit, formState: { errors: demoErrors }, } = useForm({
        resolver: zodResolver(demoLoginSchema),
        defaultValues: { username: "", role: "admin" },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });
    const onLoginSubmit = async (data) => {
        console.log("🔐 LoginForm: Form submitted with data:", data);
        console.log("🔐 LoginForm: Preventing default form submission...");
        setIsLoading(true);
        setError("");
        try {
            console.log("🔐 LoginForm: Starting login process...");
            await login(data.email, data.password);
            console.log("✅ LoginForm: Login successful, redirecting to dashboard...");
            navigate("/dashboard");
        }
        catch (err) {
            console.error("❌ LoginForm: Login failed:", err);
            setError(err.message || "Invalid email or password. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    const onDemoSubmit = async (data) => {
        setIsLoading(true);
        setError("");
        try {
            const username = data.username.trim();
            await loginWithDemo(username, [data.role]);
            navigate("/dashboard");
        }
        catch (err) {
            setError(err.message || "Demo login failed. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center space-y-2", children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center", children: _jsx(Brain, { className: "w-6 h-6 text-primary-foreground" }) }), _jsx(CardTitle, { className: "text-2xl font-bold", children: "Welcome to UrutiIQ" }), _jsx(CardDescription, { children: "Sign in to your account to continue" })] }), _jsxs(CardContent, { className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), isDemoMode ? (_jsxs("form", { onSubmit: handleDemoSubmit(onDemoSubmit), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", children: "Username" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "username", type: "text", autoComplete: "off", spellCheck: false, placeholder: "Enter username (e.g., demo_user)", className: "pl-10", ...registerDemo("username"), disabled: isLoading })] }), demoErrors.username && (_jsx("p", { className: "text-sm text-destructive", children: demoErrors.username.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "role", children: "Role" }), _jsxs("div", { className: "relative", children: [_jsx(Building, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsxs("select", { ...registerDemo("role"), className: "w-full px-3 py-2 border border-input rounded-md bg-background", disabled: isLoading, children: [_jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "accountant", children: "Accountant" }), _jsx("option", { value: "auditor", children: "Auditor" }), _jsx("option", { value: "employee", children: "Employee" })] })] }), demoErrors.role && (_jsx("p", { className: "text-sm text-destructive", children: demoErrors.role.message }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? "Signing in..." : "Sign in with Demo" }), _jsx("div", { className: "text-center", children: _jsx("button", { type: "button", onClick: () => setIsDemoMode(false), className: "text-sm text-primary hover:underline", children: "Back to regular login" }) })] })) : (
                        /* Regular Login Form */
                        _jsxs("form", { onSubmit: (e) => {
                                console.log("🔐 LoginForm: Form onSubmit event triggered");
                                e.preventDefault();
                                console.log("🔐 LoginForm: Default form submission prevented");
                                handleLoginSubmit(onLoginSubmit)(e);
                            }, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "email", type: "email", placeholder: "Enter your email", className: "pl-10", ...registerLogin("email"), disabled: isLoading })] }), loginErrors.email && (_jsx("p", { className: "text-sm text-destructive", children: loginErrors.email.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" }), _jsx(Input, { id: "password", type: showPassword ? "text" : "password", placeholder: "Enter your password", className: "pl-10 pr-10", ...registerLogin("password"), disabled: isLoading }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground", disabled: isLoading, children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] }), loginErrors.password && (_jsx("p", { className: "text-sm text-destructive", children: loginErrors.password.message }))] }), _jsx("div", { className: "flex items-center justify-between", children: _jsx(Link, { to: "/auth/forgot-password", className: "text-sm text-primary hover:underline", children: "Forgot password?" }) }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? "Signing in..." : "Sign in" }), _jsx("div", { className: "text-center", children: _jsx("button", { type: "button", onClick: () => setIsDemoMode(true), className: "text-sm text-primary hover:underline", children: "Try demo login instead" }) })] })), _jsxs("div", { className: "text-center text-sm text-muted-foreground", children: ["Don't have an account?", " ", _jsx(Link, { to: "/register", className: "text-primary hover:underline", children: "Sign up" })] })] })] }) }));
}
