'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Hero() {
  const [isLive, setIsLive] = useState(false)

  // Check if live stream is active
  useEffect(() => {
    const checkLiveStatus = () => {
      const now = new Date()
      const day = now.getDay()
      const hour = now.getHours()
      // Example: Live on Sundays 9am-12pm
      setIsLive(day === 0 && hour >= 9 && hour < 12)
    }
    
    checkLiveStatus()
    const interval = setInterval(checkLiveStatus, 60000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome Home
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join us as we worship, grow, and serve together in Christ's love
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/live" 
            className="bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition duration-300 inline-block"
          >
            Join Us Live
          </Link>
          <Link 
            href="/sermons" 
            className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 inline-block"
          >
            Watch Sermons
          </Link>
        </div>
        
        {isLive && (
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-red-600 rounded-full animate-pulse">
            <span className="h-2 w-2 bg-white rounded-full mr-2"></span>
            Live Now
          </div>
        )}
      </div>
    </section>
  )
}

