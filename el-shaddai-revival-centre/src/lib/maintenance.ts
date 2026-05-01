// Shared maintenance mode state for both middleware and API
// This module is imported by both the middleware and settings API

const globalForMaintenance = globalThis as unknown as {
  maintenanceMode: boolean
  maintenanceMessage: string
}

if (globalForMaintenance.maintenanceMode === undefined) {
  globalForMaintenance.maintenanceMode = false
  globalForMaintenance.maintenanceMessage = ''
}

/** Read persisted flags safely ( avoids Boolean("false") === true ). */
export function parseMaintenanceEnabled(raw: unknown): boolean {
  if (raw === true) return true
  if (raw === false || raw === undefined || raw === null) return false
  if (typeof raw === 'string') {
    const s = raw.trim().toLowerCase()
    if (s === 'true' || s === '1' || s === 'yes') return true
    return false
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw === 1
  return false
}

export function parseMaintenanceMessage(raw: unknown): string {
  return typeof raw === 'string' ? raw : ''
}

export function getMaintenanceMode(): { enabled: boolean; message: string } {
  return {
    enabled: globalForMaintenance.maintenanceMode,
    message: globalForMaintenance.maintenanceMessage
  }
}

export function setMaintenanceMode(enabled: boolean, message: string = '') {
  globalForMaintenance.maintenanceMode = enabled
  globalForMaintenance.maintenanceMessage = message
  console.log(`[Maintenance Mode] Set to: ${enabled}, Message: ${message}`)
}

