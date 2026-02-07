'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Heart, 
  Send, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Users,
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface PrayerRequest {
  name: string
  email: string
  phone: string
  type: 'personal' | 'family' | 'other'
  isPrivate: boolean
  request: string
  answeredPrayer: boolean
}

export default function PrayerPage() {
  const [formData, setFormData] = useState<PrayerRequest>({
    name: '',
    email: '',
    phone: '',
    type: 'personal',
    isPrivate: true,
    request: '',
    answeredPrayer: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.request.trim()) {
      newErrors.request = 'Please share your prayer request'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('idle')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setSubmitStatus('success')
    setIsSubmitting(false)

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: 'personal',
      isPrivate: true,
      request: '',
      answeredPrayer: false
    })

    // Reset status after 5 seconds
    setTimeout(() => setSubmitStatus('idle'), 5000)
  }

  const handleFieldChange = (field: keyof PrayerRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-16 w-16 text-accent mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Prayer Requests</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            "Do not be anxious about anything, but in every situation, by prayer and petition, 
            with thanksgiving, present your requests to God." - Philippians 4:6
          </p>
        </div>
      </section>

      {/* Submit Prayer Request */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {submitStatus === 'success' ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Prayer Request Submitted</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for trusting us with your prayer request. Our prayer team will 
                  begin praying for you immediately. You will receive a confirmation email shortly.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Remember, God hears your prayers! We believe that what you have asked for 
                  according to His will shall come to pass.
                </p>
                <button
                  onClick={() => setSubmitStatus('idle')}
                  className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Submit Your Request</h2>
                  <p className="text-gray-600">
                    Our prayer team is standing by to pray for you. Every request is treated with confidentiality.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                        placeholder="+233 50 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Request Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                      >
                        <option value="personal">Personal Prayer</option>
                        <option value="family">Family/Friend</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Request */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Prayer Request *
                    </label>
                    <textarea
                      value={formData.request}
                      onChange={(e) => handleFieldChange('request', e.target.value)}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent ${
                        errors.request ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Share your prayer request with us. We believe God is able to do immeasurably more than all we ask or imagine..."
                    />
                    {errors.request && (
                      <p className="text-red-500 text-sm mt-1">{errors.request}</p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPrivate}
                        onChange={(e) => handleFieldChange('isPrivate', e.target.checked)}
                        className="h-5 w-5 text-accent rounded focus:ring-accent mr-2"
                      />
                      <span className="text-gray-700">Keep this request private</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.answeredPrayer}
                        onChange={(e) => handleFieldChange('answeredPrayer', e.target.checked)}
                        className="h-5 w-5 text-accent rounded focus:ring-accent mr-2"
                      />
                      <span className="text-gray-700">This is an answered prayer!</span>
                    </label>
                  </div>

                  {/* Privacy Notice */}
                  <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                    <Shield className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Your privacy is important to us. All prayer requests are kept confidential 
                      and shared only with our prayer team. We never share your personal information.
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center ${
                      isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent hover:bg-red-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit Prayer Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prayer Ministry Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Our Prayer Ministry</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                We have a dedicated team of intercessors who pray for the needs of our church family and community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gray-50 rounded-xl">
                <div className="bg-accent/10 p-4 rounded-full inline-block mb-4">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">24/7 Prayer Chain</h3>
                <p className="text-gray-600">
                  Our prayer team operates around the clock to ensure no prayer goes unheard.
                </p>
              </div>
              <div className="text-center p-8 bg-gray-50 rounded-xl">
                <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Prayer Meetings</h3>
                <p className="text-gray-600">
                  Join us every Wednesday at 7 PM for our corporate prayer meeting.
                </p>
              </div>
              <div className="text-center p-8 bg-gray-50 rounded-xl">
                <div className="bg-secondary/10 p-4 rounded-full inline-block mb-4">
                  <Phone className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Prayer Hotline</h3>
                <p className="text-gray-600">
                  Call our prayer line for immediate prayer and encouragement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Prayer Team */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Need Immediate Prayer?</h2>
            <p className="text-xl mb-8 opacity-90">
              Our prayer ministers are available to pray with you right now.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Phone className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-bold mb-2">Call Us</h3>
                <p className="opacity-90">+233 50 123 4568</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Mail className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-bold mb-2">Email</h3>
                <p className="opacity-90">prayer@elshaddai.com</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <Clock className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-bold mb-2">Available</h3>
                <p className="opacity-90">24/7 Prayer Line</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Encouragement */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">"The prayer of a righteous person is powerful and effective."</h2>
            <p className="text-xl text-gray-600 mb-8">James 5:16</p>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <p className="text-gray-700 text-lg italic mb-4">
                "Dear friend, whatever trial you are facing today, know that you are not alone. 
                The God of the universe sees you, knows your name, and cares deeply about every 
                detail of your life. Cast all your anxiety on Him because He cares for you."
              </p>
              <p className="text-gray-500 font-medium">- Your El-Shaddai Family</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

