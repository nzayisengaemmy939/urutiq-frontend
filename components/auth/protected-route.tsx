"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { SkeletonCard } from "@/components/skeleton-card"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "accountant" | "auditor" | "employee"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user && requiredRole && user.role !== requiredRole) {
      // User doesn't have required role, redirect to unauthorized page
      router.push("/unauthorized")
    }
  }, [user, requiredRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-6">
          <SkeletonCard className="h-8 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} className="h-32" />
            ))}
          </div>
          <SkeletonCard className="h-96" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null // Will redirect to unauthorized
  }

  return <>{children}</>
}
