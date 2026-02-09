'use client'

import { useState, useEffect } from 'react'
import SplashScreen from '@/components/SplashScreen'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Check if user has already seen the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')
    if (hasSeenSplash) {
      setShowSplash(false)
    }
  }, [])

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true')
    setShowSplash(false)
  }

  // Prevent hydration mismatch - don't render anything during SSR
  if (!isMounted) {
    return null
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={showSplash ? 'hidden' : ''}>
        {children}
      </div>
    </>
  )
}

