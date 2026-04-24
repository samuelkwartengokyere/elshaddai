'use client'

import { useState, useEffect, useRef } from 'react'
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
  X,
  User,
  Upload,
  Youtube,
  Wrench,
  RefreshCw,
  Clock
} from 'lucide-react'
import { DEFAULT_ADMIN_PROFILE_IMAGE } from '@/lib/auth'

interface Settings {
  churchName: string
  churchTagline: string
  logoUrl: string
  maintenanceMode?: boolean
  maintenanceMessage?: string
  youtube?: {
    channelId: string
    channelName: string
    channelUrl: string
    apiKey: string
    playlistId: string
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
  profileImage?: string
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

const AVATAR_OPTIONS = [
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2235%22 r=%2225%22 fill=%22%234F46E5%22/%3E%3Cpath d=%22M10 90 Q50 50 90 90%22 fill=%22%234F46E5%22/%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2235%22 r=%2225%22 fill=%22%23DC2626%22/%3E%3Cpath d=%22M10 90 Q50 50 90 90%22 fill=%22%23DC2626%22/%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2235%22 r=%2225%22 fill=%22%23059669%22/%3E%3Cpath d=%22M10 90 Q50 50 90 90%22 fill=%22%23059669%22/%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2235%22 r=%2225%22 fill=%22%23D97706%22/%3E%3Cpath d=%22M10 90 Q50 50 90 90%22 fill=%22%23D97706%22/%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2235%22 r=%2225%22 fill=%22%237C3AED%22/%3E%3Cpath d=%22M10 90 Q50 50 90 90%22 fill=%22%237C3AED%22/%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2235%22 r=%2225%22 fill=%22%23DB2777%22/%3E%3Cpath d=%22M10 90 Q50 50 90 90%22 fill=%22%23DB2777%22/%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2235%22 r=%2225%22 fill=%22%230369A1%22/%3E%3Cpath d=%22M10 90 Q50 50 90 90%22 fill=%22%230369A1%22/%3E%3C/svg%3E',
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2235%22 r=%2225%22 fill=%22%23E11D48%22/%3E%3Cpath d=%22M10 90 Q50 50 90 90%22 fill=%22%23E11D48%22/%3E%3C/svg%3E',
]

const AVATAR_NAMES = ['Blue', 'Red', 'Green', 'Amber', 'Purple', 'Pink', 'Teal', 'Rose']

const AVATAR_COLORS = [
  'bg-blue-100', 'bg-red-100', 'bg-green-100', 'bg-yellow-100',
  'bg-purple-100', 'bg-pink-100', 'bg-teal-100', 'bg-rose-100'
]

type Tab = 'branding' | 'profile' | 'admins' | 'youtube' | 'maintenance'

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

  const [youtubeSettings, setYoutubeSettings] = useState({
    channelId: '', channelName: '', channelUrl: '', apiKey: '', playlistId: '',
    autoSync: false, syncInterval: 6, lastSync: null as Date | null,
    syncStatus: 'idle' as 'idle' | 'syncing' | 'success' | 'error', syncError: ''
  })
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [profileImage, setProfileImage] = useState<string>(DEFAULT_ADMIN_PROFILE_IMAGE)
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(0)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileName, setProfileName] = useState<string>('')
  const [customUrl, setCustomUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [showAdminModal, setShowAdminModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [adminForm, setAdminForm] = useState({
    name: '', email: '', password: '', role: 'admin' as 'super_admin' | 'admin' | 'editor', isActive: true
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const [maintenanceSaving, setMaintenanceSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchSettings(); fetchCurrentUser() }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.success && data.settings) {
        setSettings({
          churchName: data.settings.churchName || defaultSettings.churchName,
          churchTagline: data.settings.churchTagline || defaultSettings.churchTagline,
          logoUrl: data.settings.logoUrl || defaultSettings.logoUrl,
          maintenanceMode: data.settings.maintenanceMode || false,
          maintenanceMessage: data.settings.maintenanceMessage || ''
        })
        setLogoPreview(data.settings.logoUrl || defaultSettings.logoUrl)
        setMaintenanceMode(data.settings.maintenanceMode || false)
        setMaintenanceMessage(data.settings.maintenanceMessage || '')
        if (data.settings.youtube) {
          setYoutubeSettings({
            channelId: data.settings.youtube.channelId || '',
            channelName: data.settings.youtube.channelName || '',
            channelUrl: data.settings.youtube.channelUrl || '',
            apiKey: data.settings.youtube.apiKey || '',
            playlistId: data.settings.youtube.playlistId || '',
            autoSync: data.settings.youtube.autoSync || false,
            syncInterval: data.settings.youtube.syncInterval || 6,
            lastSync: data.settings.youtube.lastSync ? new Date(data.settings.youtube.lastSync) : null,
            syncStatus: data.settings.youtube.syncStatus || 'idle',
            syncError: data.settings.youtube.syncError || ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings. Using defaults.' })
    } finally { setLoading(false) }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      if (data.success && data.user) {
        setCurrentUser(data.user)
        setProfileImage(data.user.profileImage || DEFAULT_ADMIN_PROFILE_IMAGE)
        setProfileName(data.user.name || '')
      }
    } catch (error) { console.error('Error fetching current user:', error) }
  }

  const fetchAdmins = async () => {
    setAdminsLoading(true)
    try {
      const response = await fetch('/api/admins')
      const data = await response.json()
      if (data.success && data.admins) { setAdmins(data.admins) }
    } catch (error) {
      console.error('Error fetching admins:', error)
      setMessage({ type: 'error', text: 'Failed to load admin users' })
    } finally { setAdminsLoading(false) }
  }

  const handleSave = async (autoSyncAfterSave = false) => {
    setSaving(true); setMessage(null)
    try {
      const settingsToSave = {
        churchName: settings.churchName, churchTagline: settings.churchTagline, logoUrl: settings.logoUrl,
        youtube: { channelId: youtubeSettings.channelId || '', channelName: youtubeSettings.channelName || '',
          channelUrl: youtubeSettings.channelUrl || '', apiKey: youtubeSettings.apiKey || '',
          playlistId: youtubeSettings.playlistId || '',
          autoSync: youtubeSettings.autoSync || false, syncInterval: youtubeSettings.syncInterval || 6,
          lastSync: youtubeSettings.lastSync, syncStatus: youtubeSettings.syncStatus || 'idle', syncError: youtubeSettings.syncError || ''
        }
      }
      const response = await fetch('/api/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        setLogoPreview(settings.logoUrl)
        if (data.settings) {
          setSettings({ churchName: data.settings.churchName || settings.churchName,
            churchTagline: data.settings.churchTagline || settings.churchTagline, logoUrl: data.settings.logoUrl || settings.logoUrl })
          if (data.settings.youtube) {
            setYoutubeSettings({ channelId: data.settings.youtube.channelId || '', channelName: data.settings.youtube.channelName || '',
              channelUrl: data.settings.youtube.channelUrl || '', apiKey: data.settings.youtube.apiKey || '',
              playlistId: data.settings.youtube.playlistId || '',
              autoSync: data.settings.youtube.autoSync || false, syncInterval: data.settings.youtube.syncInterval || 6,
              lastSync: data.settings.youtube.lastSync, syncStatus: data.settings.youtube.syncStatus || 'idle',
              syncError: data.settings.youtube.syncError || ''
            })
          }
        }
        if (autoSyncAfterSave && (youtubeSettings.channelId || youtubeSettings.channelUrl)) {
          setTimeout(() => { handleSyncYouTube() }, 500)
        }
      } else { setMessage({ type: 'error', text: data.error || 'Failed to save settings' }) }
    } catch (error) { console.error('Error saving settings:', error); setMessage({ type: 'error', text: 'Failed to save settings' }) }
    finally { setSaving(false) }
  }

  const handleSyncYouTube = async () => {
    setSyncing(true); setSyncMessage(null)
    try {
      const response = await fetch('/api/sermons/youtube', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: youtubeSettings.channelId, channelUrl: youtubeSettings.channelUrl, apiKey: youtubeSettings.apiKey, playlistId: youtubeSettings.playlistId })
      })
      const data = await response.json()
      if (data.success) {
        setSyncMessage({ type: 'success', text: `Successfully synced ${data.videosSynced} videos from YouTube` })
        fetchSettings()
      } else { setSyncMessage({ type: 'error', text: data.error || 'Failed to sync YouTube videos' }) }
    } catch (error) { console.error('Error syncing YouTube:', error); setSyncMessage({ type: 'error', text: 'Failed to sync YouTube videos' }) }
    finally { setSyncing(false) }
  }

  const extractPlaylistId = (url: string): string => {
    if (!url) return ''
    const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/)
    if (playlistMatch && playlistMatch[1]) {
      return playlistMatch[1]
    }
    if (url.match(/^[a-zA-Z0-9_-]{20,40}$/)) {
      return url
    }
    return ''
  }

  const handleExtractPlaylistId = () => {
    const extractedId = extractPlaylistId(youtubeSettings.playlistId || youtubeSettings.channelUrl)
    if (extractedId) {
      setYoutubeSettings({ ...youtubeSettings, playlistId: extractedId })
      setSyncMessage({ type: 'success', text: `Extracted playlist ID: ${extractedId}` })
    } else {
      setSyncMessage({ type: 'error', text: 'Could not extract playlist ID from the provided URL' })
    }
  }

  const handleLogoUrlChange = (url: string) => { setSettings({ ...settings, logoUrl: url }); setLogoPreview(url) }

  const handleTabChange = (tab: Tab) => { setActiveTab(tab); if (tab === 'admins' && admins.length === 0) { fetchAdmins() } }

  const handleSaveProfile = async () => {
    if (!currentUser) return
    setProfileSaving(true); setMessage(null)
    try {
      // Save empty string to DB when using default image, keeping DB clean
      const imageToSave = profileImage === DEFAULT_ADMIN_PROFILE_IMAGE ? '' : profileImage
      const response = await fetch(`/api/admins/${currentUser.adminId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, profile_image: imageToSave })
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setCurrentUser({ ...currentUser, name: profileName, profileImage })
        fetchSettings()
        window.location.reload()
      } else { setMessage({ type: 'error', text: data.error || 'Failed to update profile' }) }
    } catch (error) { console.error('Error saving profile:', error); setMessage({ type: 'error', text: 'Failed to update profile' }) }
    finally { setProfileSaving(false) }
  }

  const handleSelectAvatar = (avatarUrl: string, index: number) => {
    setProfileImage(avatarUrl); setSelectedAvatarIndex(index); setCustomUrl('')
  }

  const handleDeleteProfileImage = () => {
    setProfileImage(DEFAULT_ADMIN_PROFILE_IMAGE)
    setSelectedAvatarIndex(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) { setMessage({ type: 'error', text: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' }); return }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) { setMessage({ type: 'error', text: 'File too large. Maximum size is 5MB.' }); return }
    setUploadingImage(true); setMessage(null)
    try {
      const formData = new FormData(); formData.append('file', file)
      const response = await fetch('/api/admins/profile-image', { method: 'POST', body: formData, credentials: 'include' })
      const data = await response.json()
      if (data.success) { setProfileImage(data.url); setMessage({ type: 'success', text: 'Image uploaded successfully!' }) }
      else { setMessage({ type: 'error', text: data.error || `Failed to upload image (status ${response.status})` }) }
    } catch (error) { console.error('Error uploading image:', error); setMessage({ type: 'error', text: 'Failed to upload image. Check console for details.' }) }
    finally { setUploadingImage(false) }
  }

  const openAddAdminModal = () => { setEditingAdmin(null); setAdminForm({ name: '', email: '', password: '', role: 'admin', isActive: true }); setModalError(''); setShowAdminModal(true) }
  const openEditAdminModal = (admin: AdminUser) => { setEditingAdmin(admin); setAdminForm({ name: admin.name, email: admin.email, password: '', role: admin.role, isActive: admin.isActive }); setModalError(''); setShowAdminModal(true) }

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return
    setDeletingAdminId(adminId)
    try {
      const response = await fetch(`/api/admins/${adminId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) { alert('Admin deleted successfully!'); fetchAdmins() } else { alert(data.error || 'Failed to delete admin') }
    } catch (error) { console.error('Error deleting admin:', error); alert('An error occurred while deleting') }
    finally { setDeletingAdminId(null) }
  }

  const handleSaveAdmin = async () => {
    setModalLoading(true); setModalError('')
    try {
      if (editingAdmin) {
        const response = await fetch(`/api/admins/${editingAdmin._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adminForm) })
        const data = await response.json()
        if (data.success) { setMessage({ type: 'success', text: 'Admin updated successfully' }); setShowAdminModal(false); fetchAdmins() }
        else { setModalError(data.error || 'Failed to update admin') }
      } else {
        const response = await fetch('/api/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adminForm) })
        const data = await response.json()
        if (data.success) { setMessage({ type: 'success', text: 'Admin created successfully' }); setShowAdminModal(false); fetchAdmins() }
        else { setModalError(data.error || 'Failed to create admin') }
      }
    } catch (error) { console.error('Error saving admin:', error); setModalError('An error occurred. Please try again.') }
    finally { setModalLoading(false) }
  }

  const handleSaveMaintenance = async () => {
    setMaintenanceSaving(true); setMessage(null)
    try {
      const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceMode, maintenanceMessage }) })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: maintenanceMode ? 'Maintenance mode enabled!' : 'Maintenance mode disabled!' })
        fetchSettings()
      } else { setMessage({ type: 'error', text: data.error || 'Failed to update maintenance settings' }) }
    } catch (error) { console.error('Error saving maintenance settings:', error); setMessage({ type: 'error', text: 'Failed to update maintenance settings' }) }
    finally { setMaintenanceSaving(false) }
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
      <div className={`max-w-6xl mx-auto transition-all duration-300 ${showAdminModal ? 'pointer-events-none select-none opacity-50' : ''}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3 text-accent" /> Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your church settings and admin users</p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => handleTabChange('branding')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'branding' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <ImageIcon className="inline h-4 w-4 mr-2" /> Branding
            </button>
            <button onClick={() => handleTabChange('youtube')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'youtube' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Youtube className="inline h-4 w-4 mr-2" /> YouTube
            </button>
            <button onClick={() => handleTabChange('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <User className="inline h-4 w-4 mr-2" /> Profile
            </button>
            <button onClick={() => handleTabChange('admins')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'admins' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Users className="inline h-4 w-4 mr-2" /> Admin Users
            </button>
            <button onClick={() => handleTabChange('maintenance')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'maintenance' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Wrench className="inline h-4 w-4 mr-2" /> Maintenance
            </button>
          </nav>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-3" /> : <AlertCircle className="h-5 w-5 mr-3" />}
            {message.text}
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><ImageIcon className="h-5 w-5 mr-2 text-accent" /> Church Logo</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Preview</label>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[150px]">
                {logoPreview ? (
                  <Image src={logoPreview} alt="Church Logo Preview" width={200} height={100} className="max-w-[200px] max-h-[100px] object-contain" onError={() => setLogoPreview('')} />
                ) : (
                  <div className="text-center text-gray-400"><ImageIcon className="h-12 w-12 mx-auto mb-2" /><p>No logo preview available</p></div>
                )}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input type="url" value={settings.logoUrl} onChange={(e) => handleLogoUrlChange(e.target.value)} placeholder="https://example.com/logo.png" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Church Information</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Church Name</label>
              <input type="text" value={settings.churchName} onChange={(e) => setSettings({ ...settings, churchName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Church Tagline</label>
              <input type="text" value={settings.churchTagline} onChange={(e) => setSettings({ ...settings, churchTagline: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" />
            </div>
          </div>
        )}

        {activeTab === 'youtube' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Config warning - shown only in admin when unconfigured */}
            {(!youtubeSettings.channelId && !youtubeSettings.channelUrl) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-700">YouTube Channel Not Configured</h3>
                    <p className="text-sm text-yellow-600 mt-1">
                      To enable live streaming and auto-sync sermons on the public website, configure your YouTube channel below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center mb-6"><Youtube className="h-6 w-6 text-red-600 mr-3" /><h2 className="text-xl font-bold text-gray-800">YouTube Channel Settings</h2></div>
            
            {/* Sync Status Display */}
            {youtubeSettings.lastSync && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Last synced: {new Date(youtubeSettings.lastSync).toLocaleString()}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  youtubeSettings.syncStatus === 'success' ? 'bg-green-100 text-green-800' :
                  youtubeSettings.syncStatus === 'error' ? 'bg-red-100 text-red-800' :
                  youtubeSettings.syncStatus === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {youtubeSettings.syncStatus === 'success' ? '✓ Synced' :
                   youtubeSettings.syncStatus === 'error' ? '✗ Error' :
                   youtubeSettings.syncStatus === 'syncing' ? '⟳ Syncing...' :
                   'Idle'}
                </div>
              </div>
            )}

            {/* Sync Message */}
            {syncMessage && (
              <div className={`mb-6 p-4 rounded-lg flex items-center ${syncMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {syncMessage.type === 'success' ? <CheckCircle className="h-5 w-5 mr-3" /> : <AlertCircle className="h-5 w-5 mr-3" />}
                {syncMessage.text}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Playlist URL or ID</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={youtubeSettings.playlistId} 
                      onChange={(e) => setYoutubeSettings({ ...youtubeSettings, playlistId: e.target.value })} 
                      placeholder="Paste full playlist URL or just the ID" 
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" 
                    />
                    <button 
                      onClick={handleExtractPlaylistId}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                      title="Extract Playlist ID from URL"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Paste your playlist URL: https://youtube.com/playlist?list=PLnsERQ-tij2GegNkZ2G-3VZRBodovqWWp</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key (Required)</label>
                  <input 
                    type="text" 
                    value={youtubeSettings.apiKey} 
                    onChange={(e) => setYoutubeSettings({ ...youtubeSettings, apiKey: e.target.value })} 
                    placeholder="Enter your YouTube Data API v3 key" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" 
                  />
                  <p className="text-sm text-gray-500 mt-1">Get your API key from Google Cloud Console</p>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={youtubeSettings.autoSync} 
                      onChange={(e) => setYoutubeSettings({ ...youtubeSettings, autoSync: e.target.checked })} 
                      className="h-4 w-4 mr-2 text-accent focus:ring-accent"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Auto-Sync</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Automatically fetch new videos when they are added to the playlist</p>
                </div>

                {youtubeSettings.autoSync && (
                  <div className="mb-4 ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sync Interval</label>
                    <select 
                      value={youtubeSettings.syncInterval} 
                      onChange={(e) => setYoutubeSettings({ ...youtubeSettings, syncInterval: parseInt(e.target.value) })} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      <option value={1}>Every 1 hour</option>
                      <option value={3}>Every 3 hours</option>
                      <option value={6}>Every 6 hours</option>
                      <option value={12}>Every 12 hours</option>
                      <option value={24}>Every 24 hours</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
              <button 
                onClick={() => handleSave(false)} 
                disabled={saving} 
                className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Saving...</> : <><Save className="h-5 w-5 mr-2" />Save Settings</>}
              </button>
              
              <button 
                onClick={handleSyncYouTube} 
                disabled={syncing || !youtubeSettings.playlistId || !youtubeSettings.apiKey} 
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                title={!youtubeSettings.playlistId ? "Please enter a Playlist ID first" : !youtubeSettings.apiKey ? "Please enter an API Key first" : "Sync now"}
              >
                {syncing ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Syncing...</> : <><RefreshCw className="h-5 w-5 mr-2" />Sync Now</>}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && currentUser && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><User className="h-5 w-5 mr-2 text-accent" />Profile Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" value={currentUser.email} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>
                </div>
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Profile Image</label>
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-6">
                      <img src={profileImage} alt="Profile" width={120} height={120} className="rounded-full object-cover" onError={() => setProfileImage(DEFAULT_ADMIN_PROFILE_IMAGE)} />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose an Avatar</label>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATAR_OPTIONS.map((avatar, index) => (
                        <button key={index} onClick={() => handleSelectAvatar(avatar, index)}
                          className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition duration-200 flex items-center justify-center text-3xl ${
                            selectedAvatarIndex === index ? 'border-accent ring-2 ring-accent ring-opacity-50 bg-accent/10' : `border-gray-300 hover:border-gray-400 ${AVATAR_COLORS[index]}`
                          }`}>
                          {AVATAR_NAMES[index]}
                          {selectedAvatarIndex === index && (
                            <div className="absolute top-0 right-0 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Or Upload from Device</label>
                    <div className="flex items-center space-x-3">
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="profile-upload" ref={fileInputRef} />
                      <label htmlFor="profile-upload" className={`flex items-center px-4 py-2 bg-gray-100 rounded-lg cursor-pointer ${uploadingImage ? 'opacity-50' : ''}`}>
                        {uploadingImage ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="h-4 w-4 mr-2" />Browse</>}
                      </label>
                      {profileImage !== DEFAULT_ADMIN_PROFILE_IMAGE && (
                        <button
                          onClick={handleDeleteProfileImage}
                          className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                          title="Remove uploaded image and revert to default avatar"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button onClick={handleSaveProfile} disabled={profileSaving} className="flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {profileSaving ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Saving...</> : <><Save className="h-5 w-5 mr-2" />Save Profile</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center"><Users className="h-5 w-5 mr-2 text-accent" />Admin Users</h2>
              {currentUser?.role === 'super_admin' && <button onClick={openAddAdminModal} className="flex items-center px-4 py-2 bg-accent text-white rounded-lg"><UserPlus className="h-4 w-4 mr-2" />Add Admin</button>}
            </div>
            {adminsLoading ? <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : admins.length > 0 ? (
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Email</th><th className="text-left py-3 px-4">Role</th><th className="text-left py-3 px-4">Actions</th></tr></thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin._id} className="border-b">
                      <td className="py-3 px-4 flex items-center">
                        <img src={admin.profileImage || DEFAULT_ADMIN_PROFILE_IMAGE} alt={admin.name} className="w-8 h-8 rounded-full object-cover mr-3" />
                        {admin.name}
                      </td>
                      <td className="py-3 px-4">{admin.email}</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 rounded text-xs bg-blue-100">{admin.role}</span></td>
                      <td className="py-3 px-4">
                        {currentUser?.role === 'super_admin' && <div className="flex space-x-2">
                          <button onClick={() => openEditAdminModal(admin)} className="p-2 hover:bg-gray-100 rounded"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteAdmin(admin._id)} className="p-2 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                        </div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6"><Wrench className="h-6 w-6 text-accent mr-3" /><h2 className="text-xl font-bold text-gray-800">Maintenance Mode</h2></div>
            <div className="mb-6">
              <label className="flex items-center">
                <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="h-4 w-4 mr-2" />
                <span>Enable Maintenance Mode</span>
              </label>
            </div>
            <button onClick={handleSaveMaintenance} disabled={maintenanceSaving} className="flex items-center px-6 py-3 bg-accent text-white rounded-lg">
              {maintenanceSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : 'Save'}
            </button>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="mt-8 flex justify-end">
            <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {saving ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Saving...</> : <><Save className="h-5 w-5 mr-2" />Save Settings</>}
            </button>
          </div>
        )}
      </div>

      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h3>
              <button onClick={() => setShowAdminModal(false)}><X className="h-5 w-5" /></button>
            </div>
            {modalError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{modalError}</div>}
            <div className="space-y-4">
              <div><label className="block text-sm mb-1">Name</label><input type="text" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Email</label><input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} disabled={!!editingAdmin} className="w-full px-4 py-2 border rounded-lg" /></div>
              {!editingAdmin && <div><label className="block text-sm mb-1">Password</label><input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>}
              <div><label className="block text-sm mb-1">Role</label><select value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as 'super_admin' | 'admin' | 'editor' })} className="w-full px-4 py-2 border rounded-lg"><option value="admin">Admin</option><option value="editor">Editor</option></select></div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowAdminModal(false)} className="px-4 py-2">Cancel</button>
              <button onClick={handleSaveAdmin} disabled={modalLoading} className="px-4 py-2 bg-accent text-white rounded-lg">{modalLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}