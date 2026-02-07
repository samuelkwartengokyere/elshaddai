import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IEvent extends Document {
  title: string
  description: string
  date: Date
  endDate?: Date
  time: string
  endTime?: string
  location: string
  category: 'worship' | 'youth' | 'children' | 'outreach' | 'fellowship' | 'other'
  image?: string
  recurring: boolean
  recurringType?: 'weekly' | 'monthly' | 'daily'
  recurringDays?: string[]
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  maxAttendees?: number
  registrationRequired: boolean
  registrationLink?: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    endDate: {
      type: Date
    },
    time: {
      type: String,
      required: [true, 'Event time is required']
    },
    endTime: {
      type: String
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['worship', 'youth', 'children', 'outreach', 'fellowship', 'other'],
      default: 'other'
    },
    image: {
      type: String
    },
    recurring: {
      type: Boolean,
      default: false
    },
    recurringType: {
      type: String,
      enum: ['weekly', 'monthly', 'daily']
    },
    recurringDays: [{
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }],
    contactName: {
      type: String,
      trim: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    maxAttendees: {
      type: Number,
      min: [0, 'Maximum attendees cannot be negative']
    },
    registrationRequired: {
      type: Boolean,
      default: false
    },
    registrationLink: {
      type: String
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

// Index for efficient queries
EventSchema.index({ date: 1 })
EventSchema.index({ category: 1 })
EventSchema.index({ isPublished: 1 })

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)

export default Event

