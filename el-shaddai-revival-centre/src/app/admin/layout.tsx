'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  FileAudio,
  Calendar,
  MessageSquare,
  Users, 
  Menu, 
  X,
  LogOut,
  Settings,
  Loader2,
  User
} from 'lucide-react'

interface Settings {
  churchName: string
  churchTagline: string
  logoUrl: string
}

interface User {
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

const DEFAULT_LOGO_URL = 'https://pentecost.ca/wp-content/uploads/2025/03/The-Church-Pentecost-Logo-1.png'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Testimonies', href: '/admin/testimonies', icon: MessageSquare },
  { name: 'Teams', href: '/admin/teams', icon: Users },
  { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { name: 'Sermons', href: '/admin/sermons', icon: FileAudio },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Default to open
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetchSettings()
    fetchUser()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.success && data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Ensure cookies are sent
      })
      const data = await response.json()
      
      if (data.success && data.user) {
        setUser(data.user)
      } else {
        // Clear any stale state and redirect
        setUser(null)
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      // On network error, still redirect to login
      setUser(null)
      router.push('/admin/login')
    } finally {
      setUserLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Use window.location for full page reload to clear cookies properly
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback to redirect even on error
      window.location.href = '/admin/login'
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-primary text-white transition-all duration-300 fixed h-full z-30 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <Link href="/admin" className="flex items-center space-x-2">
                {loading ? (
                  <div className="relative w-10 h-10">
                    <Image
                      src={DEFAULT_LOGO_URL}
                      alt="Church Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative w-10 h-10">
                    <Image
                      src={settings.logoUrl || defaultSettings.logoUrl}
                      alt="Church Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-lg font-bold">Admin Panel</span>
                  {!loading && settings.churchName && (
                    <span className="text-xs text-gray-300">{settings.churchName}</span>
                  )}
                </div>
              </Link>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition duration-300 ${
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {isSidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700 flex-shrink-0 bg-primary mb-18">
          {user && (
            <div className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} mb-2`}>
              {/* Check profileImage FIRST, then fallback to initial */}
              {user.profileImage ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={user.profileImage}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white">
                  {user.name ? (
                    <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
              )}
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition duration-300"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main 
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <header className="bg-white shadow-md px-4 py-3 flex justify-between items-center sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-gray-800">
            {navItems.find(item => pathname.startsWith(item.href))?.name || 'Admin Panel'}
          </h1>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                {/* Check profileImage FIRST, then fallback to initial */}
                {user.profileImage ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mb-1">
                    <Image
                      src={user.profileImage}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold shrink-0 mb-1">
                    {user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800 leading-none">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500 leading-none mt-0.5">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

