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

