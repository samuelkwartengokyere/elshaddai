'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Users, 
  ArrowLeft, 
  Mail, 
  Phone, 
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react'

// Full team data
const leadershipTeam = [
  {
    id: '1',
    name: 'Pastor John Smith',
    role: 'Senior Pastor',
    bio: 'Leading our congregation with wisdom and compassion for over 20 years. Pastor John has a heart for souls and a vision to see our community transformed by the power of God.',
    image: '/images/team/pastor-john.jpg',
    email: 'pastor.john@elshaddai.com',
    phone: '+233 50 123 4567',
    department: 'Senior Leadership'
  },
  {
    id: '2',
    name: 'Pastor Sarah Johnson',
    role: 'Associate Pastor',
    bio: 'Passionate about discipleship and community outreach. Sarah leads our connect groups and coordinates community service initiatives.',
    image: '/images/team/pastor-sarah.jpg',
    email: 'pastor.sarah@elshaddai.com',
    phone: '+233 50 123 4568',
    department: 'Discipleship & Outreach'
  },
  {
    id: '3',
    name: 'David Williams',
    role: 'Worship Pastor',
    bio: 'Guiding our worship team to create meaningful worship experiences. David has a gift for leading people into God\'s presence through music and praise.',
    image: '/images/team/david.jpg',
    email: 'david@elshaddai.com',
    phone: '+233 50 123 4569',
    department: 'Worship & Arts'
  },
  {
    id: '4',
    name: 'Mary Thompson',
    role: "Children's Director",
    bio: 'Dedicated to nurturing the faith of the next generation. Mary leads our children\'s ministry with creativity and love.',
    image: '/images/team/mary.jpg',
    email: 'mary@elshaddai.com',
    phone: '+233 50 123 4570',
    department: "Children's Ministry"
  },
  {
    id: '5',
    name: 'James Osei',
    role: 'Youth Pastor',
    bio: 'Empowering young people to discover their purpose in God. James leads our youth with energy and biblical wisdom.',
    image: '/images/team/james.jpg',
    email: 'james@elshaddai.com',
    phone: '+233 50 123 4571',
    department: 'Youth Ministry'
  },
  {
    id: '6',
    name: 'Grace Mensah',
    role: 'Women\'s Ministry Leader',
    bio: 'Encouraging women in their spiritual journey through fellowship, teaching, and support groups.',
    image: '/images/team/grace.jpg',
    email: 'grace@elshaddai.com',
    phone: '+233 50 123 4572',
    department: "Women's Ministry"
  }
]

const ministryTeams = [
  {
    name: 'Worship Team',
    description: 'Leading our congregation in worship through music and praise',
    members: 15,
    icon: '🎵'
  },
  {
    name: 'Media & Technology',
    description: 'Managing audio, video, and livestream for our services',
    members: 8,
    icon: '🎥'
  },
  {
    name: 'Ushering Team',
    description: 'Welcoming and guiding visitors and members during services',
    members: 12,
    icon: '🚪'
  },
  {
    name: 'Security Team',
    description: 'Ensuring a safe environment for all attendees',
    members: 10,
    icon: '🛡️'
  },
  {
    name: 'Intercessory Prayer Team',
    description: 'Praying for the church, community, and world',
    members: 6,
    icon: '🙏'
  },
  {
    name: 'Greeters Team',
    description: 'Making everyone feel welcome as they arrive',
    members: 8,
    icon: '👋'
  }
]

export default function TeamPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/about" 
            className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to About
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Leadership Team</h1>
          <p className="text-xl text-gray-200 max-w-3xl">
            Meet the dedicated servants who lead El-Shaddai Revival Centre with passion and vision
          </p>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Senior Leadership</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Our pastoral and ministry leaders are committed to guiding our church family with biblical wisdom and servant hearts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {leadershipTeam.map((leader) => (
                <div 
                  key={leader.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
                >
                  {/* Profile Image */}
                  <div className="bg-gray-200 h-64 flex items-center justify-center relative">
                    {leader.image && leader.image !== '/images/team/default.jpg' ? (
                      <Image
                        src={leader.image}
                        alt={leader.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <div className="w-32 h-32 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-4xl font-bold text-accent">
                            {leader.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    {/* Department Badge */}
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                      {leader.department}
                    </span>
                    
                    {/* Name & Role */}
                    <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                    <p className="text-accent font-medium mb-4">{leader.role}</p>
                    
                    {/* Bio */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {leader.bio}
                    </p>
                    
                    {/* Contact */}
                    <div className="space-y-2 pt-4 border-t">
                      <a 
                        href={`mailto:${leader.email}`}
                        className="flex items-center text-sm text-gray-600 hover:text-accent transition duration-300"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {leader.email}
                      </a>
                      <a 
                        href={`tel:${leader.phone}`}
                        className="flex items-center text-sm text-gray-600 hover:text-accent transition duration-300"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {leader.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ministry Teams */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Sparkles className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Ministry Teams</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Behind every successful service are dedicated teams serving in various capacities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ministryTeams.map((team, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition duration-300"
                >
                  <div className="text-4xl mb-4">{team.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                  <p className="text-gray-600 mb-3">{team.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      <Users className="h-4 w-4 inline mr-1" />
                      {team.members} members
                    </span>
                    <Link 
                      href="/serve"
                      className="text-accent hover:text-red-600 font-medium flex items-center text-sm"
                    >
                      Join Team <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-16 bg-gradient-to-r from-accent to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Serve?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            There\'s a place for you on our ministry teams. Discover your gifts and serve alongside other believers.
          </p>
          <Link
            href="/serve"
            className="inline-flex items-center bg-white text-accent px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition duration-300"
          >
            Explore Serving Opportunities
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

