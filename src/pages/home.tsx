import { useAuth } from "../contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/dashboard")
      } else {
        navigate("/login")
      }
    }
  }, [isAuthenticated, isLoading, navigate])

  // Show loading while determining redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
