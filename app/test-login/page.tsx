"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"

export default function TestLoginPage() {
  console.log("🧪 TestLoginPage: Component rendering...")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🧪 TestLoginPage: Form submitted")
    console.log("🧪 TestLoginPage: Email:", email)
    console.log("🧪 TestLoginPage: Password:", password)
    
    setIsLoading(true)
    setMessage("")
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("🧪 TestLoginPage: Login successful")
      setMessage("✅ Login successful! (This is just a test)")
    } catch (error) {
      console.error("🧪 TestLoginPage: Login failed:", error)
      setMessage("❌ Login failed! (This is just a test)")
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
          <CardTitle className="text-2xl font-bold">🧪 Test Login</CardTitle>
          <CardDescription>
            Simple test login page to verify React is working
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-3 rounded-md text-center ${
              message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in (Test)"}
            </Button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            This is a test page to verify React functionality
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
