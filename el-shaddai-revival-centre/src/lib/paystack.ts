import axios from 'axios'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

interface InitializeTransactionParams {
  email: string
  amount: number
  firstName: string
  lastName: string
  frequency: string
  reference?: string
  callbackUrl?: string
}

interface TransactionInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface TransactionVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    reference: string
    status: string
    amount: number
    currency: string
    customer: {
      email: string
      first_name: string
      last_name: string
    }
    authorization: {
      authorization_code: string
      last4: string
      exp_month: string
      exp_year: string
    }
  }
}

/**
 * Initialize a Paystack transaction
 */
export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<TransactionInitializeResponse> {
  try {
    const { email, amount, firstName, lastName, frequency, reference, callbackUrl } = params

    // Amount is in kobo for Paystack (multiply by 100)
    const amountInKobo = Math.round(amount * 100)

    const response = await axios.post<TransactionInitializeResponse>(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountInKobo,
        first_name: firstName,
        last_name: lastName,
        reference: reference || undefined,
        callback_url: callbackUrl || process.env.PAYSTACK_CALLBACK_URL,
        metadata: {
          frequency,
          firstName,
          lastName,
          custom_fields: [
            {
              display_name: 'Frequency',
              variable_name: 'frequency',
              value: frequency
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (error: unknown) {
    console.error('Paystack initialize transaction error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`Paystack API error: ${error.response?.data?.message || error.message}`)
    }
    throw new Error('Failed to initialize Paystack transaction')
  }
}

/**
 * Verify a Paystack transaction by reference
 */
export async function verifyTransaction(
  reference: string
): Promise<TransactionVerifyResponse> {
  try {
    const response = await axios.get<TransactionVerifyResponse>(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    )

    return response.data
  } catch (error: unknown) {
    console.error('Paystack verify transaction error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`Paystack API error: ${error.response?.data?.message || error.message}`)
    }
    throw new Error('Failed to verify Paystack transaction')
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(
  transactionId: number
): Promise<TransactionVerifyResponse> {
  try {
    const response = await axios.get<TransactionVerifyResponse>(
      `https://api.paystack.co/transaction/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    )

    return response.data
  } catch (error: unknown) {
    console.error('Paystack get transaction error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`Paystack API error: ${error.response?.data?.message || error.message}`)
    }
    throw new Error('Failed to get Paystack transaction')
  }
}

/**
 * Create a refund for a transaction
 */
export async function createRefund(
  transactionId: number,
  amount?: number,
  reason?: string
): Promise<{ status: boolean; message: string; data: { refund_id: number; amount: number } }> {
  try {
    const response = await axios.post(
      'https://api.paystack.co/refund',
      {
        transaction: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (error: unknown) {
    console.error('Paystack refund error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`Paystack API error: ${error.response?.data?.message || error.message}`)
    }
    throw new Error('Failed to create refund')
  }
}

/**
 * List all transactions with pagination
 */
export async function listTransactions(
  page = 1,
  perPage = 20,
  from?: Date,
  to?: Date
): Promise<{
  status: boolean
  data: Array<{
    id: number
    reference: string
    status: string
    amount: number
    currency: string
    created_at: string
    customer: { email: string }
  }>
  meta: { page: number; perPage: number; total: number; totalPages: number }
}> {
  try {
    const params: Record<string, unknown> = {
      page,
      perPage
    }

    if (from) {
      params.from = from.toISOString()
    }
    if (to) {
      params.to = to.toISOString()
    }

    const response = await axios.get('https://api.paystack.co/transaction', {
      params,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    })

    return response.data
  } catch (error: unknown) {
    console.error('Paystack list transactions error:', error)
    if (axios.isAxiosError(error)) {
      throw new Error(`Paystack API error: ${error.response?.data?.message || error.message}`)
    }
    throw new Error('Failed to list Paystack transactions')
  }
}

/**
 * Generate a unique reference for a transaction
 */
export function generateReference(prefix = 'donation'): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${randomStr}`.toUpperCase()
}

