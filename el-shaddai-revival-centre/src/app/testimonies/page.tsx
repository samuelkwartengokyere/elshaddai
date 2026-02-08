'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Quote, Calendar, User, ChevronRight, Heart, Cross, Sparkles, Star } from 'lucide-react'
import TestimonyCard from '@/components/TestimonyCard'

// Mock data - replace with actual API calls
const allTestimonies = [
  {
    id: '1',
    name: 'Mary Akosua',
    title: 'From Terminal Diagnosis to Complete Healing',
    content: `I came to El-Shaddai Revival Centre during one of the most challenging periods of my life. Doctors had diagnosed me with a terminal illness and had given me just months to live. My family and I were devastated.

Through the prayers of the prayer camp and the anointing that flows in this place, I experienced a miraculous healing. After several weeks of intense prayer and fasting, I went back for tests and the doctors could not find any trace of the disease.

Today, I stand here completely healed by the power of God. I want to encourage anyone going through a difficult season - God is still in the business of performing miracles. Don't lose hope!`,
    category: 'healing' as const,
    date: '2024-01-10',
    location: 'Nabewam',
  },
  {
    id: '2',
    name: 'John Mensah',
    title: 'Financial Breakthrough After Years of Struggle',
    content: `For over five years, my family and I struggled financially. I had lost my job, we were about to lose our home, and I didn't know where our next meal would come from. Depression had set in, and I was ready to give up.

A brother from El-Shaddai invited me to the prayer camp. I was skeptical at first, but I decided to give God a chance. During the night of intense prayer, I felt a peace I hadn't experienced in years.

Within weeks, things began to change. I got a better job, debts were paid, and my family was restored. God didn't just restore what was lost - He blessed us abundantly. My business now employs 15 people.`,
    category: 'breakthrough' as const,
    date: '2024-01-08',
    location: 'Kumasi',
  },
  {
    id: '3',
    name: 'Sarah Adomako',
    title: 'Finding Christ at the Prayer Camp',
    content: `I grew up in a Christian home but never truly understood what it meant to have a personal relationship with Jesus. I was living a double life - church on Sundays, sinning all week.

When I attended the prayer camp at El-Shaddai, something changed in my heart during the altar call. The presence of God was so real, I could feel it. I wept as I surrendered my life to Christ.

That was three years ago. Today, I serve in the worship team and have led many of my friends to Christ. My life has completely transformed. The joy I have now cannot be compared to anything in this world.`,
    category: 'salvation' as const,
    date: '2024-01-05',
    location: 'Accra',
  },
  {
    id: '4',
    name: 'David Osei',
    title: 'My Wife Returned Home',
    content: `My marriage was falling apart. My wife had left with our children, and I had accepted that our family was destroyed. I was living in bitterness and anger.

The men of El-Shaddai took me under their wing and began to pray for me and my marriage. They taught me about forgiveness and becoming the husband God wanted me to be.

After six months of prayer and transformation in my own life, my wife noticed the change. She came back, and today our marriage is stronger than ever. We now serve together in the couples ministry.`,
    category: 'other' as const,
    date: '2024-01-03',
    location: 'Nabewam',
  },
  {
    id: '5',
    name: 'Grace Nyarko',
    title: 'Healed of Chronic Pain',
    content: `For fifteen years, I suffered from chronic back pain that made it impossible to live a normal life. I tried every medical treatment available and even traveled abroad seeking help, but nothing worked.

Someone invited me to El-Shaddai's prayer camp. I came in a wheelchair because I couldn't walk. On the third night of the camp, as the pastors were praying for the sick, I felt heat go through my body.

I stood up and walked without assistance for the first time in years. The doctors who had treated me were amazed. Today, I am completely pain-free and serve in the visitation ministry.`,
    category: 'healing' as const,
    date: '2023-12-28',
    location: 'Sunyani',
  },
  {
    id: '6',
    name: 'Michael Agyeman',
    title: 'Business Restoration',
    content: `My business was failing, and I was on the brink of bankruptcy. I had borrowed money from everyone and still couldn't keep afloat. Suicidal thoughts began to creep in.

The prayer camp at El-Shaddai was my last hope. During the intercessory prayer sessions, the prophets spoke directly to my situation. They told me God was about to restore everything that had been lost.

Within three months, my business not only recovered but expanded beyond what I could have imagined. I was able to pay all my debts and even start a foundation to help others in similar situations.`,
    category: 'breakthrough' as const,
    date: '2023-12-25',
    location: 'Cape Coast',
  },
]

const categories = [
  { name: 'All', icon: Star, color: 'bg-gray-100 text-gray-800' },
  { name: 'Healing', icon: Heart, color: 'bg-green-100 text-green-800' },
  { name: 'Salvation', icon: Cross, color: 'bg-blue-100 text-blue-800' },
  { name: 'Breakthrough', icon: Sparkles, color: 'bg-purple-100 text-purple-800' },
  { name: 'Other', icon: User, color: 'bg-yellow-100 text-yellow-800' },
]

export default function TestimoniesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTestimonies = allTestimonies.filter((testimony) => {
    const matchesCategory = selectedCategory === 'All' || 
      testimony.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch = testimony.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimony.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimony.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const featuredTestimony = allTestimonies[0]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Quote className="h-16 w-16 mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Testimonies</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Real stories from real people who have experienced God's power 
            at El-Shaddai Revival Centre's Prayer Camp
          </p>
        </motion.div>
      </section>

      {/* Featured Testimony */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">Featured Testimony</h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-8" />
            
            <div className="max-w-4xl mx-auto">
              <TestimonyCard testimony={featuredTestimony} featured={true} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row gap-6 items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => {
                const Icon = category.icon || Star
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 flex items-center gap-2 ${
                      selectedCategory === category.name
                        ? 'bg-accent text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-accent hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </button>
                )
              })}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search testimonies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-accent focus:outline-none transition duration-300"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonies Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {selectedCategory === 'All' ? 'All Testimonies' : `${selectedCategory} Testimonies`}
              </h2>
              <p className="text-gray-600">{filteredTestimonies.length} stories found</p>
            </div>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            layout
          >
            <AnimatePresence>
              {filteredTestimonies.slice(1).map((testimony, index) => (
                <motion.div
                  key={testimony.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TestimonyCard testimony={testimony} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredTestimonies.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Quote className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">No testimonies found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Share Your Testimony CTA */}
      <section className="py-16 bg-gradient-to-r from-accent to-red-600 text-white">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Share Your Testimony</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Have you experienced God's power? We'd love to hear your story and share it 
            with others to encourage them in their faith journey.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-white text-accent px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition duration-300"
          >
            Submit Your Testimony
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </section>
    </main>
  )
}

