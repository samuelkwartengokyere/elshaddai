import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDonation extends Document {
  amount: number
  currency: string
  frequency: 'one-time' | 'weekly' | 'monthly' | 'yearly'
  donorName: string
  donorEmail: string
  paymentMethod: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: Date
  receiptSent: boolean
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
    default: 'credit_card'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  receiptSent: {
    type: Boolean,
    default: false
  }
})

// Check if model already exists to prevent overwrite during hot reload
const Donation: Model<IDonation> = mongoose.models.Donation || mongoose.model<IDonation>('Donation', donationSchema)

export default Donation
