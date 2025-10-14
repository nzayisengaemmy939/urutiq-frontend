import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/auth-context"
import { SkeletonCard } from "../skeleton-card"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "accountant" | "auditor" | "employee"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const hasRequiredRole = (): boolean => {
    if (!requiredRole) return true
    if (user?.role === requiredRole) return true
    // Also check roles from the JWT to support multi-role users
    try {
      const token = localStorage.getItem('auth_token') || ''
      const [, payloadB64] = token.split('.')
      if (!payloadB64) return false
      const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
      const roles: string[] = Array.isArray(json?.roles) ? json.roles : []
      return roles.includes(requiredRole)
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login")
    }
  }, [isLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (user && requiredRole && !hasRequiredRole()) {
      // User doesn't have required role, redirect to unauthorized page
      navigate("/unauthorized")
    }
  }, [user, requiredRole, navigate])

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

  if (requiredRole && !hasRequiredRole()) {
    return null // Will redirect to unauthorized
  }

  return <>{children}</>
}
