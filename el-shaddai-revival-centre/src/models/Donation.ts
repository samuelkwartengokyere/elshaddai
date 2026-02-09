import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDonation extends Document {
  amount: number
  amountUSD: number
  currency: string
  exchangeRate: number
  frequency: 'one-time' | 'weekly' | 'monthly' | 'yearly'
  donorName: string
  donorEmail: string
  donorPhone?: string
  donorCountry?: string
  paymentMethod: string
  paymentChannel: 'paystack' | 'stripe' | 'bank_transfer' | 'mobile_money' | 'manual' | 'other'
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  
  // Paystack specific
  paystackReference?: string
  paystackTransactionId?: string
  authorizationCode?: string
  paystackChannel?: string
  
  // Stripe specific
  stripePaymentIntentId?: string
  stripeCustomerId?: string
  stripePaymentMethodId?: string
  
  // Manual/Bank Transfer specific
  bankName?: string
  transactionReference?: string
  transferDate?: Date
  
  // Card details (for display only)
  last4Card?: string
  cardType?: string
  cardBrand?: string
  
  // Donation details
  donationType?: string
  notes?: string
  isAnonymous: boolean
  
  // Receipt
  receiptSent: boolean
  receiptSentAt?: Date
  
  // Metadata
  ipAddress?: string
  userAgent?: string
  
  createdAt: Date
  updatedAt: Date
}

const donationSchema = new Schema<IDonation>({
  amount: {
    type: Number,
    required: true
  },
  amountUSD: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  frequency: {
    type: String,
    enum: ['one-time', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  donorEmail: {
    type: String,
    required: true
  },
  donorPhone: {
    type: String
  },
  donorCountry: {
    type: String
  },
  paymentMethod: {
    type: String,
    default: 'online'
  },
  paymentChannel: {
    type: String,
    enum: ['paystack', 'stripe', 'bank_transfer', 'mobile_money', 'manual', 'other'],
    default: 'paystack'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Paystack specific
  paystackReference: {
    type: String,
    index: true
  },
  paystackTransactionId: {
    type: String
  },
  authorizationCode: {
    type: String
  },
  paystackChannel: {
    type: String
  },
  
  // Stripe specific
  stripePaymentIntentId: {
    type: String,
    index: true
  },
  stripeCustomerId: {
    type: String
  },
  stripePaymentMethodId: {
    type: String
  },
  
  // Manual/Bank Transfer specific
  bankName: {
    type: String
  },
  transactionReference: {
    type: String
  },
  transferDate: {
    type: Date
  },
  
  // Card details
  last4Card: {
    type: String
  },
  cardType: {
    type: String
  },
  cardBrand: {
    type: String
  },
  
  // Donation details
  donationType: {
    type: String
  },
  notes: {
    type: String
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Receipt
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptSentAt: {
    type: Date
  },
  
  // Metadata
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Indexes for faster queries
donationSchema.index({ status: 1, createdAt: -1 })
donationSchema.index({ donorEmail: 1 })
donationSchema.index({ paymentChannel: 1 })

// Pre-save middleware to update timestamp
donationSchema.pre('save', function() {
  this.updatedAt = new Date()
})

// Check if model already exists to prevent overwrite during hot reload
const Donation: Model<IDonation> = mongoose.models.Donation || mongoose.model<IDonation>('Donation', donationSchema)

export default Donation
