import Hero from '@/components/Hero'
import LiveStream from '@/components/LiveStream'
import HomeContent from '@/components/HomeContent'

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
  const [upcomingEvents, featuredTestimonies] = await Promise.all([
    getUpcomingEvents(),
    getFeaturedTestimonies()
  ])

  const mockTestimonies: Testimony[] = []

  const displayEvents = upcomingEvents.map((e) => ({
    title: e.title,
    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: e.time,
  }))
  const displayTestimonies = featuredTestimonies.length > 0 ? featuredTestimonies : mockTestimonies

  return (
    <>
      <Hero />
      <LiveStream />
      <HomeContent 
        events={displayEvents} 
        testimonies={displayTestimonies} 
      />
    </>
  )
}

