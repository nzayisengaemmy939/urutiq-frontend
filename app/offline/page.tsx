"use client"

import { Wifi, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Wifi className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You're Offline
          </h1>
          <p className="text-gray-600">
            It looks like you're not connected to the internet. 
            Please check your connection and try again.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleRetry}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>Some features may still be available offline:</p>
            <ul className="mt-2 space-y-1">
              <li>• View cached pages</li>
              <li>• Access recent data</li>
              <li>• Prepare entries for sync</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            UrutiIQ - Your data will sync when you're back online
          </p>
        </div>
      </div>
    </div>
  )
}
