"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Mail, Brain, User, Building } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const demoLoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  role: z.enum(["admin", "accountant", "auditor", "employee"]),
})

type LoginFormData = z.infer<typeof loginSchema>
type DemoLoginFormData = z.infer<typeof demoLoginSchema>

export function LoginForm() {
  console.log("🔐 LoginForm: Component rendering...")
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDemoMode, setIsDemoMode] = useState(false)
  const { login, loginWithDemo } = useAuth()
  const router = useRouter()

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerDemo,
    handleSubmit: handleDemoSubmit,
    formState: { errors: demoErrors },
  } = useForm<DemoLoginFormData>({
    resolver: zodResolver(demoLoginSchema),
    defaultValues: { username: "", role: "admin" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    console.log("🔐 LoginForm: Form submitted with data:", data)
    console.log("🔐 LoginForm: Preventing default form submission...")
    
    setIsLoading(true)
    setError("")
    
    try {
      console.log("🔐 LoginForm: Starting login process...")
      await login(data.email, data.password)
      console.log("✅ LoginForm: Login successful, redirecting to dashboard...")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("❌ LoginForm: Login failed:", err)
      setError(err.message || "Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const onDemoSubmit = async (data: DemoLoginFormData) => {
    setIsLoading(true)
    setError("")
    
    try {
      const username = data.username.trim()
      await loginWithDemo(username, [data.role])
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Demo login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to UrutiIQ</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Demo Login Form */}
          {isDemoMode ? (
            <form onSubmit={handleDemoSubmit(onDemoSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Enter username (e.g., demo_user)"
                    className="pl-10"
                    {...registerDemo("username")}
                    disabled={isLoading}
                  />
                </div>
                {demoErrors.username && (
                  <p className="text-sm text-destructive">{demoErrors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    {...registerDemo("role")}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    disabled={isLoading}
                  >
                    <option value="admin">Admin</option>
                    <option value="accountant">Accountant</option>
                    <option value="auditor">Auditor</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                {demoErrors.role && (
                  <p className="text-sm text-destructive">{demoErrors.role.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in with Demo"}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsDemoMode(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Back to regular login
                </button>
              </div>
            </form>
          ) : (
            /* Regular Login Form */
            <form 
              onSubmit={(e) => {
                console.log("🔐 LoginForm: Form onSubmit event triggered")
                e.preventDefault()
                console.log("🔐 LoginForm: Default form submission prevented")
                handleLoginSubmit(onLoginSubmit)(e)
              }} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...registerLogin("email")}
                    disabled={isLoading}
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    {...registerLogin("password")}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsDemoMode(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Try demo login instead
                </button>
              </div>
            </form>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
