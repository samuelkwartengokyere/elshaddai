'use client'

import WebsiteAnalyticsPanel from '@/components/admin/WebsiteAnalyticsPanel'

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-600 mt-1">
          First-party website traffic: page views by day and popular paths (UTC).
        </p>
      </div>

      <WebsiteAnalyticsPanel showCardHeading={false} />

      <p className="mt-4 text-xs text-gray-500">
        Admin routes, financial reports area, and maintenance page are excluded from counts.
      </p>
    </div>
  )
}
