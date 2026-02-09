'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Variants, useMotionValue, useTransform, animate } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
  duration?: number
}

// ==================== ENHANCED ANIMATION VARIANTS ====================

// Heavenly light beam variants
const lightBeamVariants: Variants = {
  initial: { rotate: 0, opacity: 0 },
  animate: (i: number) => ({
    rotate: [0, 360],
    opacity: [0, 0.4, 0],
    transition: {
      duration: 8 + i * 1.5,
      repeat: Infinity,
      ease: "linear",
      delay: i * 0.3,
    },
  }),
}

// Divine glow particles
const divineParticleVariants: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: (i: number) => ({
    opacity: [0, 0.8, 0],
    scale: [0, 1.2, 0],
    x: [0, Math.sin(i * 0.5) * 100, Math.cos(i * 0.5) * 80],
    y: [0, Math.cos(i * 0.5) * -150, Math.sin(i * 0.5) * -120],
    transition: {
      duration: 4 + Math.random() * 3,
      repeat: Infinity,
      delay: i * 0.1,
      ease: "easeOut",
    },
  }),
}

// Golden shimmer variants
const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['0% 0%', '200% 200%'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// Heavenly text reveal with divine light
const divineTextReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: 'blur(12px) brightness(0.5)',
    textShadow: '0 0 0 rgba(255, 215, 0, 0)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px) brightness(1)',
    textShadow: [
      '0 0 0 rgba(255, 215, 0, 0)',
      '0 0 20px rgba(255, 215, 0, 0.8)',
      '0 0 40px rgba(255, 215, 0, 0.6)',
      '0 0 20px rgba(255, 255, 255, 0.8)',
    ],
    transition: {
      duration: 1.2,
      delay: i * 0.15,
      ease: [0.34, 1.56, 0.64, 1],
    },
  }),
}

// Animated halo around logo
const haloVariants: Variants = {
  animate: {
    rotate: 360,
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// Floating feather/dove animation
const featherVariants: Variants = {
  animate: (i: number) => ({
    y: [0, -30, -60, -30, 0],
    x: [0, 15, -10, 5, 0],
    rotate: [0, 5, -5, 2, 0],
    opacity: [0, 0.8, 0.6, 0.8, 0],
    transition: {
      duration: 6 + i * 1,
      repeat: Infinity,
      delay: i * 0.5,
      ease: "easeInOut",
    },
  }),
}

// Enhanced ripple effect with golden touch
const enhancedRippleVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: (i: number) => ({
    scale: [0, 1.5, 2],
    opacity: [0.6, 0.3, 0],
    borderColor: [
      'rgba(255, 215, 0, 0.8)',
      'rgba(255, 255, 255, 0.4)',
      'rgba(65, 105, 225, 0.2)',
    ],
    transition: {
      duration: 3,
      delay: i * 0.4,
      repeat: Infinity,
      ease: "easeOut",
    },
  }),
}

// Graceful cross entrance
const gracefulCrossVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0,
    rotate: -180,
    filter: 'blur(20px) brightness(0)' 
  },
  visible: (i: number) => ({
    opacity: 0.8,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px) brightness(1)',
    transition: {
      duration: 1.5,
      delay: 0.8 + i * 0.2,
      ease: [0.68, -0.55, 0.27, 1.55],
    },
  }),
}

// Progress bar with divine shimmer
const divineProgressVariants: Variants = {
  initial: { width: '0%' },
  animate: {
    width: '100%',
    backgroundPosition: ['0% 0%', '100% 100%'],
    transition: {
      width: { duration: 2.8, ease: "easeInOut" },
      backgroundPosition: { duration: 1.5, repeat: Infinity, ease: "linear" },
    },
  },
}

const churchName = 'El-Shaddai Revival Centre'
const words = churchName.split(' ')

export default function DivineSplashScreen({ onComplete, duration = 5500 }: SplashScreenProps) {
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
        key="divine-splash"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0, backdropFilter: 'blur(20px)' }}
        animate={{ 
          opacity: 1,
          backdropFilter: 'blur(0px)',
          transition: { duration: 1.2, ease: "easeOut" }
        }}
        exit={{ 
          opacity: 0,
          backdropFilter: 'blur(20px)',
          transition: { duration: 0.8, ease: "easeIn" }
        }}
      >
        {/* Heavenly Gradient Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #0c1b35 0%, #1a3a6e 25%, #2d4f8e 50%, #4169E1 75%, #87CEEB 100%)',
            }}
            animate={{
              background: [
                'linear-gradient(135deg, #0c1b35 0%, #1a3a6e 25%, #2d4f8e 50%, #4169E1 75%, #87CEEB 100%)',
                'linear-gradient(135deg, #1a3a6e 0%, #2d4f8e 25%, #4169E1 50%, #87CEEB 75%, #a8d8ff 100%)',
                'linear-gradient(135deg, #0c1b35 0%, #1a3a6e 25%, #2d4f8e 50%, #4169E1 75%, #87CEEB 100%)',
              ],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Animated Light Beams */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`beam-${i}`}
              className="absolute"
              style={{
                width: '150vw',
                height: '150vw',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: `conic-gradient(
                  transparent ${i * 15}%,
                  rgba(255, 215, 0, 0.1) ${i * 15 + 10}%,
                  rgba(255, 255, 255, 0.2) ${i * 15 + 15}%,
                  transparent ${i * 15 + 20}%
                )`,
                borderRadius: '50%',
                zIndex: 1,
              }}
              variants={lightBeamVariants}
              initial="initial"
              animate="animate"
              custom={i}
            />
          ))}

          {/* Divine Particles */}
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={`divine-particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: 3 + Math.random() * 5,
                height: 3 + Math.random() * 5,
                background: Math.random() > 0.5 
                  ? 'radial-gradient(circle, #ffd700, #ffed4e, transparent)'
                  : 'radial-gradient(circle, #87CEEB, #ffffff, transparent)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                zIndex: 2,
                boxShadow: '0 0 8px currentColor',
              }}
              variants={divineParticleVariants}
              initial="initial"
              animate="animate"
              custom={i}
            />
          ))}

          {/* Shimmer Overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              zIndex: 3,
            }}
            variants={shimmerVariants}
            animate="animate"
          />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Animated Halo */}
          <motion.div
            className="absolute"
            style={{
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              zIndex: 5,
            }}
            variants={haloVariants}
            animate="animate"
          />

          {/* Enhanced Ripples */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`enhanced-ripple-${i}`}
              className="absolute rounded-full border"
              style={{
                width: 200 + i * 80,
                height: 200 + i * 80,
                zIndex: 4,
                borderWidth: '1px',
              }}
              variants={enhancedRippleVariants}
              initial="initial"
              animate="animate"
              custom={i}
            />
          ))}

          {/* Logo with Divine Glow */}
          <motion.div
            className="relative z-20 mb-8"
            initial={{ scale: 0, rotate: -180, filter: 'blur(20px)' }}
            animate={{ 
              scale: 1, 
              rotate: 0, 
              filter: 'blur(0px) drop-shadow(0 0 40px rgba(255, 215, 0, 0.7))' 
            }}
            transition={{ 
              duration: 1.5,
              ease: [0.68, -0.55, 0.27, 1.55],
              delay: 0.1,
            }}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <div className="relative">
              {/* Logo Glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Logo */}
              <motion.div
                className="relative rounded-full overflow-hidden border-4"
                style={{
                  width: 140,
                  height: 140,
                  borderColor: 'rgba(255, 215, 0, 0.5)',
                  background: 'linear-gradient(45deg, #1a3a6e, #4169E1, #87CEEB)',
                  boxShadow: '0 0 60px rgba(255, 215, 0, 0.5), inset 0 0 40px rgba(255, 255, 255, 0.3)',
                }}
                animate={{ 
                  rotateY: [0, 360],
                  transition: { duration: 20, repeat: Infinity, ease: "linear" }
                }}
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjUB1_TkZ-4rXae4XmkoCpfPj14_Emd5JNNQ&s"
                  alt="El-Shaddai Revival Centre Logo"
                  className="w-full h-full object-cover p-2"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Church Name with Divine Reveal */}
          <div className="text-center mb-6 relative z-20">
            <motion.div
              className="inline-flex flex-wrap justify-center gap-x-3 gap-y-2"
              initial="hidden"
              animate="visible"
            >
              {words.map((word, wordIndex) => (
                <motion.span
                  key={wordIndex}
                  custom={wordIndex}
                  variants={divineTextReveal}
                  className="relative inline-block font-serif font-bold"
                  style={{
                    fontSize: 'clamp(2.2rem, 5.5vw, 3.5rem)',
                    background: 'linear-gradient(45deg, #1a3a6e, #4169E1, #ffd700)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.02em',
                  }}
                >
                  {word}
                  {/* Underline glow */}
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #ffd700, transparent)',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: wordIndex * 0.15 + 0.5, duration: 0.8 }}
                  />
                </motion.span>
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="font-sans uppercase tracking-[0.3em] mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              style={{
                fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '0 2px 20px rgba(255, 215, 0, 0.6)',
                fontWeight: 300,
                letterSpacing: '0.3em',
              }}
            >
              The Church of Pentecost
            </motion.p>
          </div>

          {/* Loading Indicator */}
          <motion.div
            className="flex flex-col items-center gap-6 mt-12 relative z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {/* Divine Progress Bar */}
            <div className="w-72 h-1.5 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #1a3a6e, #4169E1, #87CEEB, #ffd700)',
                  backgroundSize: '200% 100%',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                  width: `${progress}%`,
                }}
                variants={divineProgressVariants}
                initial="initial"
                animate="animate"
              />
            </div>

            {/* Loading Text */}
            <motion.div
              className="text-sm uppercase tracking-[0.4em] font-light"
              animate={{ 
                opacity: [0.4, 1, 0.4],
                textShadow: [
                  '0 0 0 rgba(255, 215, 0, 0)',
                  '0 0 15px rgba(255, 215, 0, 0.8)',
                  '0 0 0 rgba(255, 215, 0, 0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ color: '#ffd700' }}
            >
              ENTERING DIVINE PRESENCE
            </motion.div>

            {/* Loading Dots */}
            <div className="flex items-center gap-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #ffd700, #ffed4e)',
                    boxShadow: '0 0 10px #ffd700',
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Floating Feathers/Doves */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`feather-${i}`}
              className="absolute text-3xl"
              style={{
                zIndex: 15,
                left: `${15 + i * 30}%`,
                top: '20%',
                color: 'rgba(255, 255, 255, 0.6)',
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))',
              }}
              variants={featherVariants}
              initial="initial"
              animate="animate"
              custom={i}
            >
              ✝️
            </motion.div>
          ))}
        </div>

        {/* Graceful Cross Decorations */}
        <motion.div
          className="absolute top-10 left-10 text-4xl"
          variants={gracefulCrossVariants}
          initial="hidden"
          animate="visible"
          custom={0}
          style={{ color: 'rgba(255, 215, 0, 0.8)', filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))' }}
        >
          ✞
        </motion.div>

        <motion.div
          className="absolute top-10 right-10 text-5xl"
          variants={gracefulCrossVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          style={{ color: 'rgba(135, 206, 235, 0.9)', filter: 'drop-shadow(0 0 20px rgba(135, 206, 235, 0.7))' }}
        >
          ✟
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-10 text-6xl"
          variants={gracefulCrossVariants}
          initial="hidden"
          animate="visible"
          custom={2}
          style={{ color: 'rgba(255, 255, 255, 0.9)', filter: 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.8))' }}
        >
          ✝
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-10 text-3xl"
          variants={gracefulCrossVariants}
          initial="hidden"
          animate="visible"
          custom={3}
          style={{ color: 'rgba(65, 105, 225, 0.8)', filter: 'drop-shadow(0 0 12px rgba(65, 105, 225, 0.6))' }}
        >
          †
        </motion.div>

        {/* Bottom Copyright */}
        <motion.div
          className="absolute bottom-6 text-xs text-white/40 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={{ zIndex: 20 }}
        >
          © {new Date().getFullYear()} El-Shaddai Revival Centre. All Rights Reserved.
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}