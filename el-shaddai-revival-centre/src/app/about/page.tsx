import Hero from '@/components/Hero'
import { 
  Church, 
  Users, 
  Target, 
  Heart, 
  Award, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

// Team members data
const leadershipTeam = [
  {
    name: 'Pastor John Smith',
    role: 'Senior Pastor',
    bio: 'Leading our congregation with wisdom and compassion for over 20 years.',
    image: '/images/team/pastor-john.jpg'
  },
  {
    name: 'Pastor Sarah Johnson',
    role: 'Associate Pastor',
    bio: 'Passionate about discipleship and community outreach.',
    image: '/images/team/pastor-sarah.jpg'
  },
  {
    name: 'David Williams',
    role: 'Worship Pastor',
    bio: 'Guiding our worship team to create meaningful worship experiences.',
    image: '/images/team/david.jpg'
  },
  {
    name: 'Mary Thompson',
    role: 'Children\'s Director',
    bio: 'Dedicated to nurturing the faith of the next generation.',
    image: '/images/team/mary.jpg'
  }
]

// Core values data
const coreValues = [
  {
    icon: Heart,
    title: 'Love',
    description: 'We believe in showing Christ&apos;s love to everyone, unconditionally'
  },
  {
    icon: Target,
    title: 'Purpose',
    description: 'We exist to fulfill the Great Commission and make disciples'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We are family, supporting and caring for one another'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in all we do, to honor God'
  }
]

// Service times data
const serviceTimes = [
  {
    day: 'Sunday',
    times: ['9:00 AM - Contemporary', '11:00 AM - Traditional'],
    description: 'Main worship services with separate ministries for all ages'
  },
  {
    day: 'Wednesday',
    times: ['7:00 PM'],
    description: 'Bible study, prayer meeting, and youth activities'
  },
  {
    day: 'Friday',
    times: ['7:00 PM'],
    description: 'Youth group gathering for middle and high school students'
  },
  {
    day: 'Saturday',
    times: ['6:00 PM'],
    description: 'Contemporary service in a more casual atmosphere'
  }
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About El-Shaddai Revival Centre</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            A community of faith, hope, and love, dedicated to sharing God's word and serving our community
          </p>
        </div>
      </section>

      {/* Our Story / History */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Church className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-600 text-lg">
                From humble beginnings to a thriving community of believers
              </p>
            </div>
            
            <div className="prose max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Humble Beginnings</h3>
                  <p className="text-gray-600 mb-4">
                    El-Shaddai Revival Centre was founded in 1985 by a small group of believers who had a vision 
                    to create a place where everyone could experience God&apos;s love and grace. 
                    What started as a Bible study in a local living room has grown into a vibrant 
                    community of thousands.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Over the decades, we have remained true to our founding principles while 
                    embracing growth and change. Our sanctuary has expanded, our ministries 
                    have multiplied, but our heart for God and people has never changed.
                  </p>
                  <p className="text-gray-600">
                    Today, El-Shaddai Revival Centre continues to be a beacon of hope in our community, 
                    welcoming all who seek a deeper relationship with God and meaningful 
                    connections with others.
                  </p>
                </div>
                <div className="bg-gray-200 rounded-xl h-80 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">[Church History Image]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Target className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Mission & Vision</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="bg-accent bg-opacity-10 p-3 rounded-full mr-4">
                    <Target className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Mission</h3>
                </div>
                <p className="text-gray-600 text-lg mb-6">
                  To love God, love people, and make disciples of Jesus Christ.
                </p>
                <p className="text-gray-600">
                  We are committed to fulfilling the Great Commission by reaching the lost, 
                  discipling the found, and sending them out to impact the world for Christ. 
                  Every ministry, program, and initiative is designed to advance this mission.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Vision</h3>
                </div>
                <p className="text-gray-600 text-lg mb-6">
                  To be a church where every person belongs, grows, and serves.
                </p>
                <p className="text-gray-600">
                  We envision a community where authenticity is valued, relationships are 
                  cultivated, and lives are transformed. Our dream is to see thousands of 
                  families strengthened, communities served, and individuals discovering 
                  their God-given purpose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Heart className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreValues.map((value, index) => {
                const Icon = value.icon
                return (
                  <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition duration-300">
                    <div className="bg-accent bg-opacity-10 p-4 rounded-full inline-block mb-4">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Our Leadership Team</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Dedicated servants leading our church family
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {leadershipTeam.map((leader, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                  <div className="bg-gray-200 h-64 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">[Photo: {leader.name}]</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                    <p className="text-accent font-medium mb-3">{leader.role}</p>
                    <p className="text-gray-600 text-sm">{leader.bio}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                href="/about/team" 
                className="inline-flex items-center text-accent hover:text-red-600 font-medium"
              >
                View Full Team <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Join Us for Worship</h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                We would love to see you this Sunday!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {serviceTimes.map((service, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition duration-300">
                  <h3 className="text-xl font-bold mb-3 text-accent">{service.day}</h3>
                  <div className="space-y-2 mb-3">
                    {service.times.map((time, timeIndex) => (
                      <p key={timeIndex} className="font-medium">{time}</p>
                    ))}
                  </div>
                  <p className="text-sm opacity-80">{service.description}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link 
                href="/plan-your-visit" 
                className="inline-flex items-center bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
              >
                Plan Your Visit <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <MapPin className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-gray-600 text-lg">
                We&apos;d love to hear from you!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 rounded-xl bg-gray-50">
                <MapPin className="h-10 w-10 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Location</h3>
                <p className="text-gray-600">
                  Nabewam, Ghana
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-gray-50">
                <Phone className="h-10 w-10 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Phone</h3>
                <p className="text-gray-600">
                  (555) 123-4567
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-gray-50">
                <Mail className="h-10 w-10 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Email</h3>
                <p className="text-gray-600">
                  info@gracechurch.com
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition duration-300"
              >
                Send Us a Message
              </Link>
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
                Planning your first visit? Here&apos;s what you need to know
              </p>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  title: 'Warm Welcome',
                  description: 'You&apos;ll be greeted by our friendly welcome team who will help you feel at home'
                },
                {
                  title: 'Contemporary Worship',
                  description: 'Our worship services feature modern music with meaningful lyrics that help focus on God'
                },
                {
                  title: 'Relevant Teaching',
                  description: 'Biblical messages that are practical, encouraging, and applicable to everyday life'
                },
                {
                  title: 'Something for Everyone',
                  description: 'We offer engaging programs for children, students, and adults during service times'
                },
                {
                  title: 'No Pressure',
                  description: 'There&apos;s no dress code, no expecting you to give, or know all the answers. Just come as you are!'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-sm">
                  <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-accent to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Involved?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Whether you&apos;re looking for a church home, wanting to serve, or just curious about faith, 
            we have a place for you at El-Shaddai Revival Centre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/give" 
              className="bg-white text-accent px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 inline-block"
            >
              Give Online
            </Link>
            <Link 
              href="/sermons" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-accent transition duration-300 inline-block"
            >
              Watch Sermons
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

