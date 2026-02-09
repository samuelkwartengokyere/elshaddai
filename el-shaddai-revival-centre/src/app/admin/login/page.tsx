'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, Mail, Loader2, AlertCircle, Info } from 'lucide-react'

interface LoginError {
  message: string
  code?: string
}

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)
  const [showDevInfo, setShowDevInfo] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        // Use window.location for a full page reload to ensure cookies and user state are properly set
        window.location.href = '/admin'
      } else {
        // Handle specific error codes
        if (data.code === 'AUTH_003') {
          setError({
            message: 'Your account has been deactivated. Please contact a super administrator.',
            code: data.code
          })
        } else if (data.code === 'AUTH_004') {
          setError({
            message: 'Service temporarily unavailable. Please try again later.',
            code: data.code
          })
        } else {
          setError({
            message: data.error || 'Login failed. Please check your credentials.',
            code: data.code
          })
        }
      }
    } catch (err) {
      setError({
        message: 'An error occurred. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
      })
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image
              src="https://pentecost.ca/wp-content/uploads/2025/03/The-Church-Pentecost-Logo-1.png"
              alt="Church Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-1">El-Shaddai Revival Centre</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-medium">{error.message}</span>
              {error.code && (
                <span className="text-xs text-red-500 block mt-1">
                  Error code: {error.code}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Development mode info */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowDevInfo(!showDevInfo)}
            className="flex items-center text-blue-700 text-sm hover:text-blue-800"
          >
            <Info className="h-4 w-4 mr-2" />
            {showDevInfo ? 'Hide' : 'Show'} development info
          </button>
          {showDevInfo && (
            <div className="mt-2 text-xs text-blue-600">
              <p>Development credentials:</p>
              <p className="font-mono mt-1">admin@elshaddai.com / admin123</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Restricted access. Authorized personnel only.</p>
        </div>
      </div>
    </div>
  )
}

