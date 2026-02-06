'use client'
import { useState } from 'react'
import { Heart, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  cardNumber: string
  expiry: string
  cvc: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  amount?: string
  cardNumber?: string
  expiry?: string
  cvc?: string
}

export default function DonationForm() {
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [frequency, setFrequency] = useState('one-time')
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const presetAmounts = [25, 50, 100, 250, 500]

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const finalAmount = customAmount || amount
      
      const donationData = {
        amount: parseFloat(finalAmount),
        frequency,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        timestamp: new Date().toISOString(),
      }

      // Submit to the donations API
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      })

      if (!response.ok) {
        throw new Error('Failed to process donation. Please try again.')
      }

      // Success - show confirmation and reset form
      setSuccess(true)
      
      // Reset form after delay
      setTimeout(() => {
        resetForm()
      }, 5000)

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setCustomAmount('')
    setFrequency('one-time')
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      cardNumber: '',
      expiry: '',
      cvc: ''
    })
    setErrors({})
    setSuccess(false)
    setErrorMessage('')
  }

  // Show success message after successful donation
  if (success) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-green-700">Thank You!</h2>
          <p className="text-gray-600 mb-4">
            Your generous donation of ${customAmount || amount} has been received.
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
          Your generous gift helps us spread God's word and serve our community
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Payment Details */}
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

          {/* Credit Card Fields (simplified - for display only) */}
          <div className="border-t pt-4">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium">Payment Details</span>
            </div>
            <input
              id="cardNumber"
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="Card Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                id="expiry"
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className="px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                id="cvc"
                type="text"
                name="cvc"
                value={formData.cvc}
                onChange={handleInputChange}
                placeholder="CVC"
                className="px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Security & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="h-5 w-5 mr-2" />
            Secure & Encrypted
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`btn-primary px-8 w-full sm:w-auto ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
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
            ) : (
              `Give $${customAmount || amount || '0'}`
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          All donations are tax-deductible. You will receive a receipt via email.
        </p>
      </form>
    </div>
  )
}
