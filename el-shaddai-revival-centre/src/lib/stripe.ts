import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

// Initialize Stripe with the secret key
const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

// Currency to Stripe format mapping
const currencyToStripeFormat: Record<string, string> = {
  USD: 'usd',
  EUR: 'eur',
  GBP: 'gbp',
  CAD: 'cad',
  AUD: 'aud',
  GHS: 'ghs',
  NGN: 'ngn',
  KES: 'kes',
  ZAR: 'zar',
}

interface CreatePaymentIntentParams {
  amount: number
  currency: string
  email: string
  name: string
  phone?: string
  metadata?: Record<string, string>
}

interface CreateCheckoutSessionParams {
  amount: number
  currency: string
  email: string
  name: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

/**
 * Create a Stripe Payment Intent for card payments
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<Stripe.PaymentIntent> {
  try {
    const { amount, currency, email, name, phone, metadata } = params

    // Convert amount to smallest currency unit (cents for USD, etc.)
    const amountInSmallestUnit = getAmountInSmallestUnit(amount, currency)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currencyToStripeFormat[currency] || 'usd',
      receipt_email: email,
      metadata: {
        ...metadata,
        donor_name: name,
        donor_phone: phone || '',
        source: 'elshaddai-donation',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return paymentIntent
  } catch (error: unknown) {
    console.error('Stripe create payment intent error:', error)
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`)
    }
    throw new Error('Failed to create payment intent')
  }
}

/**
 * Create a Stripe Checkout Session for hosted payment page
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  try {
    const { amount, currency, email, name, successUrl, cancelUrl, metadata } = params

    const amountInSmallestUnit = getAmountInSmallestUnit(amount, currency)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currencyToStripeFormat[currency] || 'usd',
            product_data: {
              name: 'Donation to El-Shaddai Revival Centre',
              description: 'Thank you for your generous donation',
            },
            unit_amount: amountInSmallestUnit,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: name,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        source: 'elshaddai-donation',
      },
      allow_promotion_codes: false,
    })

    return session
  } catch (error: unknown) {
    console.error('Stripe create checkout session error:', error)
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`)
    }
    throw new Error('Failed to create checkout session')
  }
}

/**
 * Verify a Payment Intent by ID
 */
export async function verifyPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error: unknown) {
    console.error('Stripe verify payment intent error:', error)
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`)
    }
    throw new Error('Failed to verify payment intent')
  }
}

/**
 * Cancel a Payment Intent
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)
    return paymentIntent
  } catch (error: unknown) {
    console.error('Stripe cancel payment intent error:', error)
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`)
    }
    throw new Error('Failed to cancel payment intent')
  }
}

/**
 * Create a Stripe Customer for recurring donations
 */
export async function createCustomer(
  email: string,
  name: string,
  phone?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        ...metadata,
        source: 'elshaddai-donation',
      },
    })
    return customer
  } catch (error: unknown) {
    console.error('Stripe create customer error:', error)
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`)
    }
    throw new Error('Failed to create customer')
  }
}

/**
 * Create a Setup Intent for saving payment methods
 */
export async function createSetupIntent(
  customerId: string,
  metadata?: Record<string, string>
): Promise<Stripe.SetupIntent> {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card', 'us_bank_account', 'sepa_debit'],
      metadata: {
        ...metadata,
        source: 'elshaddai-donation',
      },
    })
    return setupIntent
  } catch (error: unknown) {
    console.error('Stripe create setup intent error:', error)
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`)
    }
    throw new Error('Failed to create setup intent')
  }
}

/**
 * List customer's payment methods
 */
export async function listPaymentMethods(
  customerId: string
): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })
    return paymentMethods
  } catch (error: unknown) {
    console.error('Stripe list payment methods error:', error)
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`)
    }
    throw new Error('Failed to list payment methods')
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason,
    }

    // If amount is provided, convert to smallest unit
    if (amount) {
      // We need to know the currency to convert properly
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      refundParams.amount = getAmountInSmallestUnit(amount, paymentIntent.currency)
    }

    const refund = await stripe.refunds.create(refundParams)
    return refund
  } catch (error: unknown) {
    console.error('Stripe create refund error:', error)
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`)
    }
    throw new Error('Failed to create refund')
  }
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    return event
  } catch (error: unknown) {
    console.error('Stripe webhook verification error:', error)
    if (error instanceof Error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`)
    }
    throw new Error('Webhook signature verification failed')
  }
}

/**
 * Get exchange rates from Stripe (for supported currencies)
 * Note: This is for display purposes only - Stripe handles the conversion
 */
export function getStripeSupportedCurrencies(): string[] {
  return [
    'usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'chf', 'mxn', 'inr', 'brl',
    'krw', 'sgd', 'hkd', 'nzd', 'sek', 'dkk', 'nop', 'pln', 'zar', 'ghs', 'ngn'
  ]
}

/**
 * Helper function to convert amount to smallest currency unit
 */
function getAmountInSmallestUnit(amount: number, currency: string): number {
  // Currencies that use zero decimal places
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'idf', 'pyg', 'rwf', 'kmf', 'xof', 'xaf']
  
  const currencyLower = currency.toLowerCase()
  
  if (zeroDecimalCurrencies.includes(currencyLower)) {
    return Math.round(amount)
  }
  
  // For all other currencies, multiply by 100
  return Math.round(amount * 100)
}

/**
 * Convert smallest unit amount to display amount
 */
export function getDisplayAmount(amount: number, currency: string): number {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'idf', 'pyg', 'rwf', 'kmf', 'xof', 'xaf']
  
  const currencyLower = currency.toLowerCase()
  
  if (zeroDecimalCurrencies.includes(currencyLower)) {
    return amount
  }
  
  return amount / 100
}

export default stripe

