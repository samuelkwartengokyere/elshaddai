'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20 min-h-[800px] flex flex-col justify-center items-center">
      <motion.div
        className="container mx-auto px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-6 !text-white"
          variants={itemVariants}
        >
          Welcome to El-Shaddai Revival Centre
        </motion.h1>
        <motion.p
          className="text-xl mb-8 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Join us as we worship, grow, and serve together in Christ&apos;s love
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/live"
              className="bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition duration-300 inline-block"
            >
              Join Us Live
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/sermons"
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 inline-block"
            >
              Watch Sermons
            </Link>
          </motion.div>
        </motion.div>
        
        {isLive && (
          <motion.div
            className="mt-6 inline-flex items-center px-4 py-2 bg-red-600 rounded-full animate-pulse"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.span
              className="h-2 w-2 bg-white rounded-full mr-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            Live Now
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}

