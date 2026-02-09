// Donation Type Definitions

export type DonationFrequency = 'one-time' | 'weekly' | 'monthly' | 'yearly'

export type PaymentChannel = 
  | 'stripe' 
  | 'paystack' 
  | 'bank_transfer' 
  | 'mobile_money' 
  | 'manual' 
  | 'other'

// Payment method types (for UI selection)
export type PaymentMethodType = 
  | 'card' 
  | 'mobile_money' 
  | 'bank_transfer' 
  | 'ussd' 
  | 'qr_code' 
  | 'apple_pay' 
  | 'google_pay' 
  | 'sepa_debit' 
  | 'ach_debit'

export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'

export type Currency = 'USD' | 'GHS' | 'NGN' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'KES' | 'ZAR' | 'other'

export interface Donation {
  id?: string
  amount: number
  amountUSD: number
  currency: Currency
  exchangeRate: number
  frequency: DonationFrequency
  donorName: string
  donorEmail: string
  donorPhone?: string
  donorCountry?: string
  paymentMethod: string
  paymentChannel: PaymentChannel
  status: DonationStatus
  paystackReference?: string
  paystackTransactionId?: string
  authorizationCode?: string
  paystackChannel?: string
  stripePaymentIntentId?: string
  stripeCustomerId?: string
  stripePaymentMethodId?: string
  bankName?: string
  transactionReference?: string
  transferDate?: Date
  last4Card?: string
  cardType?: string
  cardBrand?: string
  donationType?: string
  notes?: string
  isAnonymous: boolean
  receiptSent: boolean
  receiptSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface DonationFormData {
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
  phone?: string
  country?: string
  
  // Payment
  paymentMethod: string
  paymentChannel: PaymentChannel
  
  // Donation Details
  donationType?: string
  isAnonymous: boolean
  notes?: string
}

// Payment Method Options
export interface PaymentMethodOption {
  id: PaymentMethodType
  name: string
  description: string
  icon: string
  currencies: Currency[]
  regions?: string[]
  fees?: string
  processingTime?: string
}

// Currency Options
export interface CurrencyOption {
  code: Currency
  name: string
  symbol: string
  exchangeRateToUSD: number
}

// Exchange Rate Response
export interface ExchangeRateResponse {
  USD: number
  [key: string]: number
}

// Mobile Money Provider
export interface MobileMoneyProvider {
  id: string
  name: string
  country: string
  type: 'mobile_money' | 'wallet'
}

// Bank Transfer Details
export interface BankTransferDetails {
  bankName: string
  accountName: string
  accountNumber: string
  swiftCode?: string
  iban?: string
  routingNumber?: string
  branch?: string
  country: string
  currency: Currency
  instructions?: string
}
