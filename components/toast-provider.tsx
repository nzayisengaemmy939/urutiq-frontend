"use client"

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastIdCounterRef = useRef(0)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${toastIdCounterRef.current++}`
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "success", title, description })
    },
    [addToast],
  )

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "error", title, description, duration: 8000 })
    },
    [addToast],
  )

  const warning = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "warning", title, description })
    },
    [addToast],
  )

  const info = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "info", title, description })
    },
    [addToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type]
          return (
            <div
              key={toast.id}
              className={`p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full ${toastStyles[toast.type]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold">{toast.title}</h4>
                  {toast.description && <p className="text-sm opacity-90 mt-1">{toast.description}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeToast(toast.id)}
                  className="h-6 w-6 p-0 hover:bg-black/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
