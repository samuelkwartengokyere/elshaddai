import DonationForm from '@/components/DonationForm'
import { Target, DollarSign, HeartHandshake } from 'lucide-react'

export default function GivePage() {
  const givingOptions = [
    {
      title: 'Tithes',
      description: 'Regular giving to support church operations',
      icon: DollarSign,
      suggested: '10% of income'
    },
    {
      title: 'Missions',
      description: 'Supporting missionaries and outreach programs',
      icon: Target,
      suggested: 'Any amount'
    },
    {
      title: 'Benevolence',
      description: 'Helping those in need within our community',
      icon: HeartHandshake,
      suggested: 'Any amount'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Generous Giving</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            "Each of you should give what you have decided in your heart to give, 
            not reluctantly or under compulsion, for God loves a cheerful giver." 
            <span className="block mt-2 text-lg">- 2 Corinthians 9:7</span>
          </p>
        </div>

        {/* Giving Options */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Ways to Give</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {givingOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <div key={index} className="card text-center hover:shadow-xl transition duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent bg-opacity-10 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <div className="text-sm text-accent font-medium">
                    Suggested: {option.suggested}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Donation Form */}
        <DonationForm />

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Other Ways to Give</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3">In Person</h3>
              <p className="text-gray-600 mb-2">• Offering baskets during services</p>
              <p className="text-gray-600 mb-2">• Dropbox in church lobby</p>
              <p className="text-gray-600">• Church office hours: Mon-Fri 9AM-5PM</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">By Mail</h3>
              <p className="text-gray-600">
                Send checks payable to:<br />
                <strong>El-Shaddai Revival Centre</strong><br />
                Nabewam, Ghana
              </p>
            </div>
          </div>
        </div>

        {/* Financial Transparency */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            We are committed to financial integrity and transparency. 
            <a href="/financial-report" className="text-accent hover:text-red-600 ml-2 font-medium">
              View our annual financial report →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}