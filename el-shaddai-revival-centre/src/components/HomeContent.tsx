'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Calendar, Users, Heart, HeartHandshake, Quote } from 'lucide-react'
import SermonCard from '@/components/SermonCard'
import TestimonyCard from '@/components/TestimonyCard'

interface Sermon {
  _id?: string
  id?: string
  title: string
  speaker: string
  date: string
  description?: string
  thumbnail?: string
  audioUrl?: string
  videoUrl?: string
  duration?: string
  series?: string
  biblePassage?: string
  tags?: string[]
}

interface Event {
  title: string
  date: string
  time: string
}

interface Testimony {
  _id?: string
  id?: string
  name: string
  title: string
  content: string
  category: 'healing' | 'breakthrough' | 'salvation' | 'deliverance' | 'provision' | 'other'
  date: string
  location: string
  image?: string
  isFeatured?: boolean
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
      ease: [0.25, 0.1, 0.25, 1.0] as any,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0] as any,
    },
  },
}

interface HomeContentProps {
  sermons: Sermon[]
  events: Event[]
  testimonies: Testimony[]
}

export default function HomeContent({ sermons, events, testimonies }: HomeContentProps) {
  return (
    <>
      {/* Recent Sermons */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-10"
          >
            <div>
              <h2 className="text-4xl font-bold mb-2">Recent Sermons</h2>
              <p className="text-gray-600">Messages to inspire and guide you</p>
            </div>
            <Link 
              href="/sermons" 
              className="text-accent hover:text-red-600 font-medium flex items-center"
            >
              View All Sermons →
            </Link>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {sermons.map((sermon, index) => (
              <motion.div key={sermon._id || sermon.id || index} variants={cardVariants}>
                <SermonCard sermon={sermon} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonies Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-10"
          >
            <div>
              <h2 className="text-4xl font-bold mb-2">Testimonies</h2>
              <p className="text-gray-300">Real stories of God's power at our Prayer Camp</p>
            </div>
            <Link 
              href="/testimonies" 
              className="hidden md:inline-flex items-center bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
            >
              View All Testimonies
              <Quote className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonies.map((testimony, index) => (
              <motion.div key={testimony._id || testimony.id || index} variants={cardVariants}>
                <TestimonyCard testimony={testimony} />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 text-center md:hidden">
            <Link 
              href="/testimonies" 
              className="inline-flex items-center bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
            >
              View All Testimonies
              <Quote className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Upcoming Events */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-10"
          >
            <div>
              <h2 className="text-4xl font-bold">Upcoming Events</h2>
              <p className="text-gray-600 mt-2">Join us at our upcoming events</p>
            </div>
            <Link 
              href="/events" 
              className="text-accent hover:text-red-600 font-medium flex items-center"
            >
              View All Events →
            </Link>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {events.map((event, index) => (
              <motion.div 
                key={index} 
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
                className="card text-center hover:shadow-xl transition duration-300 bg-white rounded-lg shadow-md p-6 cursor-pointer"
              >
                <Calendar className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <div className="text-gray-600">
                  <p className="font-medium">{event.date}</p>
                  <p>{event.time}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Counselling Services Section */}
      <section className="py-16 bg-gradient-to-r from-[#003399] to-[#002266] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <HeartHandshake className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Counselling Services</h2>
            <p className="text-xl text-gray-200 mb-8">
              Professional counselling rooted in faith. Book online sessions via Teams
              or visit our centre for in-person support.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg"
              >
                <span className="text-yellow-400">★</span> Experienced Counsellors
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg"
              >
                <span className="text-yellow-400">★</span> Online & In-Person
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg"
              >
                <span className="text-yellow-400">★</span> Faith-Based Approach
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/counselling"
                className="inline-block bg-[#C8102E] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#A00D25] transition duration-300"
              >
                Book a Session
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Quick Links */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={cardVariants} className="text-center p-8">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Join a Group</h3>
              <p className="mb-6">Connect with others in community groups</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/groups"
                  className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition duration-300"
                >
                  Find a Group
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div variants={cardVariants} className="text-center p-8">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Plan Your Visit</h3>
              <p className="mb-6">We&apos;d love to welcome you this Sunday</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/plan-your-visit"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition duration-300 inline-block"
                >
                  Visit Info
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div variants={cardVariants} className="text-center p-8">
              <Heart className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Give Online</h3>
              <p className="mb-6">Support our ministry and missions</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/give" 
                  className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition duration-300"
                >
                  Give Now
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

