'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, Shield, CheckCircle, AlertCircle } from 'lucide-react'
// PaystackInline will be loaded dynamically

interface FormData {
  firstName: string
  lastName: string
  email: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  amount?: string
}

export default function DonationForm() {
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [frequency, setFrequency] = useState('one-time')
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  interface VerificationResult {
    amount: number
    donorEmail: string
  }
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)

  const presetAmounts = [25, 50, 100, 250, 500]
  const paystackRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  // Check for payment verification on mount
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const reference = urlParams.get('reference')
      const status = urlParams.get('status')

      if (reference && status === 'success') {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/donations/verify?reference=${reference}&status=${status}`)
          const data = await response.json()

          if (data.success) {
            setSuccess(true)
            setVerificationResult(data.donation)
            // Clear URL parameters
            window.history.replaceState({}, '', window.location.pathname)
          } else {
            setErrorMessage(data.error || 'Payment verification failed')
          }
        } catch {
          setErrorMessage('Failed to verify payment')
        } finally {
          setIsLoading(false)
        }
      }
    }

    checkPaymentStatus()
  }, [])

  // Load Paystack script
  const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (scriptLoadedRef.current) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.async = true
      script.onload = () => {
        scriptLoadedRef.current = true
        resolve()
      }
      script.onerror = () => {
        reject(new Error('Failed to load Paystack script'))
      }
      document.head.appendChild(script)
    })
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    const finalAmount = customAmount || amount

    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      newErrors.amount = 'Please select or enter a donation amount'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    setErrorMessage('')
  }

  const handlePayment = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const finalAmount = customAmount || amount
      
      // Initialize transaction on backend
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(finalAmount),
          frequency,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // Load Paystack and open payment modal
      await loadPaystackScript()

      const paystackOptions = {
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
        email: formData.email,
        amount: parseFloat(finalAmount) * 100, // Convert to kobo
        currency: 'USD',
        ref: data.reference,
        label: `${formData.firstName} ${formData.lastName}`,
        metadata: {
          frequency,
          firstName: formData.firstName,
          lastName: formData.lastName,
          donationId: data.donationId
        },
        callback: async (response: { reference: string }) => {
          setIsPaying(false)
          // Redirect to verification page
          window.location.href = `/api/donations/verify?reference=${response.reference}&status=success`
        },
        onClose: () => {
          setIsPaying(false)
          setErrorMessage('Payment window closed. Please try again.')
        }
      }

      setIsPaying(true)

      // @ts-expect-error Paystack is loaded dynamically
      if (window.PaystackPop) {
        // @ts-expect-error Paystack is loaded dynamically
        const paystack = new window.PaystackPop()
        paystack.newTransaction(paystackOptions)
      } else {
        throw new Error('Paystack not loaded properly')
      }

    } catch (error) {
      setIsLoading(false)
      setIsPaying(false)
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    }
  }

  const resetForm = () => {
    setAmount('')
    setCustomAmount('')
    setFrequency('one-time')
    setFormData({
      firstName: '',
      lastName: '',
      email: ''
    })
    setErrors({})
    setSuccess(false)
    setErrorMessage('')
    setVerificationResult(null)
  }

  // Show success message after successful donation
  if (success) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-green-700">Thank You!</h2>
          <p className="text-gray-600 mb-4">
            Your generous donation of ${verificationResult?.amount || customAmount || amount} has been received.
          </p>
          <p className="text-gray-600">
            A receipt has been sent to <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-6">
            Redirecting to homepage in 5 seconds...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Heart className="h-12 w-12 text-accent mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Support Our Ministry</h2>
        <p className="text-gray-600">
          Your generous gift helps us spread God&apos;s word and serve our community
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Amount (USD) <span className="text-red-500">*</span>
          </label>
          {errors.amount && (
            <p className="text-sm text-red-500 mb-2">{errors.amount}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setAmount(amt.toString())
                  setCustomAmount('')
                  setErrors(prev => ({ ...prev, amount: undefined }))
                }}
                className={`py-3 px-4 rounded-lg border-2 text-lg font-medium transition duration-300 ${
                  amount === amt.toString()
                    ? 'border-accent bg-red-50 text-accent'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
          
          <div className="mt-4">
            <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Or enter custom amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                id="customAmount"
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setAmount('')
                  setErrors(prev => ({ ...prev, amount: undefined }))
                }}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Frequency
          </label>
          <div className="flex space-x-4">
            {['one-time', 'monthly', 'weekly'].map((freq) => (
              <label
                key={freq}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="frequency"
                  value={freq}
                  checked={frequency === freq}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="h-4 w-4 text-accent focus:ring-accent"
                />
                <span className="capitalize">{freq.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Donor Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="John"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Doe"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="john@example.com"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Security & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="h-5 w-5 mr-2" />
            Secure & Encrypted via Paystack
          </div>
          <button
            type="button"
            onClick={handlePayment}
            disabled={isLoading || isPaying}
            className={`btn-primary px-8 w-full sm:w-auto ${
              isLoading || isPaying ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : isPaying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Opening Payment...
              </span>
            ) : (
              `Give $${customAmount || amount || '0'}`
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          All donations are tax-deductible. You will receive a receipt via email.
        </p>
      </div>
    </div>
  )
}

