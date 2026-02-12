'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Settings {
  churchName: string
  churchTagline: string
  logoUrl: string
}

interface NavItem {
  name: string
  href?: string
  dropdown?: NavItem[]
}

const defaultSettings: Settings = {
  churchName: 'El-Shaddai Revival Centre',
  churchTagline: 'The Church Of Pentecost',
  logoUrl: 'https://pentecost.ca/wp-content/uploads/2025/03/The-Church-Pentecost-Logo-1.png'
}

const LOCAL_LOGO = 'https://pentecost.ca/wp-content/uploads/2025/03/The-Church-Pentecost-Logo-1.png'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMediaOpen, setIsMediaOpen] = useState(false)
  const [isMobileMediaOpen, setIsMobileMediaOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [logoError, setLogoError] = useState(false)
  const mediaDropdownRef = useRef<HTMLDivElement>(null)

  // Memoize navItems to prevent recreation on re-renders
  const navItems = useMemo<NavItem[]>(() => [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    {
      name: 'Media',
      dropdown: [
        { name: 'Sermons', href: '/sermons' },
        { name: 'Gallery', href: '/gallery' },
      ],
    },
    { name: 'Live Stream', href: '/live' },
    { name: 'Groups', href: '/groups' },
    { name: 'Give', href: '/give' },
    { name: 'Events', href: '/events' },
    { name: 'Testimonies', href: '/testimonies' },
    { name: 'Counselling', href: '/counselling' },
    { name: 'Contact', href: '/contact' },
  ], [])

  useEffect(() => {
    fetchSettings()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mediaDropdownRef.current && !mediaDropdownRef.current.contains(event.target as Node)) {
        setIsMediaOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
      // Use default settings on error
    } finally {
      setLoading(false)
    }
  }

  // Desktop Navigation Item Component
  const DesktopNavItem = ({ item }: { item: NavItem }) => {
    if (item.dropdown) {
      return (
        <motion.div
          key={item.name}
          className="relative"
          ref={mediaDropdownRef}
        >
          <button
            className="text-gray-700 hover:text-accent font-medium transition duration-300 flex items-center gap-1"
            onMouseEnter={() => setIsMediaOpen(true)}
            onClick={() => setIsMediaOpen(!isMediaOpen)}
          >
            <motion.span whileHover={{ color: '#dc2626' }} transition={{ duration: 0.2 }}>
              {item.name}
            </motion.span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${isMediaOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMediaOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                onMouseEnter={() => setIsMediaOpen(true)}
                onMouseLeave={() => setIsMediaOpen(false)}
              >
                {item.dropdown.map((dropdownItem) => (
                  <Link
                    key={dropdownItem.name}
                    href={dropdownItem.href || '#'}
                    className="block px-4 py-2 text-gray-700 hover:bg-accent hover:text-white transition duration-200"
                  >
                    {dropdownItem.name}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )
    }

    return (
      <motion.div
        key={item.name}
      >
        <Link
          href={item.href || '#'}
          className="text-gray-700 hover:text-accent font-medium transition duration-300 relative"
        >
          <motion.span whileHover={{ color: '#dc2626' }} transition={{ duration: 0.2 }}>
            {item.name}
          </motion.span>
        </Link>
      </motion.div>
    )
  }

  // Mobile Navigation Item Component
  const MobileNavItem = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const hasDropdown = item.dropdown && item.dropdown.length > 0

    return (
      <div className={level > 0 ? 'ml-4' : ''}>
        {hasDropdown ? (
          <div>
            <button
              className="text-gray-700 hover:text-accent font-medium py-2 block w-full text-left flex items-center justify-between"
              onClick={() => setIsMobileMediaOpen(!isMobileMediaOpen)}
            >
              <span>{item.name}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${isMobileMediaOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isMobileMediaOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {item.dropdown?.map((dropdownItem) => (
                    <MobileNavItem key={dropdownItem.name} item={dropdownItem} level={level + 1} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            href={item.href || '#'}
            className="text-gray-700 hover:text-accent font-medium py-2 block"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.span whileHover={{ x: 5, color: '#dc2626' }} transition={{ duration: 0.2 }}>
              {item.name}
            </motion.span>
          </Link>
        )}
      </div>
    )
  }

  return (
    <motion.header
      className="bg-white shadow-md sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={logoError ? LOCAL_LOGO : (settings.logoUrl || defaultSettings.logoUrl)}
                alt={settings.churchName || 'Church Logo'}
                width={50}
                height={50}
                className="object-contain"
                priority
                onError={() => setLogoError(true)}
              />
            </motion.div>
            <div className="flex flex-col">
              <motion.span
                className="text-xl md:text-2xl font-bold text-primary leading-tight"
                whileHover={{ scale: 1.02 }}
              >
                {settings.churchName || defaultSettings.churchName}
              </motion.span>
              <motion.span
                className="text-sm md:text-base font-medium text-gray-500"
                whileHover={{ scale: 1.02 }}
              >
                {settings.churchTagline || defaultSettings.churchTagline}
              </motion.span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <DesktopNavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pb-4 overflow-hidden"
            >
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <motion.div
                    key={item.name}
                  >
                    <MobileNavItem item={item} />
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
