'use client'

import WebsiteAnalyticsPanel from '@/components/admin/WebsiteAnalyticsPanel'

export default function AdminAnalyticsPage() {
  return (
    <div className="-m-6 min-h-[calc(100vh-4rem)] bg-[#eef0f3] p-6">
      <WebsiteAnalyticsPanel showCardHeading={false} />
    </div>
  )
}
