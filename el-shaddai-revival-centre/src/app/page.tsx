import Hero from '@/components/Hero'
import LiveStream from '@/components/LiveStream'
import SermonCard from '@/components/SermonCard'
import Link from 'next/link'
import { Calendar, Users, Heart } from 'lucide-react'

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
      
      {/* Quick Links */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Join a Group</h3>
              <p className="mb-6">Connect with others in community groups</p>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition duration-300">
                Find a Group
              </button>
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