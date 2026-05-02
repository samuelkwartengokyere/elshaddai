'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, Shield, CheckCircle, AlertCircle, Globe, 
  CreditCard, Smartphone, Building2, ArrowRight, Loader2, Wallet
} from 'lucide-react'
import { 
  formatCurrency, 
  getCurrencySymbol, 
  currencyOptions,
  filterGiveCurrencyOptions,
  resolveDefaultGiveCurrency,
  getGivePaymentMethods,
} from '@/lib/currency'
import { 
  PaymentChannel, 
  Currency,
  PaymentMethodOption,
  PaymentMethodType
} from '@/types/donation'

// Preset amounts for each currency (in USD equivalent)
const presetAmountsUSD = [25, 50, 100, 250, 500]

// Helper to derive payment channel from payment method
const getPaymentChannelFromMethod = (methodId: PaymentMethodType): PaymentChannel => {
  const methodChannelMap: Record<PaymentMethodType, PaymentChannel> = {
    card: 'paystack',
    mobile_money: 'paystack',
    apple_pay: 'paystack',
    bank_transfer: 'paystack',
  }
  return methodChannelMap[methodId] || 'paystack'
}

// Get preset amounts for selected currency
const getPresetAmounts = (currency: Currency): number[] => {
  return presetAmountsUSD.map(usd => {
    const rate = currencyOptions.find(c => c.code === currency)?.exchangeRateToUSD || 1
    return Math.round((usd / rate) * 100) / 100
  })
}

interface FormData {
  // Amount
  amount: string
  customAmount: string
  currency: Currency
  
  // Donor Info
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  
  // Payment
  paymentMethod: PaymentMethodType
  paymentChannel: PaymentChannel
  
  // Donation Details
  donationType: string
  isAnonymous: boolean
  notes: string
  
  // Mobile Money specific
  mobileMoneyProvider?: string

  // Bank transfer (donor’s own bank — recorded before Paystack checkout)
  bankName: string
  bankAccountNumber: string
  accountHolderName: string
}

interface FormErrors {
  amount?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  country?: string
  paymentChannel?: string
  mobileMoneyProvider?: string
  bankName?: string
  bankAccountNumber?: string
  accountHolderName?: string
}

export default function InternationalDonationForm() {
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    customAmount: '',
    currency: resolveDefaultGiveCurrency(),
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    paymentMethod: 'card',
    paymentChannel: 'paystack',
    donationType: 'general',
    isAnonymous: false,
    notes: '',
    // Method-specific fields
    mobileMoneyProvider: '',
    bankName: '',
    bankAccountNumber: '',
    accountHolderName: '',
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodOption | null>(null)
  const [verificationResult, setVerificationResult] = useState<unknown>(null)

  // Detect user's likely currency based on locale
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Check for URL parameter first
        const urlParams = new URLSearchParams(window.location.search)
        const currencyParam = urlParams.get('currency')
        const opts = filterGiveCurrencyOptions()

        if (currencyParam && opts.some((c) => c.code === currencyParam)) {
          setFormData((prev) => ({ ...prev, currency: currencyParam as Currency }))
          return
        }

        const locale = navigator.language
        const localeToCurrency: Record<string, Currency> = {
          'en-US': 'USD',
          'en-GB': 'GBP',
          'en-GH': 'GHS',
          'en-NG': 'NGN',
          'en-KE': 'KES',
          'en-ZA': 'ZAR',
          fr: 'EUR',
          de: 'EUR',
        }

        let detectedCurrency =
          localeToCurrency[locale] ||
          currencyOptions.find((c) => locale.includes(c.code.toLowerCase()))?.code ||
          resolveDefaultGiveCurrency()

        if (!opts.some((o) => o.code === detectedCurrency)) {
          detectedCurrency = resolveDefaultGiveCurrency()
        }

        setFormData((prev) => ({ ...prev, currency: detectedCurrency }))
      } catch {
        setFormData((prev) => ({ ...prev, currency: resolveDefaultGiveCurrency() }))
      }
    }

    detectCurrency()
  }, [])

  // If currency changes and the current method is not offered for that currency, switch to the first available
  useEffect(() => {
    const methods = getGivePaymentMethods(formData.currency)
    if (methods.length === 0) return

    setFormData((prev) => {
      const stillValid = methods.some((m) => m.id === prev.paymentMethod)
      if (stillValid) return prev
      return {
        ...prev,
        paymentMethod: methods[0].id,
        paymentChannel: getPaymentChannelFromMethod(methods[0].id),
      }
    })
  }, [formData.currency])

  // Keep the highlighted method card in sync with currency + selected method id
  useEffect(() => {
    const methods = getGivePaymentMethods(formData.currency)
    if (methods.length === 0) {
      setSelectedPaymentMethod(null)
      return
    }
    const match = methods.find((m) => m.id === formData.paymentMethod)
    setSelectedPaymentMethod(match ?? methods[0])
  }, [formData.currency, formData.paymentMethod])

  // Check for payment verification on mount
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const reference = urlParams.get('reference') || urlParams.get('trxref')
      const status = urlParams.get('status')

      if (!reference) return

      if (status === 'failed' || status === 'abandoned' || status === 'cancelled') {
        setErrorMessage('Payment was not completed.')
        window.history.replaceState({}, '', window.location.pathname)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/donations/verify?reference=${encodeURIComponent(reference)}`
        )
        const data = await response.json()

        if (data.success) {
          setSuccess(true)
          setVerificationResult(data.donation)
          window.history.replaceState({}, '', window.location.pathname)
        } else {
          setErrorMessage(data.error || 'Payment verification failed')
          window.history.replaceState({}, '', window.location.pathname)
        }
      } catch {
        setErrorMessage('Failed to verify payment')
      } finally {
        setIsLoading(false)
      }
    }

    checkPaymentStatus()
  }, [])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\d\s\-+()]{7,20}$/
    return phoneRegex.test(phone)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    const finalAmount = formData.customAmount || formData.amount

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

    if (formData.paymentMethod === 'mobile_money' && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for mobile money'
    }

    // Mobile Money provider validation
    if (formData.paymentMethod === 'mobile_money' && !formData.mobileMoneyProvider) {
      newErrors.mobileMoneyProvider = 'Please select your mobile money provider'
    }

    if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.bankName.trim()) {
        newErrors.bankName = 'Bank name is required'
      }
      const acct = formData.bankAccountNumber.replace(/\s/g, '')
      if (!acct) {
        newErrors.bankAccountNumber = 'Bank account number is required'
      } else if (!/^\d{8,18}$/.test(acct)) {
        newErrors.bankAccountNumber = 'Enter 8–18 digits (numbers only, spaces optional)'
      }
      if (!formData.accountHolderName.trim()) {
        newErrors.accountHolderName = 'Account holder full name is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

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
      const finalAmount = formData.customAmount || formData.amount

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency: formData.currency,
          frequency: 'one-time',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          donationType: formData.donationType,
          paymentChannel: formData.paymentChannel,
          paymentMethod: formData.paymentMethod,
          isAnonymous: formData.isAnonymous,
          notes: formData.notes,
          mobileMoneyProvider:
            formData.paymentMethod === 'mobile_money' ? formData.mobileMoneyProvider : undefined,
          bankName: formData.paymentMethod === 'bank_transfer' ? formData.bankName : undefined,
          bankAccountNumber:
            formData.paymentMethod === 'bank_transfer' ? formData.bankAccountNumber : undefined,
          accountHolderName:
            formData.paymentMethod === 'bank_transfer' ? formData.accountHolderName : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      const checkoutUrl = data.authorization_url as string | undefined
      if (!checkoutUrl) {
        throw new Error('Checkout is unavailable. Please try again or contact us.')
      }

      window.location.assign(checkoutUrl)
    } catch (error) {
      setIsLoading(false)
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      customAmount: '',
      currency: resolveDefaultGiveCurrency(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      paymentMethod: 'card',
      paymentChannel: 'paystack',
      donationType: 'general',
      isAnonymous: false,
      notes: '',
      // Method-specific fields
      mobileMoneyProvider: '',
      bankName: '',
      bankAccountNumber: '',
      accountHolderName: '',
    })
    setErrors({})
    setSuccess(false)
    setErrorMessage('')
    setVerificationResult(null)
  }

  const presetAmounts = getPresetAmounts(formData.currency)

  // Show success message (use API donation after Paystack redirect — form state may be reset)
  if (success) {
    const d = verificationResult as {
      amount?: number
      currency?: string
      donor_email?: string
    } | null
    const thankAmount = typeof d?.amount === 'number' ? d.amount : parseFloat(formData.customAmount || formData.amount || '0')
    const thankCurrency = ((d?.currency || formData.currency || 'USD') as Currency)
    const thankEmail = d?.donor_email || formData.email

    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-green-700">Thank You!</h2>
          
          <p className="text-gray-600 mb-4">
            Your generous donation of {formatCurrency(thankAmount, thankCurrency)} has been received.
          </p>
          
          {thankEmail ? (
            <p className="text-gray-600">
              A receipt has been sent to <strong>{thankEmail}</strong>
            </p>
          ) : null}
          
          <button
            type="button"
            onClick={resetForm}
            className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white px-8 py-3.5 font-sans font-semibold text-primary shadow-sm transition hover:bg-primary hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
          >
            <Heart className="h-4 w-4" aria-hidden />
            Make another gift
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <Heart className="h-12 w-12 text-accent mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Support Our Ministry</h2>
        <p className="text-gray-600">
          Your generous gift helps us spread God&apos;s word and serve our community
        </p>
        
        {/* Currency Selector */}
        <div className="mt-6 flex justify-center">
          <div className="flex flex-wrap justify-center gap-2">
            {filterGiveCurrencyOptions().map((currency) => (
              <button
                key={currency.code}
                onClick={() => setFormData(prev => ({ ...prev, currency: currency.code }))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 ${
                  formData.currency === currency.code
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {currency.symbol} {currency.code}
              </button>
            ))}
          </div>
        </div>
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
            Select Amount {getCurrencySymbol(formData.currency)} <span className="text-red-500">*</span>
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
                  setFormData(prev => ({
                    ...prev,
                    amount: amt.toString(),
                    customAmount: ''
                  }))
                  setErrors(prev => ({ ...prev, amount: undefined }))
                }}
                className={`py-3 px-4 rounded-lg border-2 text-lg font-medium transition duration-300 ${
                  formData.amount === amt.toString() && !formData.customAmount
                    ? 'border-accent bg-red-50 text-accent'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {getCurrencySymbol(formData.currency)}{amt.toLocaleString()}
              </button>
            ))}
          </div>
          
          <div className="mt-4">
            <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Or enter custom amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">
                {getCurrencySymbol(formData.currency)}
              </span>
              <input
                id="customAmount"
                type="number"
                name="customAmount"
                value={formData.customAmount}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    customAmount: e.target.value,
                    amount: ''
                  }))
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

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {getGivePaymentMethods(formData.currency).map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ 
                    ...prev, 
                    paymentMethod: method.id,
                    paymentChannel: getPaymentChannelFromMethod(method.id)
                  }))
                  setSelectedPaymentMethod(method)
                  setErrors(prev => ({ ...prev, paymentChannel: undefined }))
                }}
                className={`p-4 rounded-lg border-2 text-left transition duration-300 ${
                  formData.paymentMethod === method.id
                    ? 'border-accent bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2 flex items-center justify-center sm:justify-start min-h-[2rem]">
                  {method.id === 'apple_pay' ? (
                    <Wallet className="h-8 w-8 text-gray-900" aria-hidden />
                  ) : (
                    <span aria-hidden>{method.icon}</span>
                  )}
                </div>
                <div className="font-medium text-sm">{method.name}</div>
                <div className="text-xs text-gray-500">{method.fees}</div>
              </button>
            ))}
          </div>
          
          {/* Payment Method Info */}
          {selectedPaymentMethod && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-medium">{selectedPaymentMethod.name}</p>
              <p>{selectedPaymentMethod.description}</p>
              {selectedPaymentMethod.processingTime && (
                <p className="text-xs mt-1">Processing: {selectedPaymentMethod.processingTime}</p>
              )}
            </div>
          )}
          
          {errors.paymentChannel && (
            <p className="text-sm text-red-500 mt-2">{errors.paymentChannel}</p>
          )}
        </div>

        {/* Method-Specific Form Sections */}
        
        {/* Mobile Money Provider Selection */}
        {formData.paymentMethod === 'mobile_money' && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-4 flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Mobile Money Details
            </h4>
            <div>
              <label htmlFor="mobileMoneyProvider" className="block text-sm font-medium text-gray-700 mb-2">
                Select Provider <span className="text-red-500">*</span>
              </label>
              <select
                id="mobileMoneyProvider"
                name="mobileMoneyProvider"
                value={formData.mobileMoneyProvider}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.mobileMoneyProvider ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose your mobile money provider</option>
                <option value="mpesa">M-Pesa</option>
                <option value="airtel_money">Airtel Money</option>
                <option value="tigo_cash">Tigo Cash</option>
                <option value="vodafone_cash">Vodafone Cash</option>
                <option value="mtn_money">MTN Mobile Money</option>
                <option value="orangemoney">Orange Money</option>
              </select>
              {errors.mobileMoneyProvider && (
                <p className="mt-1 text-sm text-red-500">{errors.mobileMoneyProvider}</p>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              You will be redirected to Paystack to complete mobile money payment.
            </p>
          </div>
        )}

        {/* Apple Pay */}
        {formData.paymentMethod === 'apple_pay' && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <Wallet className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-medium text-gray-900">Apple Pay</p>
                <p className="mt-1">
                  You will be redirected to Paystack checkout. Apple Pay appears when your device, browser (often Safari), bank, and currency are supported.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bank transfer — collect donor bank details, then Paystack checkout */}
        {formData.paymentMethod === 'bank_transfer' && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" aria-hidden />
              Your bank details
            </h4>
            <p className="text-sm text-gray-700 mb-4">
              Enter the bank account you will pay from. We store this with your gift for our records; Paystack may ask you
              to confirm or complete payment in their secure checkout.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                  Bank name <span className="text-red-500">*</span>
                </label>
                <input
                  id="bankName"
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ghana Commercial Bank"
                  autoComplete="organization"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.bankName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bankName ? <p className="mt-1 text-sm text-red-500">{errors.bankName}</p> : null}
              </div>
              <div>
                <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Bank account number <span className="text-red-500">*</span>
                </label>
                <input
                  id="bankAccountNumber"
                  type="text"
                  name="bankAccountNumber"
                  inputMode="numeric"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Digits only (8–18)"
                  autoComplete="off"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.bankAccountNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bankAccountNumber ? (
                  <p className="mt-1 text-sm text-red-500">{errors.bankAccountNumber}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Account holder full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="accountHolderName"
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Name exactly as on the bank account"
                  autoComplete="name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.accountHolderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.accountHolderName ? (
                  <p className="mt-1 text-sm text-red-500">{errors.accountHolderName}</p>
                ) : null}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              Next you will open Paystack to authorise or complete the bank payment for this amount.
            </p>
          </div>
        )}

        {/* Card — Paystack hosted checkout */}
        {formData.paymentMethod === 'card' && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="h-5 w-5 mr-2 shrink-0" aria-hidden />
              You will be redirected to Paystack to enter your card details securely.
            </div>
          </div>
        )}

        {/* Donor Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Your Information</h3>
          
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone {formData.paymentMethod === 'mobile_money' && <span className="text-red-500">*</span>}
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1234567890"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent border-gray-300"
              >
                <option value="">Select your country</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="GH">Ghana</option>
                <option value="NG">Nigeria</option>
                <option value="KE">Kenya</option>
                <option value="ZA">South Africa</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Donation Type */}
          <div>
            <label htmlFor="donationType" className="block text-sm font-medium text-gray-700 mb-2">
              Donation Type
            </label>
            <select
              id="donationType"
              name="donationType"
              value={formData.donationType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent border-gray-300"
            >
              <option value="general">General Fund</option>
              <option value="tithe">Tithe</option>
              <option value="missions">Missions</option>
              <option value="building">Building Fund</option>
              <option value="benevolence">Benevolence</option>
              <option value="youth">Youth Ministry</option>
              <option value="children">Children&apos;s Ministry</option>
              <option value="outreach">Community Outreach</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Anonymous Option */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              className="h-4 w-4 text-accent focus:ring-accent rounded"
            />
            <span className="text-gray-700">Make this donation anonymous</span>
          </label>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any special instructions or dedications..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent border-gray-300"
            />
          </div>
        </div>

        {/* Security & Submit */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="h-5 w-5" aria-hidden />
              </div>
              <p>
                <span className="font-medium text-gray-800">Secure checkout</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
                  Encrypted via Paystack
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={isLoading}
              className={`
                group relative isolate w-full cursor-pointer overflow-hidden rounded-2xl px-8 py-4 text-center font-sans font-semibold
                text-white shadow-lg shadow-primary/25 transition duration-300 ease-out
                sm:w-auto sm:min-w-[16rem]
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:ring-offset-2
                disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none
                ${!isLoading ? 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0' : ''}
              `}
            >
              <span
                className="absolute inset-0 bg-gradient-to-r from-primary via-[#0a2a7a] to-secondary"
                aria-hidden
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100"
                aria-hidden
              />
              <span className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                    <span className="text-base tracking-wide">Redirecting to Paystack…</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 shrink-0 opacity-95 drop-shadow-sm" aria-hidden />
                    <span className="text-base sm:text-lg tracking-wide">
                      Give{' '}
                      <span className="tabular-nums">
                        {getCurrencySymbol(formData.currency)}
                        {(() => {
                          const raw = formData.customAmount || formData.amount
                          const n = parseFloat(raw || '')
                          return Number.isFinite(n) && n > 0 ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
                        })()}
                      </span>
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 transition group-hover:bg-white/25">
                      <ArrowRight className="h-5 w-5 -translate-x-px transition group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            All donations are tax-deductible. You will receive a receipt via email.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Gifts in Ghana Cedis (₵) or US Dollars ($), with card, mobile money, Apple Pay, or bank on Paystack.
          </p>
        </div>
      </div>
    </div>
  )
}
