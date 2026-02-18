/**
 * Database Connection Module
 * 
 * NOTE: This module has been modified to NOT connect to MongoDB.
 * The database connection has been removed from the system.
 * 
 * All API routes now use in-memory storage instead of MongoDB.
 * For production, consider using file-based storage or other
 * persistent storage solutions.
 */

// Database is disabled - always return null
// This makes the system work without MongoDB

/**
 * Connect to database - always returns null (no connection)
 * This effectively disables the database connection
 */
async function connectDB(): Promise<null> {
  console.log('Database connection disabled - using in-memory storage instead')
  return null
}

/**
 * Check if database connection is available and ready
 * Always returns false since database is disabled
 */
export async function isDatabaseConnected(): Promise<boolean> {
  return false
}

/**
 * Check if mongoose connection is fully ready
 * Always returns false since database is disabled
 */
export function isConnectionReady(): boolean {
  return false
}

/**
 * Check if we're currently connecting to the database
 * Always returns false since database is disabled
 */
export function isConnecting(): boolean {
  return false
}

/**
 * Get database connection status
 * Always indicates disconnected state
 */
export function getDatabaseStatus(): { 
  connected: boolean 
  ready: boolean
  connecting: boolean
  retries: number 
  state: string
} {
  return {
    connected: false,
    ready: false,
    connecting: false,
    retries: 0,
    state: 'disconnected'
  }
}

export default connectDB

