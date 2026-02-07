import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITeamMember extends Document {
  name: string
  role: string
  bio: string
  image?: string
  email?: string
  phone?: string
  order: number
  department?: string
  isLeadership: boolean
  isPublished: boolean
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  createdAt: Date
  updatedAt: Date
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: {
      type: String,
      required: [true, 'Team member name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    role: {
      type: String,
      required: [true, 'Team member role is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters']
    },
    bio: {
      type: String,
      required: [true, 'Team member bio is required'],
      maxlength: [2000, 'Bio cannot exceed 2000 characters']
    },
    image: {
      type: String
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    department: {
      type: String,
      trim: true
    },
    isLeadership: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    socialLinks: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true }
    }
  },
  {
    timestamps: true
  }
)

// Index for efficient queries
TeamMemberSchema.index({ order: 1 })
TeamMemberSchema.index({ department: 1 })
TeamMemberSchema.index({ isLeadership: 1 })
TeamMemberSchema.index({ isPublished: 1 })

const TeamMember: Model<ITeamMember> = mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema)

export default TeamMember

