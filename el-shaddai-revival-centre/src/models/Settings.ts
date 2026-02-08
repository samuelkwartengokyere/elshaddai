import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISettings extends Document {
  churchName: string
  churchTagline: string
  logoUrl: string
  favicon?: string
  updatedAt: Date
}

const SettingsSchema = new Schema<ISettings>({
  churchName: {
    type: String,
    default: 'El-Shaddai Revival Centre'
  },
  churchTagline: {
    type: String,
    default: 'The Church Of Pentecost'
  },
  logoUrl: {
    type: String,
    default: 'https://pentecost.ca/wp-content/uploads/2025/03/The-Church-Pentecost-Logo-1.png'
  },
  favicon: {
    type: String
  }
}, {
  timestamps: true
})

// Singleton pattern - only one settings document
const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema)

export default Settings

