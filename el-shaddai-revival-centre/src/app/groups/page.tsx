import Link from 'next/link'
import { Users, Heart, BookOpen, Calendar, Mail, Phone } from 'lucide-react'

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#003399] to-[#002266] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Users className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">Join Our Community Groups</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Connect with fellow believers in meaningful relationships that foster spiritual growth and mutual support.
          </p>
        </div>
      </section>

      {/* Mentees Group Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Mentees Group</h2>
              <p className="text-xl text-gray-600">
                Our prayer camp's dedicated mentorship and discipleship program
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-primary">About the Group</h3>
                  <p className="text-gray-700 mb-6">
                    The Mentees Group at El-Shaddai Revival Centre is designed for those seeking deeper spiritual growth
                    through mentorship and discipleship. As a prayer camp, we focus on developing strong foundations in
                    faith, prayer, and biblical understanding.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Heart className="h-6 w-6 text-accent mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Spiritual Growth</h4>
                        <p className="text-gray-600">Personal development through mentorship and prayer</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <BookOpen className="h-6 w-6 text-accent mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Biblical Teaching</h4>
                        <p className="text-gray-600">Deep study of scripture and spiritual disciplines</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users className="h-6 w-6 text-accent mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Community Support</h4>
                        <p className="text-gray-600">Fellowship and mutual encouragement</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4 text-primary">Meeting Details</h3>

                  <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                    <div className="flex items-center mb-3">
                      <Calendar className="h-5 w-5 text-accent mr-3" />
                      <span className="font-medium">Weekly Meetings</span>
                    </div>
                    <p className="text-gray-600 mb-4">Every Wednesday evening at 7:00 PM</p>

                    <div className="flex items-center mb-3">
                      <Users className="h-5 w-5 text-accent mr-3" />
                      <span className="font-medium">Location</span>
                    </div>
                    <p className="text-gray-600">El-Shaddai Revival Centre, Nabewam, Ghana</p>
                  </div>

                  <div className="bg-accent/10 rounded-lg p-6">
                    <h4 className="font-bold text-lg mb-3">Ready to Join?</h4>
                    <p className="text-gray-700 mb-4">
                      Contact us to learn more about becoming part of our Mentees Group and starting your journey
                      of spiritual growth.
                    </p>

                    <div className="space-y-3">
                      <Link
                        href="/contact"
                        className="inline-flex items-center text-accent hover:text-red-600 font-medium"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send us a message
                      </Link>
                      <br />
                      <Link
                        href="tel:+233501234567"
                        className="inline-flex items-center text-accent hover:text-red-600 font-medium"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call +233 50 123 4567
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Take the Next Step</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join our Mentees Group and become part of a community dedicated to spiritual growth and discipleship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-accent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-600 transition duration-300"
            >
              Get in Touch
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary transition duration-300"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
