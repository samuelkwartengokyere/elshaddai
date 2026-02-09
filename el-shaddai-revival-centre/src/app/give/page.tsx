import InternationalDonationForm from '@/components/InternationalDonationForm'
import { Target, DollarSign, HeartHandshake, Globe, CreditCard, Smartphone, Building2, Mail } from 'lucide-react'

export const metadata = {
  title: 'Give | El-Shaddai Revival Centre',
  description: 'Support our ministry through generous giving. Multiple payment options available for donors worldwide.',
}

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

  const paymentMethods = [
    {
      icon: CreditCard,
      title: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Amex and more',
      regions: 'Global'
    },
    {
      icon: Smartphone,
      title: 'Mobile Money',
      description: 'M-Pesa, Airtel Money, Vodafone Cash, MTN Mobile Money',
      regions: 'Ghana, Nigeria, Kenya'
    },
    {
      icon: Building2,
      title: 'Bank Transfer',
      description: 'Direct bank transfer or mobile banking',
      regions: 'Global'
    },
    {
      icon: Globe,
      title: 'International Transfer',
      description: 'SWIFT/IBAN for donors outside Africa',
      regions: 'US, UK, Europe, Canada, Australia'
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

        {/* Global Giving Info */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
            <div className="flex items-center justify-center mb-6">
              <Globe className="h-12 w-12 mr-4" />
              <h2 className="text-3xl font-bold">Give from Anywhere in the World</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paymentMethods.map((method, index) => {
                const Icon = method.icon
                return (
                  <div key={index} className="text-center">
                    <Icon className="h-10 w-10 mx-auto mb-3 opacity-90" />
                    <h3 className="font-bold mb-1">{method.title}</h3>
                    <p className="text-sm opacity-80 mb-1">{method.description}</p>
                    <p className="text-xs opacity-60">{method.regions}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Supported Currencies */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            We accept donations in multiple currencies:
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['USD ($)', 'GHS (₵)', 'NGN (₦)', 'GBP (£)', 'EUR (€)', 'CAD (C$)', 'AUD (A$)', 'KES (KSh)', 'ZAR (R)'].map((currency, index) => (
              <span key={index} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200">
                {currency}
              </span>
            ))}
          </div>
        </div>

        {/* Giving Options */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Ways to Give</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {givingOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <div key={index} className="card text-center hover:shadow-xl transition duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-10 rounded-full mb-4">
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

        {/* International Donation Form */}
        <InternationalDonationForm />

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Other Ways to Give</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                In Person
              </h3>
              <p className="text-gray-600 mb-2">• Offering baskets during services</p>
              <p className="text-gray-600 mb-2">• Dropbox in church lobby</p>
              <p className="text-gray-600">• Church office hours: Mon-Fri 9AM-5PM</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                By Mail
              </h3>
              <p className="text-gray-600">
                Send checks payable to:<br />
                <strong>El-Shaddai Revival Centre</strong><br />
                Nabewam, Ghana
              </p>
            </div>
          </div>
          
          {/* International Bank Details */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              International Bank Transfer (SWIFT)
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Ghana Cedis (GHS) Account</h4>
                  <p className="text-gray-600 text-sm">
                    Bank: Ghana Commercial Bank<br />
                    Account Name: El-Shaddai Revival Centre<br />
                    Account Number: 1234567890<br />
                    Branch: Nabewam
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">US Dollar (USD) Account</h4>
                  <p className="text-gray-600 text-sm">
                    Correspondent Bank: Citibank NA, New York<br />
                    SWIFT: CITIUS33<br />
                    Beneficiary Account: 1234567890<br />
                    Reference: Your Name + El-Shaddai
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Please email finance@elshaddai.org with your transfer details once completed.
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
