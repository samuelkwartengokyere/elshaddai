import Hero from '@/components/Hero'
import LiveStream from '@/components/LiveStream'
import SermonCard from '@/components/SermonCard'
import TestimonyCard from '@/components/TestimonyCard'
import Link from 'next/link'
import { Calendar, Users, Heart, HeartHandshake, Quote } from 'lucide-react'

// Mock data - replace with actual API calls
const recentSermons = [
  {
    id: '1',
    title: 'The Power of Faith',
    speaker: 'Pastor John Smith',
    date: '2024-01-14',
    description: 'Exploring how faith transforms our lives and circumstances',
    thumbnail: '/images/sermon1.jpg',
    audioUrl: '/sermons/sermon1.mp3',
    duration: '45:30',
    series: 'Living by Faith'
  },
  {
    id: '2',
    title: 'Love Thy Neighbor',
    speaker: 'Pastor Sarah Johnson',
    date: '2024-01-07',
    description: 'Practical ways to show Christ\'s love in our community',
    thumbnail: '/images/sermon2.jpg',
    audioUrl: '/sermons/sermon2.mp3',
    duration: '38:45',
    series: 'Community Matters'
  },
  {
    id: '3',
    title: 'Hope in Hard Times',
    speaker: 'Guest Speaker David Lee',
    date: '2023-12-31',
    description: 'Finding hope and peace during life\'s challenges',
    thumbnail: '/images/sermon3.jpg',
    audioUrl: '/sermons/sermon3.mp3',
    duration: '52:15',
    series: 'New Year, New Hope'
  }
]

const upcomingEvents = [
  { title: 'Men\'s Breakfast', date: 'Jan 20', time: '8:00 AM' },
  { title: 'Youth Night', date: 'Jan 21', time: '6:00 PM' },
  { title: 'Prayer Meeting', date: 'Jan 24', time: '7:00 PM' },
  { title: 'Community Outreach', date: 'Jan 27', time: '9:00 AM' },
]

const featuredTestimonies = [
  {
    id: '1',
    name: 'Mary Akosua',
    title: 'From Terminal Diagnosis to Complete Healing',
    content: 'I came to El-Shaddai Revival Centre during one of the most challenging periods of my life. Doctors had diagnosed me with a terminal illness and had given me just months to live. Through the prayers of the prayer camp, I experienced a miraculous healing. Today, I stand here completely healed by the power of God.',
    category: 'healing' as const,
    date: '2024-01-10',
    location: 'Nabewam',
  },
  {
    id: '2',
    name: 'John Mensah',
    title: 'Financial Breakthrough After Years of Struggle',
    content: 'For over five years, my family and I struggled financially. I had lost my job and was about to lose our home. Through the prayers at the prayer camp, everything changed. Within weeks, I got a better job and debts were paid. God blessed us abundantly beyond what we could imagine.',
    category: 'breakthrough' as const,
    date: '2024-01-08',
    location: 'Kumasi',
  },
  {
    id: '3',
    name: 'Sarah Adomako',
    title: 'Finding Christ at the Prayer Camp',
    content: 'I grew up in a Christian home but never truly understood what it meant to have a personal relationship with Jesus. When I attended the prayer camp at El-Shaddai, something changed in my heart. That was three years ago and today I serve in the worship team.',
    category: 'salvation' as const,
    date: '2024-01-05',
    location: 'Accra',
  }
]

export default function Home() {

  return (
    <>
      <Hero />
      
      {/* Live Stream Section */}
      <LiveStream />
      
      {/* Recent Sermons */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold mb-2">Recent Sermons</h2>
              <p className="text-gray-600">Messages to inspire and guide you</p>
            </div>
            <Link 
              href="/sermons" 
              className="text-accent hover:text-red-600 font-medium flex items-center"
            >
              View All Sermons →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentSermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonies Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold mb-2">Testimonies</h2>
              <p className="text-gray-300">Real stories of God's power at our Prayer Camp</p>
            </div>
            <Link 
              href="/testimonies" 
              className="hidden md:inline-flex items-center bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
            >
              View All Testimonies
              <Quote className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTestimonies.map((testimony) => (
              <TestimonyCard key={testimony.id} testimony={testimony} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link 
              href="/testimonies" 
              className="inline-flex items-center bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
            >
              View All Testimonies
              <Quote className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Upcoming Events */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-10">Upcoming Events</h2>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="card text-center hover:shadow-xl transition duration-300">
                <Calendar className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <div className="text-gray-600">
                  <p className="font-medium">{event.date}</p>
                  <p>{event.time}</p>
                </div>
                <button className="mt-4 text-accent hover:text-red-600 font-medium">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Counselling Services Section */}
      <section className="py-16 bg-gradient-to-r from-[#003399] to-[#002266] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <HeartHandshake className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Counselling Services</h2>
            <p className="text-xl text-gray-200 mb-8">
              Professional counselling rooted in faith. Book online sessions via Teams
              or visit our centre for in-person support.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-yellow-400">★</span> Experienced Counsellors
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-yellow-400">★</span> Online & In-Person
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-yellow-400">★</span> Faith-Based Approach
              </div>
            </div>
            <Link
              href="/counselling"
              className="inline-block bg-[#C8102E] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#A00D25] transition duration-300"
            >
              Book a Session
            </Link>
          </div>
        </div>
      </section>
      
      {/* Quick Links */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Join a Group</h3>
              <p className="mb-6">Connect with others in community groups</p>
              <Link
                href="/groups"
                className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition duration-300"
              >
                Find a Group
              </Link>
            </div>
            
            <div className="text-center p-8">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Plan Your Visit</h3>
              <p className="mb-6">We'd love to welcome you this Sunday</p>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition duration-300">
                Visit Info
              </button>
            </div>
            
            <div className="text-center p-8">
              <Heart className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Give Online</h3>
              <p className="mb-6">Support our ministry and missions</p>
              <Link 
                href="/give" 
                className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition duration-300"
              >
                Give Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}