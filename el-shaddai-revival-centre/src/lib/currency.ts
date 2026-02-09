import { Currency, CurrencyOption, ExchangeRateResponse, PaymentMethodType, PaymentChannel } from '@/types/donation'

// Currency configuration
export const currencyOptions: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRateToUSD: 1 },
  { code: 'GHS', name: 'Ghana Cedi', symbol: '₵', exchangeRateToUSD: 0.08 }, // ~12.5 GHS per USD
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', exchangeRateToUSD: 0.0013 }, // ~780 NGN per USD
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRateToUSD: 1.27 },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRateToUSD: 1.09 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRateToUSD: 0.74 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRateToUSD: 0.65 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', exchangeRateToUSD: 0.0065 }, // ~154 KES per USD
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', exchangeRateToUSD: 0.053 }, // ~19 ZAR per USD
]

// Payment method options with regional availability
export const paymentMethodOptions: Array<{
  id: PaymentMethodType
  name: string
  description: string
  icon: string
  channels: PaymentChannel[]
  currencies: Currency[]
  regions: string[]
  fees?: string
  processingTime?: string
  providers?: Array<{ id: string; name: string; countries: string[] }>
}> = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay securely with your credit or debit card',
    icon: '💳',
    channels: ['paystack'],
    currencies: ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'GHS', 'NGN', 'KES', 'ZAR'],
    regions: ['Global'],
    fees: '2.5-3.5%',
    processingTime: 'Instant',
  },
  {
    id: 'mobile_money',
    name: 'Mobile Money',
    description: 'Pay using your mobile money wallet',
    icon: '📱',
    channels: ['paystack'],
    currencies: ['GHS', 'NGN', 'KES', 'ZAR', 'USD'],
    regions: ['Ghana', 'Nigeria', 'Kenya', 'South Africa'],
    fees: '1.5-2.5%',
    processingTime: 'Instant',
    providers: [
      { id: 'mpesa', name: 'M-Pesa', countries: ['Kenya', 'Ghana'] },
      { id: 'airtel_money', name: 'Airtel Money', countries: ['Kenya', 'Ghana', 'Nigeria'] },
      { id: 'tigo_cash', name: 'Tigo Cash', countries: ['Ghana'] },
      { id: 'vodafone_cash', name: 'Vodafone Cash', countries: ['Ghana'] },
      { id: 'mtn_money', name: 'MTN Mobile Money', countries: ['Ghana', 'Nigeria'] },
      { id: 'orangemoney', name: 'Orange Money', countries: ['Ghana'] },
    ],
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer or mobile banking',
    icon: '🏦',
    channels: ['paystack', 'manual'],
    currencies: ['USD', 'GBP', 'EUR', 'GHS', 'NGN'],
    regions: ['Global'],
    fees: 'Varies by bank',
    processingTime: '1-5 business days',
  },
  {
    id: 'ussd',
    name: 'USSD',
    description: 'Pay using USSD code (*123#)',
    icon: '📞',
    channels: ['paystack'],
    currencies: ['GHS', 'NGN'],
    regions: ['Ghana', 'Nigeria'],
    fees: '1.5-2.5%',
    processingTime: 'Instant',
  },
  {
    id: 'qr_code',
    name: 'QR Code',
    description: 'Scan QR code with your banking app',
    icon: '📲',
    channels: ['paystack'],
    currencies: ['GHS', 'NGN', 'USD'],
    regions: ['Ghana', 'Nigeria'],
    fees: '1-2%',
    processingTime: 'Instant',
  },
]

// Bank transfer details for manual donations
export const bankTransferDetails = {
  ghana: {
    bankName: 'Ghana Commercial Bank',
    accountName: 'El-Shaddai Revival Centre',
    accountNumber: '1234567890',
    swiftCode: 'GCBGHAC',
    branch: 'Nabewam',
    currency: 'GHS',
    instructions: 'Please include your name in the transfer reference. Email us at finance@elshaddai.org once transfer is complete.',
  },
  international: {
    bankName: 'Bank of Ghana / Correspondent Bank',
    accountName: 'El-Shaddai Revival Centre',
    accountNumber: '1234567890',
    swiftCode: 'BOGGHAC',
    iban: 'GH89 0000 0000 0000 1234 5678 90',
    routingNumber: '021000021',
    correspondentBank: 'Citibank NA, New York',
    correspondentSwift: 'CITIUS33',
    currency: 'USD',
    instructions: 'Please include your name and country in the transfer reference. Email us at finance@elshaddai.org once transfer is complete.',
  },
}

// Format currency for display
export function formatCurrency(
  amount: number,
  currency: Currency = 'USD',
  locale: string = 'en-US'
): string {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'USD' || currency === 'EUR' || currency === 'GBP' ? 2 : 0,
      maximumFractionDigits: 2,
    })
    return formatter.format(amount)
  } catch {
    // Fallback formatting
    const symbol = currencyOptions.find(c => c.code === currency)?.symbol || currency
    return `${symbol}${amount.toFixed(2)}`
  }
}

// Convert amount between currencies
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  const fromRate = currencyOptions.find(c => c.code === fromCurrency)?.exchangeRateToUSD || 1
  const toRate = currencyOptions.find(c => c.code === toCurrency)?.exchangeRateToUSD || 1

  // First convert to USD, then to target currency
  const amountInUSD = amount * fromRate
  const convertedAmount = amountInUSD / toRate

  return Math.round(convertedAmount * 100) / 100
}

// Get exchange rate between two currencies
export function getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
  const fromRate = currencyOptions.find(c => c.code === fromCurrency)?.exchangeRateToUSD || 1
  const toRate = currencyOptions.find(c => c.code === toCurrency)?.exchangeRateToUSD || 1

  return fromRate / toRate
}

// Get currency symbol
export function getCurrencySymbol(currency: Currency): string {
  return currencyOptions.find(c => c.code === currency)?.symbol || currency
}

// Get currency name
export function getCurrencyName(currency: Currency): string {
  return currencyOptions.find(c => c.code === currency)?.name || currency
}

// Fetch real exchange rates (placeholder - would need API key in production)
export async function fetchExchangeRates(): Promise<ExchangeRateResponse> {
  // In production, you would use an API like:
  // - Open Exchange Rates (https://openexchangerates.org)
  // - Currency Layer (https://currencylayer.com)
  // - Fixer.io (https://fixer.io)
  // - exchangerate-api.com
  
  // For now, return hardcoded rates as fallback
  const rates: ExchangeRateResponse = {
    USD: 1,
    GHS: 12.5,
    NGN: 780,
    GBP: 0.79,
    EUR: 0.92,
    CAD: 1.35,
    AUD: 1.54,
    KES: 154,
    ZAR: 19,
  }

  return rates
}

// Payment method icons as SVG components
export const paymentMethodIcons = {
  visa: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="4" fill="#1A1F71"/><path d="M21.5 30.5L23.5 17.5H25.5L23.5 30.5H21.5ZM17.5 17.5L15.5 26L14.5 17.5H12.5L15.5 30.5H17L20.5 17.5H17.5ZM31.5 30.5V17.5H34.5L34 20.5C35.5 18.5 37.5 17.5 39.5 17.5C41.5 17.5 42.5 18.5 42.5 20C42.5 21.5 41.5 22.5 40 22.5C38.5 22.5 37.5 22 36.5 21L36 23.5C37.5 24.5 39 25 40.5 25C42.5 25 44 24 44 22C44 20 42.5 18.5 40.5 18.5C38.5 18.5 37 19.5 36 21V18L31.5 30.5Z" fill="white"/></svg>`,
  mastercard: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="4" fill="#000"/><circle cx="18" cy="24" r="10" fill="#EB001B"/><circle cx="30" cy="24" r="10" fill="#F79E1B"/></svg>`,
  apple_pay: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="4" fill="#000"/><path d="M30 14C31.5 13 33.5 12 35.5 12C38 12 39 13.5 39 15C39 16.5 37.5 18 35.5 18C33.5 18 31.5 17 30 16C28.5 17 26.5 18 24.5 18C21 18 19 16 19 14C19 11.5 22 10.5 24.5 10.5C26.5 10.5 28.5 11.5 30 12.5V14Z" fill="white"/></svg>`,
  google_pay: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="4" fill="#000"/><path d="M12 36V12H36V36H12ZM16 32H32V16H16V32Z" fill="white"/></svg>`,
}

// Get available payment methods for a currency
export function getAvailablePaymentMethods(currency: Currency) {
  return paymentMethodOptions.filter(pm => 
    pm.currencies.includes(currency)
  )
}

// Get popular currencies by region
export const currenciesByRegion = {
  africa: ['USD', 'GHS', 'NGN', 'KES', 'ZAR'],
  europe: ['EUR', 'GBP', 'USD'],
  americas: ['USD', 'CAD', 'EUR', 'GBP'],
  asia: ['USD', 'EUR', 'GBP', 'AUD'],
  oceania: ['AUD', 'USD', 'EUR', 'GBP'],
}

// Detect user's likely currency based on browser locale
export function detectCurrencyFromLocale(locale: string): Currency {
  const localeToCurrency: Record<string, Currency> = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'en-GH': 'GHS',
    'en-NG': 'NGN',
    'en-KE': 'KES',
    'en-ZA': 'ZAR',
    'en-CA': 'CAD',
    'en-AU': 'AUD',
    'fr': 'EUR',
    'de': 'EUR',
    'es': 'EUR',
    'pt': 'EUR',
  }

  // Check exact match first
  if (localeToCurrency[locale]) {
    return localeToCurrency[locale]
  }

  // Check language-only match
  const language = locale.split('-')[0]
  if (localeToCurrency[language]) {
    return localeToCurrency[language]
  }

  // Default to USD
  return 'USD'
}

