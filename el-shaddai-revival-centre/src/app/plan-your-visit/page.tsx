'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MapPin, 
  Clock, 
  Car, 
  Users, 
  Baby, 
  Coffee,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'

export default function PlanYourVisitPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  const faqs = [
    {
      question: 'What should I wear?',
      answer: 'Come as you are! We have no dress code. Some people dress casually, others dress up. You\'ll feel welcome either way.'
    },
    {
      question: 'Is there parking available?',
      answer: 'Yes! We have a large parking lot with accessible parking spaces near the main entrance. Our parking team will guide you to available spots.'
    },
    {
      question: 'Is there childcare available?',
      answer: 'Yes, we have a well-staffed nursery for infants and toddlers, and exciting programs for children during all services. Our volunteers are background-checked and trained.'
    },
    {
      question: 'What happens when I arrive?',
      answer: 'You\'ll be greeted by our welcome team at the entrance. They\'ll give you a bulletin with information about the service and our church. Feel free to ask them any questions!'
    },
    {
      question: 'How long are the services?',
      answer: 'Our Sunday services typically last about 1.5 hours. Wednesday Bible Study is usually 1 hour. Friday Youth Service is about 1.5 hours.'
    },
    {
      question: 'Will I be asked to give money?',
      answer: 'No! Giving is an act of worship for our members. As our guest, you are not expected to give. If you\'d like to contribute, our online giving options are always available.'
    },
    {
      question: 'Can I take communion?',
      answer: 'Communion is served every first Sunday of the month. All who have accepted Christ as their Savior are welcome to participate.'
    },
    {
      question: 'What about my children?',
      answer: 'Children are welcome in all our services! We also have age-specific programs during Sunday services where kids can learn about God in a fun, safe environment.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Plan Your Visit</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            We can\'t wait to welcome you! Here\'s everything you need to know before you arrive.
          </p>
        </div>
      </section>

      {/* Location & Service Times */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Location */}
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center mb-6">
                  <div className="bg-accent/10 p-3 rounded-full mr-4">
                    <MapPin className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Our Location</h2>
                    <p className="text-gray-600">Find us easily</p>
                  </div>
                </div>
                
                {/* Google Maps Embed */}
                <div className="rounded-xl overflow-hidden h-64 mb-6 shadow-lg">
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

                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-accent mt-1 mr-3" />
                    <div>
                      <p className="font-semibold">El-Shaddai Revival Centre</p>
                      <p className="text-gray-600">Nabewam, Ghana</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-accent mr-3" />
                    <p className="text-gray-600">Free parking available on-site</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link 
                    href="/contact"
                    className="inline-flex items-center text-accent hover:text-red-600 font-medium"
                  >
                    Get Directions <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Service Times */}
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center mb-6">
                  <div className="bg-accent/10 p-3 rounded-full mr-4">
                    <Clock className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Service Times</h2>
                    <p className="text-gray-600">Join us for worship</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { 
                      day: 'Sunday', 
                      times: ['9:00 AM - Contemporary Service', '11:00 AM - Traditional Service'],
                      description: 'Main worship services with separate ministries for all ages',
                      icon: Calendar
                    },
                    { 
                      day: 'Wednesday', 
                      times: ['7:00 PM'],
                      description: 'Bible study, prayer meeting, and youth activities',
                      icon: Clock
                    },
                    { 
                      day: 'Friday', 
                      times: ['7:00 PM'],
                      description: 'Youth group gathering for middle and high school students',
                      icon: Users
                    },
                    { 
                      day: 'Saturday', 
                      times: ['6:00 PM'],
                      description: 'Contemporary service in a more casual atmosphere',
                      icon: Coffee
                    }
                  ].map((service, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <service.icon className="h-5 w-5 text-accent mr-2" />
                        <h3 className="font-bold text-lg">{service.day}</h3>
                      </div>
                      <div className="space-y-1 ml-7">
                        {service.times.map((time, timeIndex) => (
                          <p key={timeIndex} className="text-accent font-medium">{time}</p>
                        ))}
                        <p className="text-sm text-gray-500">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">What to Expect</h2>
              <p className="text-gray-600 text-lg">
                We want your first visit to be warm and welcoming. Here\'s what you can expect.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Warm Welcome',
                  description: 'You\'ll be greeted by our friendly welcome team who will help you feel at home',
                  icon: '👋'
                },
                {
                  title: 'Contemporary Worship',
                  description: 'Our worship services feature modern music with meaningful lyrics that help focus on God',
                  icon: '🎵'
                },
                {
                  title: 'Relevant Teaching',
                  description: 'Biblical messages that are practical, encouraging, and applicable to everyday life',
                  icon: '📖'
                },
                {
                  title: 'Something for Everyone',
                  description: 'We offer engaging programs for children, students, and adults during service times',
                  icon: '👨‍👩‍👧‍👦'
                },
                {
                  title: 'No Pressure',
                  description: 'No dress code, no expecting you to give, or know all the answers. Just come as you are!',
                  icon: '😊'
                },
                {
                  title: 'Fellowship Time',
                  description: 'Stay after service for coffee and conversation in our fellowship hall',
                  icon: '☕'
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Families */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Baby className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">For Families with Children</h2>
              <p className="text-gray-600 text-lg">
                We love seeing families worship together! Here\'s how we serve your little ones.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { age: '0-2 years', name: 'Nursery', description: 'Care for infants and toddlers with loving volunteers' },
                  { age: '3-5 years', name: 'Preschool', description: 'Bible lessons, crafts, and playtime' },
                  { age: '6-12 years', name: 'Kids Church', description: 'Age-appropriate worship and teaching' }
                ].map((group, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg text-center">
                    <span className="text-xs font-medium text-accent">{group.age}</span>
                    <h3 className="text-xl font-bold my-2">{group.name}</h3>
                    <p className="text-gray-600 text-sm">{group.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>All volunteers are background-checked and trained in child safety</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 text-lg">
                Quick answers to common questions about visiting us
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition duration-300"
                  >
                    <span className="font-semibold text-gray-800">{faq.question}</span>
                    <ChevronRight 
                      className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Have More Questions?</h2>
            <p className="text-xl mb-8 opacity-90">
              We\'d love to help! Reach out to our friendly team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+233501234567"
                className="inline-flex items-center bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Us
              </a>
              <Link 
                href="/contact"
                className="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition duration-300"
              >
                <Mail className="h-5 w-5 mr-2" />
                Send a Message
              </Link>
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
                },
                {
                  title: 'Watch Sermons',
                  description: 'Catch up on recent messages you might have missed.',
                  href: '/sermons',
                  color: 'bg-accent'
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition duration-300"
                >
                  <div className={`${item.color}/10 p-4 rounded-full inline-block mb-4`}>
                    <ArrowRight className={`h-8 w-8 ${item.color === 'bg-accent' ? 'text-accent' : 'text-primary'}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-6">{item.description}</p>
                  <Link 
                    href={item.href}
                    className={`inline-flex items-center ${
                      item.color === 'bg-accent' ? 'text-accent' : 'text-primary'
                    } hover:text-red-600 font-medium`}
                  >
                    Learn More <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

