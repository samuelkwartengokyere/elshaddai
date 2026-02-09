import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IYouTubeSettings {
  channelId: string
  channelName: string
  channelUrl: string
  apiKey: string
  autoSync: boolean
  syncInterval: number // hours
  lastSync: Date | null
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
  syncError?: string
}

export interface ISettings extends Document {
  churchName: string
  churchTagline: string
  logoUrl: string
  favicon?: string
  youtube: IYouTubeSettings
  updatedAt: Date
}

const YouTubeSettingsSchema = new Schema<IYouTubeSettings>({
  channelId: {
    type: String,
    default: ''
  },
  channelName: {
    type: String,
    default: ''
  },
  channelUrl: {
    type: String,
    default: ''
  },
  apiKey: {
    type: String,
    default: ''
  },
  autoSync: {
    type: Boolean,
    default: false
  },
  syncInterval: {
    type: Number,
    default: 6 // hours
  },
  lastSync: {
    type: Date,
    default: null
  },
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'success', 'error'],
    default: 'idle'
  },
  syncError: {
    type: String,
    default: ''
  }
}, { _id: false })

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
  },
  youtube: {
    type: YouTubeSettingsSchema,
    default: () => ({
      channelId: '',
      channelName: '',
      channelUrl: '',
      apiKey: '',
      autoSync: false,
      syncInterval: 6,
      lastSync: null,
      syncStatus: 'idle',
      syncError: ''
    })
  }
}, {
  timestamps: true
})

// Singleton pattern - only one settings document
const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema)

export default Settings

