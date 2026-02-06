import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISermon extends Document {
  title: string
  speaker: string
  date: Date
  description: string
  audioUrl: string
  videoUrl?: string
  thumbnail?: string
  duration?: string
  series?: string
  biblePassage?: string
  tags?: string[]
  downloads: number
  views: number
  createdAt: Date
  updatedAt: Date
}

const sermonSchema = new Schema<ISermon>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  speaker: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String
  },
  thumbnail: {
    type: String
  },
  duration: {
    type: String
  },
  series: {
    type: String
  },
  biblePassage: {
    type: String
  },
  tags: [{
    type: String
  }],
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
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

// Check if model already exists to prevent overwrite during hot reload
const Sermon: Model<ISermon> = mongoose.models.Sermon || mongoose.model<ISermon>('Sermon', sermonSchema)

export default Sermon

