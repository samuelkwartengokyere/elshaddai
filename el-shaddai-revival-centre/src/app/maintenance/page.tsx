'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Settings, Loader2, AlertTriangle } from 'lucide-react'

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || undefined

  useEffect(() => {
    // Simulate a brief loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            System Under Maintenance
          </h1>
          <p className="text-gray-600">
            {message || 'We are currently performing scheduled maintenance. Please check back soon.'}
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Settings className="h-4 w-4 mr-2" />
            <span>El-Shaddai Revival Centre</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            We apologize for any inconvenience caused.
          </p>
        </div>
      </div>
    </div>
  )
}

