'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Circle } from "lucide-react"

// Slide data matching church theme
const slides = [

    {
      id: 0,
      title: "Join Our Live Service",
      subtitle: "Experience God's presence with us every Sunday",
      ctaText: "Join Live Now",
      ctaLink: "/live",
      image: "/images/slider/image1.jpg",
      gradient: "from-red-600/80 to-primary/80"
    },

  {
    id: 1,
    title: "Powerful Testimonies",
    subtitle: "Real stories of God\'s healing and deliverance",
    ctaText: "Read Testimonies",
    ctaLink: "/testimonies",
    image: "/images/slider/image2.jpg",
    gradient: "from-primary/80 to-blue-600/80"
  },

    {
      id: 2,
      title: "Weekly Sermons",
      subtitle: "Grow in faith through anointed preaching",
      ctaText: "Latest Sermons",
      ctaLink: "/sermons",
      image: "/images/slider/image3.jpg",
      gradient: "from-emerald-600/80 to-primary/80"
    },

  {
    id: 3,
    title: "Upcoming Events",
    subtitle: "Don\'t miss our special gatherings",
    ctaText: "View Events",
    ctaLink: "/events",
    image: "/images/slider/image4.jpg",
    gradient: "from-purple-600/80 to-accent/80"
  },
  {
    id: 4,
    title: "Counselling Ministry",
    subtitle: "Faith-based professional counselling",
    ctaText: "Book Session",
    ctaLink: "/counselling",
    image: "/images/slider/image5.jpg",
    gradient: "from-orange-500/80 to-yellow-500/80"
  },
  {
    id: 5,
    title: "Counselling Ministry",
    subtitle: "Faith-based professional counselling",
    ctaText: "Book Session",
    ctaLink: "/counselling",
    image: "/images/slider/image6.jpg",
    gradient: "from-orange-500/80 to-yellow-500/80"
  },
  {
    id: 6,
    title: "Counselling Ministry",
    subtitle: "Faith-based professional counselling",
    ctaText: "Book Session",
    ctaLink: "/counselling",
    image: "/images/slider/image7.jpg",
    gradient: "from-orange-500/80 to-yellow-500/80"
  },
  {
    id: 7,
    title: "Counselling Ministry",
    subtitle: "Faith-based professional counselling",
    ctaText: "Book Session",
    ctaLink: "/counselling",
    image: "/images/slider/image8.jpg",
    gradient: "from-orange-500/80 to-yellow-500/80"
  },
  {
    id: 8,
    title: "Counselling Ministry",
    subtitle: "Faith-based professional counselling",
    ctaText: "Book Session",
    ctaLink: "/counselling",
    image: "/images/slider/image12.jpg",
    gradient: "from-orange-500/80 to-yellow-500/80"
  }
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlay) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlay])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlay(false)
    
    // Re-enable autoplay after 10 seconds
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlay(false)
  }

  const activeSlide = slides[currentSlide]

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 w-full h-full"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeSlide.image ? (
            <Image
              src={activeSlide.image}
              fill
              alt={activeSlide.title}
className="object-center object-cover"
              priority={currentSlide === 0}
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center text-white/80">
                <div className="w-32 h-32 bg-white/10 rounded-full mx-auto mb-4 animate-pulse" />
                <p className="text-xl">Coming Soon</p>
              </div>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${activeSlide.gradient}`} />
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide 
              ? 'w-8 bg-white scale-110 shadow-lg' 
              : 'bg-white/50 hover:bg-white/75'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${index + 1}`}
          >
            <Circle className="h-3 w-3 opacity-0 pointer-events-none" />
          </motion.button>
        ))}
      </div>

      {/* Content overlay */}
      <motion.div 
        className="absolute bottom-20 left-4 right-4 md:left-16 md:right-16 lg:left-32 lg:right-32 text-center z-20"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.h2 
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl"
          whileHover={{ scale: 1.02 }}
        >
          {activeSlide.title}
        </motion.h2>
        <motion.p 
          className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-xl opacity-90"
          whileHover={{ scale: 1.02 }}
        >
          {activeSlide.subtitle}
        </motion.p>
        <motion.a
          href={activeSlide.ctaLink}
          className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg md:text-xl hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeSlide.ctaText} →
        </motion.a>
      </motion.div>

      {/* Arrow navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 z-20 md:block hidden"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 z-20 md:block hidden"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}
