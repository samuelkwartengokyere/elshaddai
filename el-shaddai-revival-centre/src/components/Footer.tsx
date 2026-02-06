import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Church Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">El-Shaddai Revival Centre</h3>
            <p className="mb-4 text-gray-300">
              A community of faith, hope, and love. Welcome home.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
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
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="text-lg font-bold mb-4">Service Times</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Sunday: 9:00 AM & 11:00 AM</li>
              <li>Wednesday: 7:00 PM Bible Study</li>
              <li>Friday: 7:00 PM Youth Service</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5" />
                <span>123 Church Street, City, State 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>info@gracechurch.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} El-Shaddai Revival Centre. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

