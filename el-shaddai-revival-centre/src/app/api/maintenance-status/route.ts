import { NextResponse } from 'next/server'
import { isDbConfigured, settingsDb } from '@/lib/db'
import { getMaintenanceMode } from '@/lib/maintenance'

type MaintenancePayload = {
  maintenanceMode?: boolean
  maintenanceMessage?: string
}

export async function GET() {
  try {
    if (isDbConfigured()) {
      const dbSettings = await settingsDb.get('site_settings')
      const value = (dbSettings?.value || {}) as MaintenancePayload

      if (typeof value.maintenanceMode === 'boolean' || typeof value.maintenanceMessage === 'string') {
        return NextResponse.json({
          success: true,
          maintenanceMode: Boolean(value.maintenanceMode),
          maintenanceMessage: value.maintenanceMessage || ''
        })
      }
    }
  } catch (error) {
    console.error('[Maintenance Status API] Failed to read from database:', error)
  }

  const fallback = getMaintenanceMode()
  return NextResponse.json({
    success: true,
    maintenanceMode: fallback.enabled,
    maintenanceMessage: fallback.message || ''
  })
}
