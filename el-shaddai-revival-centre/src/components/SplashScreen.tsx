'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
  duration?: number
}

// ==================== ANIMATION VARIANTS ====================

// Background logo animation
const bgLogoVariants: Variants = {
  animate: {
    rotate: 360,
    scale: [1, 1.05, 1],
    opacity: [0.08, 0.12, 0.08],
    transition: {
      duration: 40,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// Secondary background logo animation
const secondaryBgLogoVariants: Variants = {
  animate: (i: number) => ({
    rotate: -360,
    scale: [0.7, 0.8, 0.7],
    opacity: [0.03, 0.06, 0.03],
    x: [0, Math.sin(i) * 50, 0],
    y: [0, Math.cos(i) * 30, 0],
    transition: {
      duration: 50 + i * 10,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 2,
    },
  }),
}

// Wave animation for main content
const waveVariants: Variants = {
  animate: (i: number) => ({
    x: [0, -100, -200, -100, 0],
    y: [0, Math.sin(i) * 15, Math.cos(i) * 10, 0],
    scale: [1, 1.02, 1.05, 1.02, 1],
    transition: {
      duration: 25 + i * 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }),
}

// Particle animation
const particleVariants: Variants = {
  animate: (i: number) => ({
    y: [0, -100, -200],
    x: [0, Math.sin(i) * 30, Math.cos(i) * 20],
    opacity: [0, 0.5, 0],
    scale: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 8 + Math.random() * 5,
      repeat: Infinity,
      delay: i * 0.3,
      ease: "linear",
    },
  }),
}

// Text reveal animation
const textRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(10px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      delay: i * 0.15,
      ease: [0.34, 1.56, 0.64, 1],
    },
  }),
}

// Main logo float animation
const mainLogoFloatVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    scale: [1, 1.03, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Progress bar animation
const progressVariants: Variants = {
  initial: { width: '0%' },
  animate: {
    width: '100%',
    transition: {
      duration: 2.5,
      ease: "easeInOut",
    },
  },
}

const churchName = 'El-Shaddai Revival Centre'
const words = churchName.split(' ')

export default function SplashScreenWithBgLogo({ onComplete, duration = 5000 }: SplashScreenProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setIsMounted(true)
    
    // Smooth progress animation
    const startTime = Date.now()
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)
    }, 50)

    const timer = setTimeout(() => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
      onComplete()
    }, duration)

    return () => {
      clearTimeout(timer)
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [duration, onComplete])

  if (!isMounted) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="splash-with-bg-logo"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Main Background with Gradient */}
        <div className="absolute inset-0">
          {/* Primary Gradient Background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #0a1a3a 0%, #1a3a6e 25%, #4169E1 50%, #87CEEB 75%, #a8d8ff 100%)',
            }}
            animate={{
              background: [
                'linear-gradient(135deg, #0a1a3a 0%, #1a3a6e 25%, #4169E1 50%, #87CEEB 75%, #a8d8ff 100%)',
                'linear-gradient(135deg, #1a3a6e 0%, #4169E1 25%, #87CEEB 50%, #a8d8ff 75%, #e0f2ff 100%)',
                'linear-gradient(135deg, #0a1a3a 0%, #1a3a6e 25%, #4169E1 50%, #87CEEB 75%, #a8d8ff 100%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* BACKGROUND LOGOS (Subtle, behind everything) */}
          
          {/* Large Central Background Logo */}
          <motion.div
            className="absolute"
            style={{
              width: '80vw',
              height: '80vw',
              maxWidth: '800px',
              maxHeight: '800px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              opacity: 0.1,
              filter: 'blur(8px)',
            }}
            variants={bgLogoVariants}
            initial="initial"
            animate="animate"
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjUB1_TkZ-4rXae4XmkoCpfPj14_Emd5JNNQ&s"
              alt="Background Logo"
              className="w-full h-full object-contain"
              style={{
                filter: 'brightness(0) invert(1) opacity(0.6)',
              }}
            />
          </motion.div>
          
          {/* Secondary Background Logos */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`secondary-bg-logo-${i}`}
              className="absolute"
              style={{
                width: `${30 + i * 10}vw`,
                height: `${30 + i * 10}vw`,
                left: `${i % 2 === 0 ? '20%' : '60%'}`,
                top: `${i < 2 ? '25%' : '65%'}`,
                zIndex: 1,
                opacity: 0.05,
                filter: 'blur(6px)',
              }}
              variants={secondaryBgLogoVariants}
              initial="initial"
              animate="animate"
              custom={i}
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjUB1_TkZ-4rXae4XmkoCpfPj14_Emd5JNNQ&s"
                alt="Background Logo"
                className="w-full h-full object-contain"
                style={{
                  filter: 'brightness(0) invert(1) opacity(0.4)',
                }}
              />
            </motion.div>
          ))}
          
          {/* Wave Overlays on top of logos */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(45deg, rgba(10, 26, 58, 0.3) 0%, transparent 50%, rgba(135, 206, 235, 0.2) 100%)',
              borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%',
              filter: 'blur(20px)',
              zIndex: 2,
            }}
            variants={waveVariants}
            animate="animate"
            custom={0}
          />
          
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(65, 105, 225, 0.2) 50%, rgba(168, 216, 255, 0.1) 100%)',
              borderRadius: '60% 40% 50% 50% / 40% 60% 40% 60%',
              filter: 'blur(15px)',
              zIndex: 2,
            }}
            variants={waveVariants}
            animate="animate"
            custom={1}
          />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 4,
                height: 2 + Math.random() * 4,
                background: `radial-gradient(circle, rgba(255, 255, 255, ${0.3 + Math.random() * 0.3}) 0%, rgba(135, 206, 235, ${0.1 + Math.random() * 0.2}) 100%)`,
                left: `${Math.random() * 100}%`,
                top: '100%',
                zIndex: 3,
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.3)',
              }}
              variants={particleVariants}
              initial="initial"
              animate="animate"
              custom={i}
            />
          ))}
          
          {/* Light Shimmer Effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
              zIndex: 3,
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%'],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Foreground Logo */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(135, 206, 235, 0.2) 50%, transparent 70%)',
                filter: 'blur(20px)',
                width: '160px',
                height: '160px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            {/* Main Logo */}
            <motion.div
              className="relative rounded-full overflow-hidden border-4 backdrop-blur-sm"
              style={{
                width: 120,
                height: 120,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(135, 206, 235, 0.2))',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)',
              }}
              variants={mainLogoFloatVariants}
              animate="animate"
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjUB1_TkZ-4rXae4XmkoCpfPj14_Emd5JNNQ&s"
                alt="El-Shaddai Revival Centre Logo"
                className="w-full h-full object-cover p-3"
              />
            </motion.div>
          </motion.div>

          {/* Church Name */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex flex-wrap justify-center gap-x-3 gap-y-2"
              initial="hidden"
              animate="visible"
            >
              {words.map((word, wordIndex) => (
                <motion.span
                  key={wordIndex}
                  custom={wordIndex}
                  variants={textRevealVariants}
                  className="relative inline-block font-serif font-bold"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #a8d8ff 50%, #4169E1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.05em',
                    textShadow: '0 2px 20px rgba(65, 105, 225, 0.3)',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="font-sans uppercase tracking-[0.3em] mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 300,
                letterSpacing: '0.3em',
                textShadow: '0 1px 10px rgba(135, 206, 235, 0.5)',
              }}
            >
              The Church of Pentecost
            </motion.p>
          </div>

          {/* Loading Indicator */}
          <motion.div
            className="flex flex-col items-center gap-8 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {/* Progress Bar */}
            <div className="w-80 h-1.5 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #4169E1, #87CEEB, #a8d8ff, #ffffff)',
                  boxShadow: '0 0 15px rgba(135, 206, 235, 0.5)',
                  width: `${progress}%`,
                }}
                variants={progressVariants}
                initial="initial"
                animate="animate"
              />
            </div>

            {/* Loading Text */}
            <motion.div
              className="text-sm uppercase tracking-[0.4em] font-light"
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                color: '#a8d8ff',
                textShadow: '0 0 8px rgba(135, 206, 235, 0.5)',
              }}
            >
              ENTERING DIVINE PRESENCE
            </motion.div>

            {/* Loading Dots */}
            <div className="flex items-center gap-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #ffffff, #87CEEB)',
                    boxShadow: '0 0 10px #87CEEB',
                  }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.15,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Cross Decorations */}
          <motion.div
            className="absolute top-6 left-6 text-2xl"
            initial={{ rotate: -45, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 0.5 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            style={{ color: '#ffffff' }}
          >
            ✞
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 text-2xl"
            initial={{ rotate: 45, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 0.5 }}
            transition={{ delay: 1.7, duration: 0.8 }}
            style={{ color: '#87CEEB' }}
          >
            †
          </motion.div>
          <motion.div
            className="absolute bottom-6 left-6 text-3xl"
            initial={{ rotate: -45, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 0.5 }}
            transition={{ delay: 1.9, duration: 0.8 }}
            style={{ color: '#a8d8ff' }}
          >
            ✝
          </motion.div>
          <motion.div
            className="absolute bottom-6 right-6 text-2xl"
            initial={{ rotate: 45, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 0.5 }}
            transition={{ delay: 2.1, duration: 0.8 }}
            style={{ color: '#ffffff' }}
          >
            ✟
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          className="absolute bottom-4 text-xs text-white/40 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          © {new Date().getFullYear()} El-Shaddai Revival Centre
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}