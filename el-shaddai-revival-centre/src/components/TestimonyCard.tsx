'use client'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { Quote, Calendar, User } from 'lucide-react'

interface Testimony {
  _id?: string
  id?: string
  name: string
  title: string
  content: string
  category: 'healing' | 'salvation' | 'breakthrough' | 'family' | 'financial' | 'other'
  date: string
  photo?: string
  location?: string
}

interface TestimonyCardProps {
  testimony: Testimony
  featured?: boolean
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export default function TestimonyCard({ testimony, featured = false }: TestimonyCardProps) {
  const categoryColors = {
    healing: 'bg-green-100 text-green-800',
    salvation: 'bg-blue-100 text-blue-800',
    breakthrough: 'bg-purple-100 text-purple-800',
    family: 'bg-yellow-100 text-yellow-800',
    financial: 'bg-emerald-100 text-emerald-800',
    other: 'bg-gray-100 text-gray-800',
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, scale: featured ? 1.02 : 1.01 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition duration-300 ${
        featured ? 'md:p-8' : ''
      }`}
    >
      {/* Quote Icon */}
      <div className="absolute top-4 right-4 opacity-10">
        <Quote className="h-16 w-16 text-accent" />
      </div>

      {/* Category Badge */}
      <div className="p-4 pb-0">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryColors[testimony.category]}`}>
          {testimony.category.charAt(0).toUpperCase() + testimony.category.slice(1)}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Photo and Name */}
        <div className="flex items-center mb-4">
          <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4 bg-gray-200">
            {testimony.photo ? (
              <Image
                src={testimony.photo}
                alt={testimony.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent bg-opacity-20">
                <User className="h-6 w-6 text-accent" />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{testimony.name}</h4>
            {testimony.location && (
              <p className="text-sm text-gray-500">{testimony.location}</p>
            )}
          </div>
        </div>

        {/* Title */}
        {featured && (
          <h3 className="text-xl font-bold mb-4 text-primary">{testimony.title}</h3>
        )}

        {/* Testimony Content */}
        <p className={`text-gray-600 leading-relaxed ${featured ? 'text-lg' : 'text-sm line-clamp-4'}`}>
          {featured ? testimony.content : testimony.content}
        </p>
      </div>

      {/* Footer */}
      <div className={`px-6 pb-6 ${featured ? 'pt-4' : 'pt-0'}`}>
        <div className="flex items-center text-sm text-gray-500 border-t pt-4">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(testimony.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Decorative Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-accent to-red-400" />
    </motion.div>
  )
}

