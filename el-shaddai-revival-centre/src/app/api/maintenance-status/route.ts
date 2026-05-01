import { NextResponse } from 'next/server'
import { isDbConfigured, settingsDb } from '@/lib/db'
import { getMaintenanceMode, parseMaintenanceEnabled, parseMaintenanceMessage, setMaintenanceMode } from '@/lib/maintenance'

export const dynamic = 'force-dynamic'

const noStoreHeaders = { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }

export async function GET() {
  try {
    if (isDbConfigured()) {
      const dbSettings = await settingsDb.get('site_settings')
      const raw = dbSettings?.value
      if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
        const value = raw as Record<string, unknown>
        const enabled = parseMaintenanceEnabled(value.maintenanceMode)
        const message = parseMaintenanceMessage(value.maintenanceMessage)
        setMaintenanceMode(enabled, message)
        return NextResponse.json(
          {
            success: true,
            maintenanceMode: enabled,
            maintenanceMessage: message
          },
          { headers: noStoreHeaders }
        )
      }

      setMaintenanceMode(false, '')
      return NextResponse.json(
        { success: true, maintenanceMode: false, maintenanceMessage: '' },
        { headers: noStoreHeaders }
      )
    }
  } catch (error) {
    console.error('[Maintenance Status API] Failed to read from database:', error)
    if (isDbConfigured()) {
      return NextResponse.json(
        { success: true, maintenanceMode: false, maintenanceMessage: '' },
        { headers: noStoreHeaders }
      )
    }
  }

  const fallback = getMaintenanceMode()
  return NextResponse.json(
    {
      success: true,
      maintenanceMode: fallback.enabled,
      maintenanceMessage: fallback.message || ''
    },
    { headers: noStoreHeaders }
  )
}
