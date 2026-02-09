import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICalendarEvent extends Document {
  title: string
  description: string
  date: string // YYYY-MM-DD format
  time: string
  endDate?: string
  endTime?: string
  location: string
  category: 'holiday' | 'special' | 'revival'
  year: number
  recurring: boolean
  recurringType?: 'weekly' | 'monthly' | 'yearly'
  colorCode?: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      required: [true, 'Event date is required']
    },
    time: {
      type: String,
      default: 'All Day'
    },
    endDate: {
      type: String
    },
    endTime: {
      type: String
    },
    location: {
      type: String,
      default: 'Church Premises'
    },
    category: {
      type: String,
      enum: ['holiday', 'special', 'revival'],
      required: [true, 'Category is required']
    },
    year: {
      type: Number,
      required: [true, 'Year is required']
    },
    recurring: {
      type: Boolean,
      default: false
    },
    recurringType: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly']
    },
    colorCode: {
      type: String,
      default: '#3B82F6'
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

// Indexes for efficient queries
CalendarEventSchema.index({ date: 1 })
CalendarEventSchema.index({ category: 1 })
CalendarEventSchema.index({ year: 1 })
CalendarEventSchema.index({ isPublished: 1 })

const CalendarEvent: Model<ICalendarEvent> = 
  mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema)

export default CalendarEvent

