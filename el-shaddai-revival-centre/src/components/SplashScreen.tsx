'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
  duration?: number
}

// ==================== MODERN ABSTRACT WAVE ANIMATION VARIANTS ====================

// Flowing wave layers
const waveLayerVariants: Variants = {
  animate: (i: number) => ({
    x: [0, -100, -200, -100, 0],
    y: [0, Math.sin(i) * 20, Math.cos(i) * 15, Math.sin(i) * 10, 0],
    scale: [1, 1.05, 1.1, 1.05, 1],
    transition: {
      duration: 20 + i * 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 2,
    },
  }),
}

// Floating bubble particles
const bubbleVariants: Variants = {
  animate: (i: number) => ({
    y: [0, -80, -160, -80, 0],
    x: [0, Math.sin(i) * 40, Math.cos(i) * 30, Math.sin(i) * 20, 0],
    scale: [0.8, 1.2, 0.9, 1.1, 0.8],
    opacity: [0.2, 0.6, 0.8, 0.4, 0.2],
    transition: {
      duration: 15 + Math.random() * 10,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.5,
    },
  }),
}

// Subtle shimmer effect
const waveShimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%'],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// Modern text reveal
const modernTextReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: 'blur(10px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      delay: i * 0.1,
      ease: [0.34, 1.56, 0.64, 1],
    },
  }),
}

// Logo floating animation
const logoFloatVariants: Variants = {
  animate: {
    y: [0, -15, 0],
    rotateY: [0, 180, 360],
    scale: [1, 1.05, 1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Wave ripple effect
const waveRippleVariants: Variants = {
  animate: (i: number) => ({
    scale: [1, 1.5, 2],
    opacity: [0.6, 0.3, 0],
    transition: {
      duration: 3,
      delay: i * 0.3,
      repeat: Infinity,
      ease: "easeOut",
    },
  }),
}

// Modern loading bar
const modernProgressVariants: Variants = {
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

export default function ModernWaveSplashScreen({ onComplete, duration = 5000 }: SplashScreenProps) {
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
        key="modern-wave-splash"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #0a192f 0%, #1a365d 30%, #2d4a8e 60%, #3b82f6 90%)',
        }}
      >
        {/* Abstract Wave Background Layers */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Deep Ocean Layer */}
          <motion.div
            className="absolute"
            style={{
              width: '200%',
              height: '200%',
              top: '-50%',
              left: '-50%',
              background: 'radial-gradient(circle at 30% 50%, rgba(26, 54, 93, 0.8) 0%, transparent 50%)',
              borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%',
              filter: 'blur(40px)',
            }}
            variants={waveLayerVariants}
            animate="animate"
            custom={0}
          />
          
          {/* Main Wave Layer */}
          <motion.div
            className="absolute"
            style={{
              width: '180%',
              height: '180%',
              top: '-40%',
              left: '-40%',
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.4) 0%, rgba(96, 165, 250, 0.3) 50%, rgba(147, 197, 253, 0.2) 100%)',
              borderRadius: '45% 55% 60% 40% / 60% 45% 55% 40%',
              filter: 'blur(30px)',
            }}
            variants={waveLayerVariants}
            animate="animate"
            custom={1}
          />
          
          {/* Light Wave Layer */}
          <motion.div
            className="absolute"
            style={{
              width: '160%',
              height: '160%',
              top: '-30%',
              left: '-30%',
              background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.3) 0%, rgba(191, 219, 254, 0.2) 50%, rgba(219, 234, 254, 0.1) 100%)',
              borderRadius: '55% 45% 50% 50% / 40% 60% 40% 60%',
              filter: 'blur(20px)',
            }}
            variants={waveLayerVariants}
            animate="animate"
            custom={2}
          />
          
          {/* Surface Wave Layer */}
          <motion.div
            className="absolute"
            style={{
              width: '140%',
              height: '140%',
              top: '-20%',
              left: '-20%',
              background: 'linear-gradient(90deg, rgba(219, 234, 254, 0.2) 0%, rgba(239, 246, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 100%)',
              borderRadius: '60% 40% 45% 55% / 50% 50% 50% 50%',
              filter: 'blur(15px)',
            }}
            variants={waveLayerVariants}
            animate="animate"
            custom={3}
          />
          
          {/* Shimmer Overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
            }}
            variants={waveShimmerVariants}
            animate="animate"
          />
          
          {/* Floating Bubbles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full"
              style={{
                width: 4 + Math.random() * 12,
                height: 4 + Math.random() * 12,
                background: `radial-gradient(circle, rgba(255, 255, 255, ${0.3 + Math.random() * 0.3}) 0%, rgba(147, 197, 253, ${0.1 + Math.random() * 0.2}) 100%)`,
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 50}%`,
                zIndex: 2,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
              }}
              variants={bubbleVariants}
              initial="initial"
              animate="animate"
              custom={i}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Logo with Wave Ripples */}
          <div className="relative mb-8">
            {/* Wave Ripples */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ripple-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  width: 160 + i * 60,
                  height: 160 + i * 60,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderColor: `rgba(59, 130, 246, ${0.4 - i * 0.1})`,
                  zIndex: 1,
                }}
                variants={waveRippleVariants}
                initial="initial"
                animate="animate"
                custom={i}
              />
            ))}
            
            {/* Logo Container */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {/* Logo Glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Logo */}
              <motion.div
                className="relative rounded-full overflow-hidden border-4 backdrop-blur-sm"
                style={{
                  width: 140,
                  height: 140,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(255, 255, 255, 0.1))',
                  boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.2)',
                }}
                variants={logoFloatVariants}
                animate="animate"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjUB1_TkZ-4rXae4XmkoCpfPj14_Emd5JNNQ&s"
                  alt="El-Shaddai Revival Centre Logo"
                  className="w-full h-full object-cover p-3"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Church Name */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex flex-wrap justify-center gap-x-4 gap-y-2"
              initial="hidden"
              animate="visible"
            >
              {words.map((word, wordIndex) => (
                <motion.span
                  key={wordIndex}
                  custom={wordIndex}
                  variants={modernTextReveal}
                  className="relative inline-block font-serif font-bold"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.05em',
                    textShadow: '0 2px 20px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  {word}
                  {/* Wave Underline */}
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: wordIndex * 0.1 + 0.5, duration: 0.8 }}
                  />
                </motion.span>
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="font-sans uppercase tracking-[0.4em] mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
                color: 'rgba(219, 234, 254, 0.9)',
                fontWeight: 300,
                letterSpacing: '0.4em',
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
            {/* Modern Progress Bar */}
            <div className="w-80 h-1.5 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #93c5fd, transparent)',
                  backgroundSize: '200% 100%',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                  width: `${progress}%`,
                }}
                variants={modernProgressVariants}
                initial="initial"
                animate="animate"
              />
            </div>

            {/* Loading Text with Wave Animation */}
            <motion.div
              className="text-sm uppercase tracking-[0.4em] font-light"
              animate={{
                opacity: [0.4, 1, 0.4],
                y: [0, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                color: '#bfdbfe',
                textShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
              }}
            >
              ENTERING DIVINE PRESENCE
            </motion.div>

            {/* Animated Dots */}
            <div className="flex items-center gap-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #93c5fd, #3b82f6)',
                    boxShadow: '0 0 15px #3b82f6',
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Subtle Cross Decorations */}
          <motion.div
            className="absolute top-8 left-8 text-2xl opacity-30"
            initial={{ rotate: -45, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            style={{ color: '#93c5fd' }}
          >
            †
          </motion.div>
          <motion.div
            className="absolute top-8 right-8 text-2xl opacity-30"
            initial={{ rotate: 45, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 1.7, duration: 0.8 }}
            style={{ color: '#93c5fd' }}
          >
            ✞
          </motion.div>
          <motion.div
            className="absolute bottom-8 left-8 text-2xl opacity-30"
            initial={{ rotate: -45, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 1.9, duration: 0.8 }}
            style={{ color: '#93c5fd' }}
          >
            ✟
          </motion.div>
          <motion.div
            className="absolute bottom-8 right-8 text-2xl opacity-30"
            initial={{ rotate: 45, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 2.1, duration: 0.8 }}
            style={{ color: '#93c5fd' }}
          >
            ✝
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          className="absolute bottom-4 text-xs text-white/30 tracking-widest"
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