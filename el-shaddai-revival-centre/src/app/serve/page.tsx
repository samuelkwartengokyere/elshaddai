'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Heart, 
  Music, 
  Mic, 
  Monitor,
  Car,
  Shield,
  Utensils,
  Phone,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Mail
} from 'lucide-react'

interface Ministry {
  id: string
  name: string
  description: string
  icon: string
  color: string
  needsVolunteers: boolean
  timeCommitment: string
  requirements?: string
}

const ministries: Ministry[] = [
  {
    id: 'worship',
    name: 'Worship & Music',
    description: 'Lead our congregation in worship through music, vocals, and instruments. Create an atmosphere where people can encounter God.',
    icon: '🎵',
    color: 'bg-purple-100 text-purple-800',
    needsVolunteers: true,
    timeCommitment: 'Weekly (Sundays & rehearsals)',
    requirements: 'Ability to play instrument or sing, commitment to rehearsal schedule'
  },
  {
    id: 'media',
    name: 'Media & Technology',
    description: 'Manage audio, video, lighting, and livestream for our services. Help bring our services to those worshipping online.',
    icon: '🎥',
    color: 'bg-blue-100 text-blue-800',
    needsVolunteers: true,
    timeCommitment: 'Weekly (Services)',
    requirements: 'Technical aptitude, training provided'
  },
  {
    id: 'children',
    name: "Children's Ministry",
    description: 'Serve and disciple the next generation through teaching, supervision, and creative activities.',
    icon: '👶',
    color: 'bg-green-100 text-green-800',
    needsVolunteers: true,
    timeCommitment: 'Weekly (Sundays)',
    requirements: 'Background check, love for children'
  },
  {
    id: 'youth',
    name: 'Youth Ministry',
    description: 'Mentor and disciple middle and high school students through teaching, games, and personal relationships.',
    icon: '👦',
    color: 'bg-orange-100 text-orange-800',
    needsVolunteers: true,
    timeCommitment: 'Weekly (Fridays & Sundays)',
    requirements: 'Background check, ability to connect with teens'
  },
  {
    id: 'ushering',
    name: 'Ushering Team',
    description: 'Welcome and guide visitors and members, manage seating, and help maintain order during services.',
    icon: '🚪',
    color: 'bg-red-100 text-red-800',
    needsVolunteers: true,
    timeCommitment: 'Weekly (Services)',
    requirements: 'Friendly demeanor, organizational skills'
  },
  {
    id: 'security',
    name: 'Security Team',
    description: 'Ensure a safe and secure environment for all attendees through vigilance and emergency preparedness.',
    icon: '🛡️',
    color: 'bg-gray-100 text-gray-800',
    needsVolunteers: true,
    timeCommitment: 'Weekly (Services)',
    requirements: 'Background check, physical capability'
  },
  {
    id: 'greeters',
    name: 'Greeters Team',
    description: 'Be the friendly face that welcomes everyone as they arrive. Help create a welcoming atmosphere.',
    icon: '👋',
    color: 'bg-pink-100 text-pink-800',
    needsVolunteers: true,
    timeCommitment: 'Weekly (Services)',
    requirements: 'Warm personality, willingness to serve'
  },
  {
    id: 'hospitality',
    name: 'Hospitality Team',
    description: 'Serve refreshments, coordinate meals for events, and create a hospitable environment.',
    icon: '☕',
    color: 'bg-yellow-100 text-yellow-800',
    needsVolunteers: true,
    timeCommitment: 'As needed',
    requirements: 'Enjoy serving and working with food'
  },
  {
    id: 'prayer',
    name: 'Intercessory Prayer Team',
    description: 'Pray for the church, community, and world. Partner with God in the spiritual battle.',
    icon: '🙏',
    color: 'bg-indigo-100 text-indigo-800',
    needsVolunteers: true,
    timeCommitment: 'Weekly (Wednesdays)',
    requirements: 'Passion for prayer, discernment'
  },
  {
    id: 'firstimpressions',
    name: 'First Impressions',
    description: 'Help visitors have an amazing first experience. Guide them through the campus and answer questions.',
    icon: '✨',
    color: 'bg-teal-100 text-teal-800',
    needsVolunteers: true,
    timeCommitment: 'Weekly (Sundays)',
    requirements: 'Outgoing personality, knowledge of campus'
  },
  {
    id: 'outreach',
    name: 'Community Outreach',
    description: 'Serve our community through service projects, events, and meeting practical needs.',
    icon: '🤝',
    color: 'bg-cyan-100 text-cyan-800',
    needsVolunteers: true,
    timeCommitment: 'Monthly projects',
    requirements: 'Willingness to serve in various settings'
  },
  {
    id: 'administrative',
    name: 'Administrative Support',
    description: 'Help with office tasks, data entry, phone calls, and general administrative needs.',
    icon: '📋',
    color: 'bg-slate-100 text-slate-800',
    needsVolunteers: true,
    timeCommitment: 'Flexible',
    requirements: 'Computer skills, attention to detail'
  }
]

export default function ServePage() {
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ministry: '',
    experience: '',
    availability: ''
  })

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to an API
    alert(`Thank you for your interest in serving! We'll be in touch soon.\n\nMinistry: ${formData.ministry}`)
    setShowForm(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      ministry: '',
      experience: '',
      availability: ''
    })
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case '🎵': return <Music className="h-6 w-6" />
      case '🎥': return <Monitor className="h-6 w-6" />
      case '👶': return <Users className="h-6 w-6" />
      case '👦': return <Users className="h-6 w-6" />
      case '🚪': return <Users className="h-6 w-6" />
      case '🛡️': return <Shield className="h-6 w-6" />
      case '👋': return <Users className="h-6 w-6" />
      case '☕': return <Utensils className="h-6 w-6" />
      case '🙏': return <Heart className="h-6 w-6" />
      default: return <Heart className="h-6 w-6" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-16 w-16 text-accent mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Serve With Us</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Discover your gifts and passions by serving in one of our ministry areas. 
            There\'s a place for everyone to make a difference!
          </p>
        </div>
      </section>

      {/* Why Serve */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">Why Serve?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Use Your Gifts',
                  description: 'God has given each of us unique gifts. Serving helps you discover and develop those gifts.',
                  icon: '🎁'
                },
                {
                  title: 'Make a Difference',
                  description: 'Your service impacts lives - both those you serve with and those you serve.',
                  icon: '💫'
                },
                {
                  title: 'Grow Spiritually',
                  description: 'Serving is a powerful way to grow in your faith and draw closer to God.',
                  icon: '🌱'
                }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Find Your Ministry</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                We have many opportunities to serve. Browse through our ministries and find where God is calling you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ministries.map((ministry) => (
                <div 
                  key={ministry.id}
                  className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition duration-300 ${
                    selectedMinistry === ministry.id ? 'ring-2 ring-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{getIcon(ministry.icon)}</div>
                    {ministry.needsVolunteers && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Needs Volunteers
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{ministry.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{ministry.description}</p>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">Time:</span> {ministry.timeCommitment}
                  </div>

                  {ministry.requirements && (
                    <div className="text-sm text-gray-500 mb-4">
                      <span className="font-medium">Requirements:</span> {ministry.requirements}
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedMinistry(ministry.id)
                      setFormData(prev => ({ ...prev, ministry: ministry.name }))
                      setShowForm(true)
                    }}
                    className="w-full mt-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center"
                  >
                    I'm Interested <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Serve Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Join the Ministry Team</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    placeholder="+233 50 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ministry *</label>
                <input
                  type="text"
                  required
                  value={formData.ministry}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience/Skills</label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  rows={3}
                  placeholder="Tell us about any relevant experience or skills..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  placeholder="e.g., Sundays, Wednesdays, Monthly"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-600 text-lg">
                Here are your next steps to begin serving at El-Shaddai
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: 1, title: 'Explore', description: 'Browse our ministries and find where your gifts fit' },
                { step: 2, title: 'Connect', description: 'Fill out our interest form or talk to a ministry leader' },
                { step: 3, title: 'Serve', description: 'Get trained and start making a difference!' }
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Serving?</h2>
            <p className="text-xl mb-8 opacity-90">
              Our team would love to help you find the perfect place to serve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+233501234567"
                className="inline-flex items-center bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Us
              </a>
              <a 
                href="mailto:info@elshaddai.com"
                className="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition duration-300"
              >
                <Mail className="h-5 w-5 mr-2" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

