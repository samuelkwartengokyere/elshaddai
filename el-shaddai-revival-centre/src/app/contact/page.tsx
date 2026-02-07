'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  MessageSquare,
  Headphones,
  Calendar,
  Users,
  Heart,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

// Ministry contact information
const ministryContacts = [
  {
    icon: Users,
    title: 'Pastoral Care',
    email: 'pastoralcare@elshaddai.com',
    phone: '+233 50 123 4568',
    description: 'Prayer requests, counseling, pastoral visits'
  },
  {
    icon: Calendar,
    title: 'Events & Ministries',
    email: 'events@elshaddai.com',
    phone: '+233 50 123 4569',
    description: 'Event bookings, ministry partnerships'
  },
  {
    icon: Heart,
    title: 'Benevolence & Outreach',
    email: 'outreach@elshaddai.com',
    phone: '+233 50 123 4570',
    description: 'Community outreach, assistance programs'
  },
  {
    icon: Headphones,
    title: 'Technical Support',
    email: 'support@elshaddai.com',
    phone: '+233 50 123 4571',
    description: 'Live stream issues, website support'
  }
]

// FAQ data
const faqs = [
  {
    question: 'What are your service times?',
    answer: 'We have Sunday services at 9:00 AM and 11:00 AM, Wednesday Bible Study at 7:00 PM, and Friday Youth Service at 7:00 PM.'
  },
  {
    question: 'Where are you located?',
    answer: 'We&apos;re located at El-Shaddai Revival Centre, Nabewam, Ghana. There&apos;s plenty of parking available on-site.'
  },
  {
    question: 'Is there parking available?',
    answer: 'Yes! We have a large parking lot with accessible parking spaces near the main entrance.'
  },
  {
    question: 'What should I wear?',
    answer: 'Come as you are! We have no dress code. Some people dress casually, others dress up. You&apos;ll feel welcome either way.'
  },
  {
    question: 'Is there childcare available?',
    answer: 'Yes, we have a well-staffed nursery for infants and toddlers, and exciting programs for children during all services.'
  },
  {
    question: 'How can I get involved in ministry?',
    answer: 'We&apos;d love to help you find your place! Visit our Welcome Center after any service or contact us to discuss your interests and gifts.'
  }
]

// Contact form component
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitStatus('success')
    setIsSubmitting(false)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    
    // Reset status after 3 seconds
    setTimeout(() => setSubmitStatus('idle'), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-300"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-300"
            placeholder="john@example.com"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-300"
            placeholder="+233 50 123 4567"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <select
            id="subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-300"
          >
            <option value="">Select a topic</option>
            <option value="general">General Inquiry</option>
            <option value="prayer">Prayer Request</option>
            <option value="counseling">Counseling Request</option>
            <option value="events">Events & Ministries</option>
            <option value="outreach">Outreach & Benevolence</option>
            <option value="technical">Technical Support</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-300 resize-none"
          placeholder="How can we help you?"
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center ${
          isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-accent hover:bg-red-700'
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Send Message
          </>
        )}
      </button>
      
      {submitStatus === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Thank you for your message!</p>
          <p>We&apos;ll get back to you within 24-48 hours.</p>
        </div>
      )}
    </form>
  )
}

// FAQ Item component
function FAQItem({ faq, isOpen, onClick }: { faq: typeof faqs[0]; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition duration-300"
      >
        <span className="font-semibold text-gray-800">{faq.question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-600">{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function ContactPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <MessageSquare className="h-16 w-16 text-accent mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            We&apos;d love to hear from you! Whether you have a question, prayer request, 
            or just want to say hello, we&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Multiple ways to reach us - choose what works best for you
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Address */}
              <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition duration-300">
                <div className="bg-accent/10 p-4 rounded-full inline-block mb-4">
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Visit Us</h3>
                <p className="text-gray-600">
                  El-Shaddai Revival Centre<br />
                  Nabewam, Ghana
                </p>
              </div>
              
              {/* Phone */}
              <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition duration-300">
                <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Call Us</h3>
                <p className="text-gray-600">
                  +233 50 123 4567<br />
                  Mon-Fri: 9AM-5PM
                </p>
              </div>
              
              {/* Email */}
              <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition duration-300">
                <div className="bg-accent/10 p-4 rounded-full inline-block mb-4">
                  <Mail className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Email Us</h3>
                <p className="text-gray-600">
                  info@elshaddai.com<br />
                  We reply within 48hrs
                </p>
              </div>
              
              {/* Service Times */}
              <div className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition duration-300">
                <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Service Times</h3>
                <p className="text-gray-600">
                  Sun: 9AM & 11AM<br />
                  Wed: 7PM | Fri: 7PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ministry Contacts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Ministry Contacts</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Direct lines to our ministry teams for specific inquiries
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ministryContacts.map((contact, index) => {
                const Icon = contact.icon
                return (
                  <div 
                    key={index} 
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition duration-300 flex items-start space-x-4"
                  >
                    <div className="bg-accent/10 p-3 rounded-lg flex-shrink-0">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold mb-2">{contact.title}</h3>
                      <p className="text-gray-600 mb-3">{contact.description}</p>
                      <div className="space-y-1">
                        <a 
                          href={`mailto:${contact.email}`}
                          className="flex items-center text-accent hover:text-red-600 transition duration-300"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {contact.email}
                        </a>
                        <a 
                          href={`tel:${contact.phone}`}
                          className="flex items-center text-accent hover:text-red-600 transition duration-300"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold mb-4">Send Us a Message</h2>
                  <p className="text-gray-600 text-lg">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>
                <ContactForm />
              </div>
              
              {/* Map & Social Media */}
              <div>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold mb-4">Find Us</h2>
                  <p className="text-gray-600 text-lg mb-6">
                    We&apos;d love to see you in person! Here&apos;s where you can find us.
                  </p>
                </div>
                
                {/* Google Maps Embed */}
                <div className="rounded-xl overflow-hidden h-80 mb-8 shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.315478688!2d-1.2754906!3d6.6171429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdbe34a2f57f947%3A0xa0acf09db386e2c5!2sEl-Shaddai%20Revival%20Centre!5e0!3m2!1sen!2sgh!4v1700000000000!5m2!1sen!2sgh"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="El-Shaddai Revival Centre Location"
                  />
                </div>
                
                {/* Directions */}
                <div className="bg-gray-50 p-6 rounded-xl mb-8">
                  <h3 className="text-xl font-bold mb-4">Getting Here</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                      <span>From Kumasi, take the Accra-Kumasi highway towards Nkawkaw</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                      <span>Look for signs to Nabewam town centre</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                      <span>El-Shaddai Revival Centre is located near the main junction</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                      <span>Follow signs to the church grounds with ample parking</span>
                    </li>
                  </ul>
                </div>
                
                {/* Social Media */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a 
                      href="#" 
                      className="bg-primary text-white p-3 rounded-full hover:bg-accent transition duration-300"
                    >
                      <Facebook className="h-6 w-6" />
                    </a>
                    <a 
                      href="#" 
                      className="bg-primary text-white p-3 rounded-full hover:bg-accent transition duration-300"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a 
                      href="#" 
                      className="bg-primary text-white p-3 rounded-full hover:bg-accent transition duration-300"
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                    <a 
                      href="#" 
                      className="bg-primary text-white p-3 rounded-full hover:bg-accent transition duration-300"
                    >
                      <Youtube className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Quick answers to common questions
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem 
                  key={index} 
                  faq={faq} 
                  isOpen={openFaqIndex === index}
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Link 
                href="tel:+233501234567"
                className="inline-flex items-center text-accent hover:text-red-600 font-semibold"
              >
                Call us at +233 50 123 4567 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Request Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="h-16 w-16 text-accent mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Prayer Requests</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Our prayer team is here for you. Whether you&apos;re facing a challenge or 
              celebrating a blessing, we&apos;d love to pray with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/prayer"
                className="bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition duration-300 inline-block"
              >
                Submit Prayer Request
              </Link>
              <a 
                href="tel:+233501234568"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition duration-300 inline-block"
              >
                Call Prayer Line
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Your Next Steps</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Here are some ways to get connected with our church family
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Plan Your Visit',
                  description: 'We&apos;d love to see you! Learn more about what to expect when you join us.',
                  href: '/plan-your-visit',
                  color: 'bg-accent'
                },
                {
                  title: 'Join a Small Group',
                  description: 'Connect with others in a smaller community setting for fellowship and growth.',
                  href: '/groups',
                  color: 'bg-primary'
                },
                {
                  title: 'Serve With Us',
                  description: 'Discover your gifts and passions by serving in one of our ministries.',
                  href: '/serve',
                  color: 'bg-secondary'
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition duration-300 text-center"
                >
                  <div className={`${item.color}/10 p-4 rounded-full inline-block mb-4`}>
                    <ArrowRight className={`h-8 w-8 ${item.color === 'bg-accent' ? 'text-accent' : 'text-primary'}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-6">{item.description}</p>
                  <Link 
                    href={item.href}
                    className={`inline-flex items-center ${item.color === 'bg-accent' ? 'text-accent' : 'text-primary'} hover:text-red-600 font-medium`}
                  >
                    Learn More <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

