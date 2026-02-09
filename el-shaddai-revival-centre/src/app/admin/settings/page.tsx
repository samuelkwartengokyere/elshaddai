'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  Settings as SettingsIcon, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  X,
  User,
  Camera,
  Upload,
  Youtube,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface Settings {
  churchName: string
  churchTagline: string
  logoUrl: string
  youtube?: {
    channelId: string
    channelName: string
    channelUrl: string
    apiKey: string
    autoSync: boolean
    syncInterval: number
    lastSync: Date | null
    syncStatus: 'idle' | 'syncing' | 'success' | 'error'
    syncError?: string
  }
}

interface AdminUser {
  _id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'editor'
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

interface CurrentUser {
  adminId: string
  email: string
  name: string
  role: string
  profileImage?: string
}

const defaultSettings: Settings = {
  churchName: 'El-Shaddai Revival Centre',
  churchTagline: 'The Church Of Pentecost',
  logoUrl: 'https://pentecost.ca/wp-content/uploads/2025/03/The-Church-Pentecost-Logo-1.png'
}

// Pre-defined avatar options
const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace',
]

type Tab = 'branding' | 'profile' | 'admins' | 'youtube'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('branding')
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>(defaultSettings.logoUrl)
  
  // YouTube settings state
  const [youtubeSettings, setYoutubeSettings] = useState({
    channelId: '',
    channelName: '',
    channelUrl: '',
    apiKey: '',
    autoSync: false,
    syncInterval: 6,
    lastSync: null as Date | null,
    syncStatus: 'idle' as 'idle' | 'syncing' | 'success' | 'error',
    syncError: ''
  })
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Profile state
  const [profileImage, setProfileImage] = useState<string>('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileName, setProfileName] = useState<string>('')
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [adminForm, setAdminForm] = useState<{
    name: string
    email: string
    password: string
    role: 'super_admin' | 'admin' | 'editor'
    isActive: boolean
  }>({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    isActive: true
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    fetchSettings()
    fetchCurrentUser()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.success && data.settings) {
        setSettings(data.settings)
        setLogoPreview(data.settings.logoUrl || defaultSettings.logoUrl)
        
        // Set YouTube settings
        if (data.settings.youtube) {
          setYoutubeSettings({
            channelId: data.settings.youtube.channelId || '',
            channelName: data.settings.youtube.channelName || '',
            channelUrl: data.settings.youtube.channelUrl || '',
            apiKey: data.settings.youtube.apiKey || '',
            autoSync: data.settings.youtube.autoSync || false,
            syncInterval: data.settings.youtube.syncInterval || 6,
            lastSync: data.settings.youtube.lastSync || null,
            syncStatus: data.settings.youtube.syncStatus || 'idle',
            syncError: data.settings.youtube.syncError || ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings. Using defaults.' })
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (data.success && data.user) {
        setCurrentUser(data.user)
        setProfileImage(data.user.profileImage || '')
        setProfileName(data.user.name || '')
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchAdmins = async () => {
    setAdminsLoading(true)
    try {
      const response = await fetch('/api/admins')
      const data = await response.json()
      
      if (data.success && data.admins) {
        setAdmins(data.admins)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      setMessage({ type: 'error', text: 'Failed to load admin users' })
    } finally {
      setAdminsLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...settings,
          youtube: youtubeSettings
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        setLogoPreview(settings.logoUrl)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  // Sync YouTube videos
  const handleSyncYouTube = async () => {
    setSyncing(true)
    setSyncMessage(null)

    try {
      const response = await fetch('/api/sermons/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channelId: youtubeSettings.channelId,
          channelUrl: youtubeSettings.channelUrl,
          apiKey: youtubeSettings.apiKey
        })
      })

      const data = await response.json()

      if (data.success) {
        setSyncMessage({
          type: 'success',
          text: `Successfully synced ${data.videosSynced} videos from YouTube`
        })
        // Refresh settings to get updated sync status
        fetchSettings()
      } else {
        setSyncMessage({
          type: 'error',
          text: data.error || 'Failed to sync YouTube videos'
        })
      }
    } catch (error) {
      console.error('Error syncing YouTube:', error)
      setSyncMessage({
        type: 'error',
        text: 'Failed to sync YouTube videos'
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleLogoUrlChange = (url: string) => {
    setSettings({ ...settings, logoUrl: url })
    setLogoPreview(url)
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'admins' && admins.length === 0) {
      fetchAdmins()
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return
    
    setProfileSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admins/${currentUser.adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileName,
          profileImage: profileImage
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Update current user state
        setCurrentUser({ ...currentUser, name: profileName, profileImage })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleSelectAvatar = (avatarUrl: string) => {
    setProfileImage(avatarUrl)
    setShowCustomUrlInput(false)
    setCustomUrl('')
  }

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      setProfileImage(customUrl.trim())
      setShowCustomUrlInput(false)
    }
  }

  const openAddAdminModal = () => {
    setEditingAdmin(null)
    setAdminForm({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      isActive: true
    })
    setModalError('')
    setShowAdminModal(true)
  }

  const openEditAdminModal = (admin: AdminUser) => {
    setEditingAdmin(admin)
    setAdminForm({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      isActive: admin.isActive
    })
    setModalError('')
    setShowAdminModal(true)
  }

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return

    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Admin deleted successfully' })
        fetchAdmins()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete admin' })
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      setMessage({ type: 'error', text: 'Failed to delete admin' })
    }
  }

  const handleSaveAdmin = async () => {
    setModalLoading(true)
    setModalError('')

    try {
      if (editingAdmin) {
        const response = await fetch(`/api/admins/${editingAdmin._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(adminForm)
        })
        const data = await response.json()

        if (data.success) {
          setMessage({ type: 'success', text: 'Admin updated successfully' })
          setShowAdminModal(false)
          fetchAdmins()
        } else {
          setModalError(data.error || 'Failed to update admin')
        }
      } else {
        const response = await fetch('/api/admins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(adminForm)
        })
        const data = await response.json()

        if (data.success) {
          setMessage({ type: 'success', text: 'Admin created successfully' })
          setShowAdminModal(false)
          fetchAdmins()
        } else {
          setModalError(data.error || 'Failed to create admin')
        }
      }
    } catch (error) {
      console.error('Error saving admin:', error)
      setModalError('An error occurred. Please try again.')
    } finally {
      setModalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Main content */}
      <div className={`max-w-6xl mx-auto transition-all duration-300 ${showAdminModal ? 'pointer-events-none select-none opacity-50' : ''}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-accent" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your church settings and admin users</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('branding')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branding'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ImageIcon className="inline h-4 w-4 mr-2" />
            Branding
          </button>
          <button
            onClick={() => handleTabChange('youtube')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'youtube'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Youtube className="inline h-4 w-4 mr-2" />
            YouTube
          </button>
          <button
            onClick={() => handleTabChange('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="inline h-4 w-4 mr-2" />
            Profile
          </button>
          <button
            onClick={() => handleTabChange('admins')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'admins'
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="inline h-4 w-4 mr-2" />
            Admin Users
          </button>
        </nav>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-3" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-3" />
          )}
          {message.text}
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-accent" />
              Church Logo
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Preview
              </label>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[150px]">
                {logoPreview ? (
                  <div className="relative">
                    <Image
                      src={logoPreview}
                      alt="Church Logo Preview"
                      width={200}
                      height={100}
                      className="max-w-[200px] max-h-[100px] object-contain"
                      onError={() => {
                        setLogoPreview('')
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>No logo preview available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={settings.logoUrl}
                onChange={(e) => handleLogoUrlChange(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the URL of your church logo or upload an image to the media library
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">
                To upload a custom logo:
              </p>
              <ol className="text-sm text-gray-500 list-decimal list-inside space-y-1">
                <li>Go to Media Library</li>
                <li>Upload your logo image</li>
                <li>Copy the image URL</li>
                <li>Paste it in the Logo URL field above</li>
              </ol>
              <a
                href="/admin/media"
                className="inline-flex items-center mt-3 text-accent hover:text-red-600 text-sm font-medium"
              >
                Go to Media Library →
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Church Information
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Church Name
              </label>
              <input
                type="text"
                value={settings.churchName}
                onChange={(e) => setSettings({ ...settings, churchName: e.target.value })}
                placeholder="Your Church Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Church Tagline
              </label>
              <input
                type="text"
                value={settings.churchTagline}
                onChange={(e) => setSettings({ ...settings, churchTagline: e.target.value })}
                placeholder="Your Church Tagline"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                This appears below the church name in the header
              </p>
            </div>

            <div className="border-t pt-6 mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Header Preview
              </label>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Image
                    src={logoPreview || '/church-logo.svg'}
                    alt="Logo"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                  <div>
                    <p className="font-bold text-gray-800">{settings.churchName || 'Church Name'}</p>
                    <p className="text-sm text-gray-500">{settings.churchTagline || 'Church Tagline'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'youtube' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <Youtube className="h-6 w-6 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">
              YouTube Channel Settings
            </h2>
          </div>

          <p className="text-gray-600 mb-6">
            Configure your YouTube channel to automatically import sermons to your website.
            Videos from your channel will appear alongside manually uploaded sermons.
          </p>

          {/* Sync Status */}
          <div className={`mb-6 p-4 rounded-lg ${
            youtubeSettings.syncStatus === 'success' ? 'bg-green-50 border border-green-200' :
            youtubeSettings.syncStatus === 'error' ? 'bg-red-50 border border-red-200' :
            youtubeSettings.syncStatus === 'syncing' ? 'bg-blue-50 border border-blue-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {youtubeSettings.syncStatus === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                )}
                {youtubeSettings.syncStatus === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                {youtubeSettings.syncStatus === 'syncing' && (
                  <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
                )}
                {youtubeSettings.syncStatus === 'idle' && (
                  <Youtube className="h-5 w-5 text-gray-400 mr-2" />
                )}
                <div>
                  <p className="font-medium">
                    {youtubeSettings.syncStatus === 'success' && 'YouTube videos synced successfully'}
                    {youtubeSettings.syncStatus === 'error' && 'Sync failed'}
                    {youtubeSettings.syncStatus === 'syncing' && 'Syncing videos...'}
                    {youtubeSettings.syncStatus === 'idle' && 'Not synced yet'}
                  </p>
                  {youtubeSettings.lastSync && (
                    <p className="text-sm text-gray-500">
                      Last sync: {new Date(youtubeSettings.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleSyncYouTube}
                disabled={syncing || !youtubeSettings.channelId}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </button>
            </div>
            {youtubeSettings.syncError && (
              <p className="text-red-600 text-sm mt-2">{youtubeSettings.syncError}</p>
            )}
          </div>

          {/* Sync Message */}
          {syncMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              syncMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={syncMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {syncMessage.text}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Channel Configuration</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Channel URL *
                </label>
                <input
                  type="url"
                  value={youtubeSettings.channelUrl}
                  onChange={(e) => setYoutubeSettings({ ...youtubeSettings, channelUrl: e.target.value })}
                  placeholder="https://www.youtube.com/@ChannelName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter your YouTube channel URL (e.g., @ChannelName or channel ID)
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={youtubeSettings.channelName}
                  onChange={(e) => setYoutubeSettings({ ...youtubeSettings, channelName: e.target.value })}
                  placeholder="Your Church Channel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Display name for your channel (auto-detected after sync)
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (Optional)
                </label>
                <input
                  type="text"
                  value={youtubeSettings.apiKey}
                  onChange={(e) => setYoutubeSettings({ ...youtubeSettings, apiKey: e.target.value })}
                  placeholder="Your YouTube Data API v3 Key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Add an API key for more reliable syncing.
                  <a 
                    href="https://developers.google.com/youtube/v3/getting-started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline ml-1 inline-flex items-center"
                  >
                    Get API Key <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={youtubeSettings.autoSync}
                    onChange={(e) => setYoutubeSettings({ ...youtubeSettings, autoSync: e.target.checked })}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable automatic syncing</span>
                </label>
              </div>

              {youtubeSettings.autoSync && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sync Interval (hours)
                  </label>
                  <select
                    value={youtubeSettings.syncInterval}
                    onChange={(e) => setYoutubeSettings({ ...youtubeSettings, syncInterval: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value={1}>Every hour</option>
                    <option value={6}>Every 6 hours</option>
                    <option value={12}>Every 12 hours</option>
                    <option value={24}>Once a day</option>
                    <option value={168}>Once a week</option>
                  </select>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">How to Find Your Channel</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2">Option 1: Using Channel URL</h4>
                <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                  <li>Go to your YouTube channel page</li>
                  <li>Copy the URL from your browser</li>
                  <li>Paste it in the Channel URL field above</li>
                </ol>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2">Option 2: Using Channel ID</h4>
                <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                  <li>Go to your YouTube channel</li>
                  <li>Click "About" tab</li>
                  <li>Click "Share" then "Copy channel ID"</li>
                  <li>Paste the ID in the Channel URL field</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-700">Note</h4>
                    <p className="text-sm text-blue-600 mt-1">
                      Without an API key, YouTube's rate limits may apply. For best results,
                      we recommend obtaining a free YouTube Data API v3 key.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save YouTube Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && currentUser && (
        <div className="max-w-4xl mx-auto">
          {currentUser.role === 'super_admin' ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-700">Super Admin Account</h3>
                  <p className="text-sm text-yellow-600 mt-1">
                    As a super admin, your profile is managed centrally and cannot be modified here.
                    Your name is displayed as "Admin" across the system.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-accent" />
                Profile Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Information</h3>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your Display Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This name will be displayed in the admin panel header
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${
                        currentUser.role === 'super_admin' 
                          ? 'bg-purple-100 text-purple-700'
                          : currentUser.role === 'admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Contact a super admin to change your role
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Picture</h3>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Profile Image
                    </label>
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-6 min-h-[150px]">
                      {profileImage ? (
                        <div className="relative">
                          <Image
                            src={profileImage}
                            alt="Profile Image"
                            width={120}
                            height={120}
                            className="rounded-full object-cover"
                            onError={() => {
                              setProfileImage('')
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-white">
                          <span className="text-3xl font-bold">
                            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose an Avatar
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATAR_OPTIONS.map((avatar, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectAvatar(avatar)}
                          className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition duration-200 ${
                            profileImage === avatar
                              ? 'border-accent ring-2 ring-accent ring-opacity-50'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={avatar}
                            alt={`Avatar ${index + 1}`}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <button
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className="flex items-center text-sm text-accent hover:text-red-600 font-medium"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {showCustomUrlInput ? 'Cancel custom URL' : 'Use custom image URL'}
                    </button>
                    
                    {showCustomUrlInput && (
                      <div className="mt-3 flex space-x-2">
                        <input
                          type="url"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="https://example.com/your-image.jpg"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                        <button
                          onClick={handleCustomUrlSubmit}
                          disabled={!customUrl.trim()}
                          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {profileImage && (
                    <div className="mb-6">
                      <button
                        onClick={() => setProfileImage('')}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove profile image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Users className="h-5 w-5 mr-2 text-accent" />
                Admin Users
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage admin user accounts and permissions
              </p>
            </div>
            {currentUser?.role === 'super_admin' && (
              <button
                onClick={openAddAdminModal}
                className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </button>
            )}
          </div>

          {/* Database not connected message */}
          {admins.length === 0 && !adminsLoading && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-700">Database not connected</h4>
                  <p className="text-sm text-yellow-600 mt-1">
                    Admin user management requires a MongoDB database connection. 
                    To enable admin management:
                  </p>
                  <ol className="text-sm text-yellow-600 mt-2 list-decimal list-inside space-y-1">
                    <li>Add MONGODB_URI to your .env.local file</li>
                    <li>Run the setup script: <code className="bg-yellow-100 px-1 rounded">node scripts/create-super-admin.js</code></li>
                    <li>Restart the development server</li>
                  </ol>
                  <p className="text-sm text-yellow-600 mt-3">
                    <strong>Dev Mode:</strong> Currently using built-in admin (admin@elshaddai.com / admin123)
                  </p>
                </div>
              </div>
            </div>
          )}

          {adminsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : admins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{admin.name}</span>
                          {admin._id === currentUser?.adminId && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{admin.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          admin.role === 'super_admin' 
                            ? 'bg-purple-100 text-purple-700'
                            : admin.role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {admin.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          admin.isActive 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {currentUser?.role === 'super_admin' && admin.role !== 'super_admin' && (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditAdminModal(admin)}
                              className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 rounded-lg transition duration-200"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin._id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      )}
      </div>

      {/* Modal - OUTSIDE the blurred content */}
      {showAdminModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop - transparent with blur effect */}
          <div className="absolute inset-0 backdrop-blur-sm" />
          {/* Modal form - not blurred */}
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                  disabled={editingAdmin !== null}
                />
              </div>

              {!editingAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    required={!editingAdmin}
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as 'admin' | 'editor' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              {editingAdmin && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={adminForm.isActive}
                      onChange={(e) => setAdminForm({ ...adminForm, isActive: e.target.checked })}
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdmin}
                disabled={modalLoading}
                className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

