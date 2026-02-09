'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
  duration?: number
}

const churchName = 'El-Shaddai Revival Centre'
const words = churchName.split(' ')

export default function ModernWaveSplashScreen({ onComplete, duration = 5000 }: SplashScreenProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const timer = setTimeout(() => onComplete(), duration)
    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!isMounted) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="wave-splash"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* ===== ANIMATED WAVE BACKGROUND (Inspired by the image) ===== */}
        <div className="absolute inset-0">
          {/* Deep Base Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-blue-950/40" />

          {/* Animated Wave Layer 1 - Largest, Slowest */}
          <motion.div
            className="absolute bottom-0 left-1/4 w-[150%] h-3/4 rounded-t-[50%] bg-gradient-to-t from-blue-600/15 via-cyan-400/10 to-transparent"
            animate={{
              x: ['0%', '-5%', '0%'],
              y: ['0%', '1%', '0%'],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Animated Wave Layer 2 */}
          <motion.div
            className="absolute bottom-0 left-0 w-[140%] h-2/3 rounded-t-[45%] bg-gradient-to-t from-blue-500/20 via-sky-300/15 to-transparent blur-[1px]"
            animate={{
              x: ['0%', '-8%', '0%'],
              y: ['0%', '2%', '0%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Animated Wave Layer 3 - Most prominent white wave */}
          <motion.div
            className="absolute bottom-0 -left-10 w-[130%] h-1/2 rounded-t-[40%] bg-gradient-to-t from-white/30 via-white/20 to-transparent blur-[2px]"
            animate={{
              x: ['0%', '-10%', '0%'],
              y: ['0%', '3%', '0%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Animated Wave Layer 4 - Top highlight */}
          <motion.div
            className="absolute bottom-0 -left-5 w-[120%] h-2/5 rounded-t-[35%] bg-gradient-to-t from-white/40 via-white/25 to-transparent blur-[1px]"
            animate={{
              x: ['0%', '-12%', '0%'],
              y: ['0%', '4%', '0%'],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          />

          {/* Subtle Grain/Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* ===== FOREGROUND CONTENT ===== */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          
          {/* Logo with Subtle Float */}
          <motion.div
            className="mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div
              className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: '140px',
                height: '140px',
                boxShadow: '0 20px 40px rgba(0, 0, 50, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjUB1_TkZ-4rXae4XmkoCpfPj14_Emd5JNNQ&s"
                alt="El-Shaddai Revival Centre Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Church Name */}
          <motion.div
            className="mb-6"
            initial="hidden"
            animate="visible"
          >
            <div className="inline-flex flex-wrap justify-center gap-x-3 gap-y-2">
              {words.map((word, idx) => (
                <motion.span
                  key={idx}
                  className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.7 }}
                  style={{
                    background: 'linear-gradient(to bottom, #ffffff, #dbeafe)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-blue-100/90 font-sans uppercase tracking-[0.3em] text-sm md:text-base mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            The Church of Pentecost
          </motion.p>

          {/* Loading Indicator */}
          <motion.div 
            className="w-64 flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-300/80 to-blue-400"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </div>
            <motion.span 
              className="text-sm text-cyan-100/80 tracking-widest"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ENTERING DIVINE PRESENCE
            </motion.span>
          </motion.div>

        </div>

        {/* Subtle Cross Decorations */}
        <CrossDecoration position="topLeft" delay={1.6} />
        <CrossDecoration position="topRight" delay={1.8} />
        <CrossDecoration position="bottomLeft" delay={2.0} />
        <CrossDecoration position="bottomRight" delay={2.2} />

      </motion.div>
    </AnimatePresence>
  )
}

// Helper component for cross decorations
function CrossDecoration({ position, delay }: { position: string, delay: number }) {
  const positions: any = {
    topLeft: 'top-6 left-6',
    topRight: 'top-6 right-6',
    bottomLeft: 'bottom-6 left-6',
    bottomRight: 'bottom-6 right-6'
  }

  return (
    <motion.div
      className={`absolute text-2xl text-white/30 ${positions[position]}`}
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, duration: 0.7, type: 'spring' }}
    >
      ✞
    </motion.div>
  )
}