
'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react'

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Church Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold mb-4">El-Shaddai Revival Centre</h3>
            <p className="mb-4 text-gray-300">
              A community of faith, hope, and love. Welcome home.
            </p>
            <div className="flex space-x-4">
              {process.env.NEXT_PUBLIC_FACEBOOK_URL && (
                <a 
                  href={process.env.NEXT_PUBLIC_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
                <a 
                  href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {process.env.NEXT_PUBLIC_TWITTER_URL && (
                <a 
                  href={process.env.NEXT_PUBLIC_TWITTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {process.env.NEXT_PUBLIC_YOUTUBE_URL && (
                <a 
                  href={process.env.NEXT_PUBLIC_YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition duration-300"
                >
                  <Youtube className="h-6 w-6" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/sermons" className="text-gray-300 hover:text-white transition duration-300">
                  Sermons
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-white transition duration-300">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/give" className="text-gray-300 hover:text-white transition duration-300">
                  Give
                </Link>
              </li>
              <li>
                <Link href="/live" className="text-gray-300 hover:text-white transition duration-300">
                  Live Stream
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/plan-your-visit" className="text-gray-300 hover:text-white transition duration-300">
                  Plan Your Visit
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Service Times */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-4">Service Times</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Sunday: 9:00 AM & 11:00 AM</li>
              <li>Wednesday: 7:00 PM Bible Study</li>
              <li>Friday: 7:00 PM Youth Service</li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5" />
                <span>Nabewam, Ghana</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span>+233 50 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>info@elshaddai.com</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <p>&copy; {new Date().getFullYear()} The Church Of Pentecost. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}
