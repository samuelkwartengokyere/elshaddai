import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDonation extends Document {
  amount: number
  currency: string
  frequency: 'one-time' | 'weekly' | 'monthly' | 'yearly'
  donorName: string
  donorEmail: string
  paymentMethod: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paystackReference?: string
  paystackTransactionId?: string
  authorizationCode?: string
  last4Card?: string
  cardType?: string
  createdAt: Date
  receiptSent: boolean
  updatedAt: Date
}

const donationSchema = new Schema<IDonation>({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
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
  paymentMethod: {
    type: String,
    default: 'paystack'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
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
  last4Card: {
    type: String
  },
  cardType: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  receiptSent: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Check if model already exists to prevent overwrite during hot reload
const Donation: Model<IDonation> = mongoose.models.Donation || mongoose.model<IDonation>('Donation', donationSchema)

export default Donation
