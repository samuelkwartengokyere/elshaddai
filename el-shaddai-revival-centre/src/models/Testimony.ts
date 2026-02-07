import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITestimony extends Document {
  name: string
  title: string
  content: string
  category: 'healing' | 'breakthrough' | 'salvation' | 'deliverance' | 'provision' | 'other'
  date: Date
  location: string
  image?: string
  isPublished: boolean
  isFeatured: boolean
  videoUrl?: string
  createdAt: Date
  updatedAt: Date
}

const TestimonySchema = new Schema<ITestimony>(
  {
    name: {
      type: String,
      required: [true, 'Testimony name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    title: {
      type: String,
      required: [true, 'Testimony title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Testimony content is required'],
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    category: {
      type: String,
      enum: ['healing', 'breakthrough', 'salvation', 'deliverance', 'provision', 'other'],
      default: 'other'
    },
    date: {
      type: Date,
      required: [true, 'Testimony date is required']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    image: {
      type: String
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    videoUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

// Index for efficient queries
TestimonySchema.index({ date: -1 })
TestimonySchema.index({ category: 1 })
TestimonySchema.index({ isPublished: 1 })
TestimonySchema.index({ isFeatured: 1 })

const Testimony: Model<ITestimony> = mongoose.models.Testimony || mongoose.model<ITestimony>('Testimony', TestimonySchema)

export default Testimony

