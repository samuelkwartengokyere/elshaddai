'use client'

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { use, useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  Mail, 
  Phone, 
  ChevronLeft, 
  Loader2
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
  image?: string
  email?: string
  phone?: string
  department?: string
  order_index: number
  is_active: boolean
}

// Hardcoded ministry team configs for navigation and meta
const ministryTeams = [
  { name: 'Worship Team', slug: 'worship-team', description: 'Leading our congregation in worship through music and praise', icon: '🎵' },
  { name: 'Media & Technology', slug: 'media-technology', description: 'Managing audio, video, and livestream for our services', icon: '🎥' },
  { name: 'Ushering Team', slug: 'ushering-team', description: 'Welcoming and guiding visitors and members during services', icon: '🚪' },
  { name: 'Security Team', slug: 'security-team', description: 'Ensuring a safe environment for all attendees', icon: '🛡️' },
  { name: 'Intercessory Prayer Team', slug: 'intercessory-prayer-team', description: 'Praying for the church, community, and world', icon: '🙏' }
]



export default function DepartmentTeamPage({ params }: { params: Promise<{ department: string }> }) {
  const resolvedParams = use(params)
  const { department } = resolvedParams
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const teamConfig = ministryTeams.find(t => t.slug === department)
  if (!teamConfig) {
    notFound()
  }

  const fetchTeamMembers = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const url = new URL(`${baseUrl}/api/teams`)
      url.searchParams.append('department', teamConfig!.name)
      url.searchParams.append('limit', '50')
      url.searchParams.append('is_active', 'true')

      const res = await fetch(url, { cache: 'no-store' })
      
      if (!res.ok) {
        throw new Error('Failed to fetch team members')
      }
      
      const data = await res.json()
      if (data.teamMembers) {
        // Sort by order_index
        const sorted = [...data.teamMembers].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        setTeamMembers(sorted)
      }
    } catch (err) {
      console.error('Error fetching team members:', err)
      setError('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }, [department, teamConfig!])

  useEffect(() => {
    fetchTeamMembers()
  }, [department, fetchTeamMembers])



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/about/team" 
            className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition duration-300"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Link>
          <div className="text-4xl md:text-5xl font-bold mb-4 flex items-center">
            <span className="text-5xl mr-4">{teamConfig!.icon}</span>
            {teamConfig!.name}
          </div>
          <p className="text-xl text-gray-200 max-w-3xl">
            {teamConfig!.description}
          </p>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Team Members</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Meet the dedicated individuals serving in the {teamConfig!.name}
              </p>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <span className="ml-2 text-gray-600">Loading team members...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">{error}</p>
                <p className="text-gray-600">No team members found for this department yet.</p>
              </div>
            )}

            {!loading && !error && teamMembers.length === 0 && (
              <div className="text-center py-20">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-500 mb-2">No Team Members Yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  This team is growing. Check back soon for leadership and members.
                </p>
              </div>
            )}

            {!loading && teamMembers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <div 
                    key={member.id || index.toString()} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
                  >
                    <div className="bg-gray-200 h-64 flex items-center justify-center relative overflow-hidden">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <div className="w-32 h-32 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl font-bold text-accent">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-accent font-medium mb-4">{member.role}</p>
                      
                      {member.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {member.bio}
                        </p>
                      )}
                      
                      <div className="space-y-2 pt-4 border-t">
                        {member.email && (
                          <a 
                            href={`mailto:${member.email}`}
                            className="flex items-center text-sm text-gray-600 hover:text-accent transition duration-300"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {member.email}
                          </a>
                        )}
                        {member.phone && (
                          <a 
                            href={`tel:${member.phone}`}
                            className="flex items-center text-sm text-gray-600 hover:text-accent transition duration-300"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {member.phone}
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
    </div>
  )
}

