import Hero from '@/components/Hero'
import LiveStream from '@/components/LiveStream'
import HomeContent from '@/components/HomeContent'

interface Sermon {
  _id?: string
  id?: string
  title: string
  speaker: string
  date: string
  description?: string
  thumbnail?: string
  audioUrl?: string
  videoUrl?: string
  duration?: string
  series?: string
  biblePassage?: string
  tags?: string[]
}

interface Event {
  _id?: string
  title: string
  description?: string
  date: string
  time: string
  location: string
  category?: string
  recurring?: boolean
}

interface Testimony {
  _id?: string
  id?: string
  name: string
  title: string
  content: string
  category: 'healing' | 'breakthrough' | 'salvation' | 'deliverance' | 'provision' | 'other'
  date: string
  location: string
  image?: string
  isFeatured?: boolean
}

async function getRecentSermons(): Promise<Sermon[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/sermons?limit=3`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.sermons || []
  } catch {
    return []
  }
}

async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/events?limit=4&upcoming=true`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.events || []
  } catch {
    return []
  }
}

async function getFeaturedTestimonies(): Promise<Testimony[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/testimonies?limit=3&featured=true`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.testimonies || []
  } catch {
    return []
  }
}

export default async function Home() {
  const [recentSermons, upcomingEvents, featuredTestimonies] = await Promise.all([
    getRecentSermons(),
    getUpcomingEvents(),
    getFeaturedTestimonies()
  ])

  // Fallback mock data if API fails
  const mockSermons: Sermon[] = [
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

  const mockEvents = [
    { title: 'Men\'s Breakfast', date: 'Jan 20', time: '8:00 AM' },
    { title: 'Youth Night', date: 'Jan 21', time: '6:00 PM' },
    { title: 'Prayer Meeting', date: 'Jan 24', time: '7:00 PM' },
    { title: 'Community Outreach', date: 'Jan 27', time: '9:00 AM' },
  ]

  const mockTestimonies: Testimony[] = []

  // Use API data if available, otherwise fall back to mock data
  const displaySermons = recentSermons.length > 0 ? recentSermons : mockSermons
  const displayEvents = upcomingEvents.length > 0 
    ? upcomingEvents.map(e => ({
        title: e.title,
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: e.time
      }))
    : mockEvents
  const displayTestimonies = featuredTestimonies.length > 0 ? featuredTestimonies : mockTestimonies

  return (
    <>
      <Hero />
      <LiveStream />
      <HomeContent 
        sermons={displaySermons} 
        events={displayEvents} 
        testimonies={displayTestimonies} 
      />
    </>
  )
}

