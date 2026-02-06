import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMedia extends Document {
  title: string
  description?: string
  url: string
  type: 'image' | 'video' | 'document'
  category: 'service' | 'event' | 'ministry' | 'other'
  date: Date
  uploadedAt: Date
}

const MediaSchema = new Schema<IMedia>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: true
  },
  category: {
    type: String,
    enum: ['service', 'event', 'ministry', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

const Media: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema)

export default Media

