import { Metadata } from 'next';
import CounsellingBooking from '@/components/CounsellingBooking';

export const metadata: Metadata = {
  title: 'Counselling Services | El-Shaddai Revival Centre',
  description: 'Book a counselling session with our experienced pastoral and professional counsellors. Available online via Teams or in-person.',
};

export default function CounsellingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#003399] to-[#002266] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Counselling Services</h1>
            <p className="text-xl text-gray-200 mb-8">
              Professional counselling rooted in faith, available both online and in-person
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
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
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <CounsellingBooking initialCountry="GH" />
        </div>
      </section>

      {/* Information Section */}
      <section className="py-12 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#003399] mb-8 text-center">
              About Our Counselling Services
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Online Counselling */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#003399] rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Online Counselling</h3>
                    <p className="text-sm text-gray-600">Via Microsoft Teams</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Convenient sessions from anywhere
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Secure and private video calls
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Perfect for international members
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Sessions available in multiple time zones
                  </li>
                </ul>
              </div>

              {/* In-Person Counselling */}
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">In-Person Counselling</h3>
                    <p className="text-sm text-gray-600">Visit Our Centre in Ghana</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Face-to-face sessions with your counsellor
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Private and comfortable setting
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Located in Accra, Ghana
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    Ideal for intensive sessions
                  </li>
                </ul>
              </div>
            </div>

            {/* Topics We Cover */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-[#003399] mb-4 text-center">
                Topics We Cover
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'Marriage & Family',
                  'Pre-Marital',
                  'Grief & Loss',
                  'Anxiety & Stress',
                  'Depression',
                  'Faith & Spiritual',
                  'Career Guidance',
                  'Relationship Issues',
                  'Addiction Recovery',
                  'Child & Adolescent',
                ].map((topic) => (
                  <span
                    key={topic}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-12 text-center bg-[#003399] text-white rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4">Need Immediate Help?</h3>
              <p className="mb-4 text-gray-200">
                If you're experiencing a crisis, please reach out immediately:
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div>
                  <p className="text-sm text-gray-300">Email</p>
                  <p className="font-semibold">counselling@elshaddai.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Phone</p>
                  <p className="font-semibold">+233 50 123 4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

