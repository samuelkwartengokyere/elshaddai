'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Heart, Shield, CheckCircle, AlertCircle, Globe, 
  CreditCard, Smartphone, Building2, ArrowRight, Loader2 
} from 'lucide-react'
import { 
  formatCurrency, 
  getCurrencySymbol, 
  currencyOptions, 
  paymentMethodOptions,
  bankTransferDetails,
  getAvailablePaymentMethods 
} from '@/lib/currency'
import { 
  PaymentChannel, 
  DonationFrequency, 
  Currency,
  PaymentMethodOption,
  PaymentMethodType
} from '@/types/donation'

// Preset amounts for each currency (in USD equivalent)
const presetAmountsUSD = [25, 50, 100, 250, 500]

// Helper to derive payment channel from payment method
const getPaymentChannelFromMethod = (methodId: PaymentMethodType): PaymentChannel => {
  const methodChannelMap: Record<PaymentMethodType, PaymentChannel> = {
    card: 'paystack', // Card payments via Paystack
    mobile_money: 'paystack',
    bank_transfer: 'manual',
    ussd: 'paystack',
    qr_code: 'paystack',
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
  
  // Frequency
  frequency: DonationFrequency
  
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
  
  // Bank Transfer specific
  accountHolderName?: string
  bankName?: string
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
  accountHolderName?: string
  bankName?: string
}

export default function InternationalDonationForm() {
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    customAmount: '',
    currency: 'USD',
    frequency: 'one-time',
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
    accountHolderName: '',
    bankName: '',
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodOption | null>(null)
  const [verificationResult, setVerificationResult] = useState<unknown>(null)
  
  const scriptLoadedRef = useRef(false)

  // Detect user's likely currency based on locale
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Check for URL parameter first
        const urlParams = new URLSearchParams(window.location.search)
        const currencyParam = urlParams.get('currency')
        if (currencyParam && currencyOptions.some(c => c.code === currencyParam)) {
          setFormData(prev => ({ ...prev, currency: currencyParam as Currency }))
          return
        }

        // Try to detect from browser
        const locale = navigator.language
        const localeToCurrency: Record<string, Currency> = {
          'en-US': 'USD',
          'en-GB': 'GBP',
          'en-GH': 'GHS',
          'en-NG': 'NGN',
          'en-KE': 'KES',
          'en-ZA': 'ZAR',
          'fr': 'EUR',
          'de': 'EUR',
        }
        
        const detectedCurrency = localeToCurrency[locale] || 
          currencyOptions.find(c => locale.includes(c.code.toLowerCase()))?.code || 'USD'
        
        setFormData(prev => ({ ...prev, currency: detectedCurrency }))
      } catch {
        // Default to USD
        setFormData(prev => ({ ...prev, currency: 'USD' }))
      }
    }

    detectCurrency()
  }, [])

  // Update available payment methods when currency changes
  useEffect(() => {
    const methods = getAvailablePaymentMethods(formData.currency)
    if (methods.length > 0) {
      setSelectedPaymentMethod(methods[0])
    }
  }, [formData.currency])

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

    // Phone required for mobile money, USSD, QR code
    if (['mobile_money', 'ussd', 'qr_code'].includes(formData.paymentMethod) && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for this payment method'
    }

    // Mobile Money provider validation
    if (formData.paymentMethod === 'mobile_money' && !formData.mobileMoneyProvider) {
      newErrors.mobileMoneyProvider = 'Please select your mobile money provider'
    }

    // Bank Transfer validation
    if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.accountHolderName?.trim()) {
        newErrors.accountHolderName = 'Account holder name is required'
      }
      if (!formData.bankName?.trim()) {
        newErrors.bankName = 'Bank name is required'
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
      const amountUSD = parseFloat(finalAmount)

      // For manual bank transfers, just create a record
      if (formData.paymentChannel === 'bank_transfer' || formData.paymentChannel === 'manual') {
        const response = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalAmount,
            currency: formData.currency,
            frequency: formData.frequency,
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
            // Method-specific fields
            accountHolderName: formData.accountHolderName,
            bankName: formData.bankName,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to record donation')
        }

        setSuccess(true)
        setShowBankDetails(true)
        setVerificationResult(data)
        return
      }

      // For Paystack payments (card, mobile money, USSD, etc.)
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency: formData.currency,
          frequency: formData.frequency,
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
          // Method-specific fields
          mobileMoneyProvider: formData.paymentMethod === 'mobile_money' ? formData.mobileMoneyProvider : undefined,
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
        amount: parseFloat(finalAmount) * 100, // Convert to smallest unit
        currency: formData.currency,
        ref: data.reference,
        label: `${formData.firstName} ${formData.lastName}`,
        metadata: {
          frequency: formData.frequency,
          firstName: formData.firstName,
          lastName: formData.lastName,
          donationId: data.donationId,
          paymentChannel: formData.paymentChannel,
        },
        callback: (response: { reference: string }) => {
          setIsProcessing(false)
          window.location.href = `/api/donations/verify?reference=${response.reference}&status=success`
        },
        onClose: () => {
          setIsProcessing(false)
          setErrorMessage('Payment window closed. Please try again.')
        }
      }

      setIsProcessing(true)

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
      setIsProcessing(false)
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      customAmount: '',
      currency: 'USD',
      frequency: 'one-time',
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
      accountHolderName: '',
      bankName: '',
    })
    setErrors({})
    setSuccess(false)
    setErrorMessage('')
    setVerificationResult(null)
    setShowBankDetails(false)
  }

  const presetAmounts = getPresetAmounts(formData.currency)

  // Show success message
  if (success) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-green-700">Thank You!</h2>
          
          {showBankDetails ? (
            <div className="text-left bg-gray-50 p-6 rounded-lg mt-4">
              <h3 className="text-xl font-bold mb-4">Bank Transfer Instructions</h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>Bank:</strong> {bankTransferDetails.ghana.bankName}</p>
                <p><strong>Account Name:</strong> {bankTransferDetails.ghana.accountName}</p>
                <p><strong>Account Number:</strong> {bankTransferDetails.ghana.accountNumber}</p>
                <p><strong>Swift Code:</strong> {bankTransferDetails.ghana.swiftCode}</p>
                <p><strong>Branch:</strong> {bankTransferDetails.ghana.branch}</p>
                <p className="text-sm text-gray-500 mt-4">
                  Please include your name and email in the transfer reference.
                  Email us at finance@elshaddai.org once transfer is complete.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mb-4">
              Your generous donation of {formatCurrency(
                parseFloat(formData.customAmount || formData.amount), 
                formData.currency
              )} has been received.
            </p>
          )}
          
          <p className="text-gray-600">
            A receipt has been sent to <strong>{formData.email}</strong>
          </p>
          
          <button
            onClick={resetForm}
            className="mt-6 btn-primary"
          >
            Make Another Donation
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
            {currencyOptions.slice(0, 6).map((currency) => (
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

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Frequency
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'one-time', label: 'One Time' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' }
            ].map((freq) => (
              <label
                key={freq.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="frequency"
                  value={freq.value}
                  checked={formData.frequency === freq.value}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-accent focus:ring-accent"
                />
                <span className="capitalize">{freq.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {paymentMethodOptions.slice(0, 6).map((method) => (
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
                <div className="text-2xl mb-2">{method.icon}</div>
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
              A payment request will be sent to your mobile money account.
            </p>
          </div>
        )}

        {/* USSD/QR Code Info */}
        {(formData.paymentMethod === 'ussd' || formData.paymentMethod === 'qr_code') && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              {formData.paymentMethod === 'ussd' ? 'USSD Payment' : 'QR Code Payment'}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {formData.paymentMethod === 'ussd' 
                ? 'You will receive a USSD code to dial on your mobile phone.'
                : 'You will be shown a QR code to scan with your banking app.'}
            </p>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+233123456789"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Bank Transfer Details */}
        {formData.paymentMethod === 'bank_transfer' && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Bank Transfer Information
            </h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="accountHolderName"
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.accountHolderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.accountHolderName && (
                  <p className="mt-1 text-sm text-red-500">{errors.accountHolderName}</p>
                )}
              </div>
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="bankName"
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Bank of Ghana"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.bankName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bankName && (
                  <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              After submitting, you'll receive bank details to complete your transfer.
            </p>
          </div>
        )}

        {/* Card Payment - No extra fields needed */}
        {formData.paymentMethod === 'card' && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="h-5 w-5 mr-2" />
              You will be redirected to enter your card details securely.
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
                Phone {['mobile_money', 'ussd', 'qr_code'].includes(formData.paymentMethod) && <span className="text-red-500">*</span>}
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
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="h-5 w-5 mr-2" />
            <Globe className="h-5 w-5 mr-2" />
            Secure & Encrypted
          </div>
          <button
            type="button"
            onClick={handlePayment}
            disabled={isLoading || isProcessing}
            className={`btn-primary px-8 w-full sm:w-auto flex items-center justify-center gap-2 ${
              isLoading || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {(isLoading || isProcessing) ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isProcessing ? 'Opening Payment...' : 'Processing...'}
              </>
            ) : (
              <>
                Give {getCurrencySymbol(formData.currency)}{(formData.customAmount || formData.amount || '0')}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            All donations are tax-deductible. You will receive a receipt via email.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Donating from outside Ghana? We accept cards, bank transfers, and mobile money.
          </p>
        </div>
      </div>
    </div>
  )
}
