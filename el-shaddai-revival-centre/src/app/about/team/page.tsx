'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Users, 
  ArrowLeft, 
  Mail, 
  Phone, 
  ArrowRight,
  ChevronRight,
  Sparkles,
  Loader2
} from 'lucide-react'

interface TeamMember {
  _id: string
  name: string
  role: string
  bio: string
  image?: string
  email?: string
  phone?: string
  department?: string
  isLeadership: boolean
  isPublished: boolean
  order: number
}

const ministryTeams = [
  {
    name: 'Worship Team',
    slug: 'worship-team',
    description: 'Leading our congregation in worship through music and praise',
    members: 15,
    icon: '🎵'
  },
  {
    name: 'Media & Technology',
    slug: 'media-technology',
    description: 'Managing audio, video, and livestream for our services',
    members: 8,
    icon: '🎥'
  },
  {
    name: 'Ushering Team',
    slug: 'ushering-team',
    description: 'Welcoming and guiding visitors and members during services',
    members: 12,
    icon: '🚪'
  },
  {
    name: 'Security Team',
    slug: 'security-team',
    description: 'Ensuring a safe environment for all attendees',
    members: 10,
    icon: '🛡️'
  },
  {
    name: 'Intercessory Prayer Team',
    slug: 'intercessory-prayer-team',
    description: 'Praying for the church, community, and world',
    members: 6,
    icon: '🙏'
  }
]



export default function TeamPage() {
  const [leadershipTeam, setLeadershipTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetchLeadershipTeam()
  }, [])

  const fetchLeadershipTeam = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/teams?limit=50&department=Senior+Leadership`, {
        cache: 'no-store'
      })
      
      if (!res.ok) {
        throw new Error('Failed to fetch team')
      }
      
      const data = await res.json()
      
      if (data.teamMembers && data.teamMembers.length > 0) {
        // Filter to only Senior Leadership and sort by order
        const filtered = data.teamMembers.filter((m: TeamMember) => m.department === 'Senior Leadership')
        const sorted = [...filtered].sort((a, b) => a.order - b.order)
        setLeadershipTeam(sorted)
      } else {
        setLeadershipTeam([])
      }
    } catch (err) {
      console.error('Error fetching leadership team:', err)
      // No fallback on error - show empty
      setLeadershipTeam([])
    } finally {
      setLoading(false)
    }
  }

  // Determine which team to display
  const displayTeam = leadershipTeam

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

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <span className="ml-2 text-gray-600">Loading leadership team...</span>
              </div>
            )}

            {/* Leadership Team Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayTeam.map((leader) => (
                  <div 
                    key={leader._id} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
                  >
                    {/* Profile Image */}
                    <div className="bg-gray-200 h-64 flex items-center justify-center relative overflow-hidden">
                      {leader.image && leader.image !== '/images/team/default.jpg' ? (
                        <Image
                          src={leader.image}
                          alt={leader.name}
                          fill
                          className="object-cover object-top"
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
                        {leader.email && (
                          <a 
                            href={`mailto:${leader.email}`}
                            className="flex items-center text-sm text-gray-600 hover:text-accent transition duration-300"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {leader.email}
                          </a>
                        )}
                        {leader.phone && (
                          <a 
                            href={`tel:${leader.phone}`}
                            className="flex items-center text-sm text-gray-600 hover:text-accent transition duration-300"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {leader.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                      href={`/about/team/${team.slug}`}
                      className="text-accent hover:text-red-600 font-medium flex items-center text-sm"
                    >
                      View Team <ArrowRight className="ml-1 h-4 w-4" />
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
            There&apos;s a place for you on our ministry teams. Discover your gifts and serve alongside other believers.
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

