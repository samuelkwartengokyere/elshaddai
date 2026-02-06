'use client'
import { useState, useEffect } from 'react'
import { Play, Users, MessageCircle } from 'lucide-react'

export default function LiveStream() {
  const [isLive, setIsLive] = useState(false)
  const [viewers, setViewers] = useState(245)

  // Simulate checking if live stream is active
  useEffect(() => {
    const checkLiveStatus = () => {
      // Replace with actual API call to check stream status
      const now = new Date()
      const day = now.getDay()
      const hour = now.getHours()
      
      // Example: Live on Sundays 9am-12pm
      setIsLive(day === 0 && hour >= 9 && hour < 12)
    }
    
    checkLiveStatus()
    const interval = setInterval(checkLiveStatus, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4">Join Our Live Stream</h2>
          <p className="text-xl text-gray-600">Worship with us, wherever you are</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
            {/* Video Player */}
            <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
              <iframe
                src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
                title="Live Stream"
              />
            </div>

            {/* Stream Info */}
            <div className="bg-white p-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className={`px-4 py-2 rounded-full ${isLive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${isLive ? 'bg-red-600 animate-pulse' : 'bg-gray-400'}`} />
                      {isLive ? 'LIVE NOW' : 'OFFLINE'}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    {viewers} watching
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button className="btn-primary flex items-center">
                    <Play className="h-5 w-5 mr-2" />
                    {isLive ? 'Join Live' : 'Next Service'}
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat
                  </button>
                </div>
              </div>

              {/* Service Times */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4">Service Times</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-primary">Sunday</h4>
                    <p className="text-gray-600">9:00 AM & 11:00 AM</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-primary">Wednesday</h4>
                    <p className="text-gray-600">7:00 PM Bible Study</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-primary">Friday</h4>
                    <p className="text-gray-600">7:00 PM Youth Service</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}