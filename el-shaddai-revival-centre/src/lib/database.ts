import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

// Check if we're in build/static generation time
const isBuildTime = process.env.NODE_ENV === 'production' && 
                    !process.env.MONGODB_URI

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose | null> | null
  lastConnectionAttempt: number
  connectionRetries: number
}

declare global {
  var mongoose: MongooseCache | undefined
}

const cached: MongooseCache = global.mongoose || { 
  conn: null, 
  promise: null,
  lastConnectionAttempt: 0,
  connectionRetries: 0
}

if (!global.mongoose) {
  global.mongoose = cached
}

const MAX_RETRIES = 5
const RETRY_DELAY = 3000 // 3 seconds between retries

/**
 * Connect to MongoDB with improved retry logic and timeouts
 */
async function connectDB(): Promise<typeof mongoose | null> {
  // Skip database connection during build time
  if (isBuildTime) {
    console.warn('MONGODB_URI not defined, skipping database connection (build mode)')
    return null
  }

  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not defined, skipping database connection')
    return null
  }

  // If already connected and ready, return cached connection
  if (cached.conn && (mongoose.connection.readyState as number) === 1) {
    console.log('Using existing database connection')
    return cached.conn
  }

  // Check if we should retry based on delay
  const now = Date.now()
  const timeSinceLastAttempt = now - cached.lastConnectionAttempt
  const shouldRetry = 
    cached.connectionRetries < MAX_RETRIES &&
    (timeSinceLastAttempt > RETRY_DELAY || cached.connectionRetries === 0)

  // If there's an existing promise and we recently tried, return it
  if (cached.promise && !shouldRetry) {
    try {
      cached.conn = await cached.promise
      // Verify the connection is actually ready
      if ((mongoose.connection.readyState as number) === 1) {
        return cached.conn
      }
      console.warn('Connection promise resolved but not in ready state')
    } catch (e) {
      // Promise failed, will retry below
      console.warn('Previous connection attempt failed, retrying...')
      cached.promise = null
    }
  }

  // Start new connection attempt
  cached.lastConnectionAttempt = now
  cached.connectionRetries++
  
  const opts = {
    bufferCommands: true, // Enable buffering to queue operations
    serverSelectionTimeoutMS: 15000, // 15 seconds for server selection
    socketTimeoutMS: 60000, // 60 seconds
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
  }

  console.log(`Attempting database connection (attempt ${cached.connectionRetries}/${MAX_RETRIES})...`)
  console.log(`MongoDB URI: ${MONGODB_URI.substring(0, 30)}...`) // Log partial URI for debugging
  
  cached.promise = mongoose.connect(MONGODB_URI!, opts)
    .then((mongoose) => {
      console.log('✅ Database connected successfully')
      console.log(`Connection state: ${mongoose.connection.readyState}, Host: ${mongoose.connection.host}`)
      cached.connectionRetries = 0 // Reset retries on success
      return mongoose
    })
    .catch((error: Error) => {
      console.error(`❌ Database connection failed (attempt ${cached.connectionRetries}/${MAX_RETRIES}):`, error.message)
      console.error('Error details:', error)
      
      // Don't throw on last retry - return null instead
      if (cached.connectionRetries >= MAX_RETRIES) {
        console.error('Max connection retries reached, continuing without database')
        return null
      }
      
      // Return null to allow graceful degradation
      return null
    })

  try {
    cached.conn = await cached.promise
    // Verify connection is ready after waiting for promise
    if (cached.conn && (mongoose.connection.readyState as number) === 1) {
      return cached.conn
    }
    console.warn('Database connected but not in ready state')
    return cached.conn
  } catch (e) {
    cached.promise = null
    
    // If we've exhausted retries, return null gracefully
    if (cached.connectionRetries >= MAX_RETRIES) {
      console.warn('Database connection unavailable, continuing in degraded mode')
      return null
    }
    
    // Return null to allow graceful degradation instead of throwing
    return null
  }
}

/**
 * Check if database connection is available and ready
 * Returns true only if connection is established and ready
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    // First check if mongoose thinks we're connected
    if ((mongoose.connection.readyState as number) === 1) {
      return true
    }
    
    // Try to connect
    const conn = await connectDB()
    return conn !== null && (mongoose.connection.readyState as number) === 1
  } catch {
    return false
  }
}

/**
 * Check if mongoose connection is fully ready (readyState === 1)
 * This is needed when bufferCommands = false
 */
export function isConnectionReady(): boolean {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  // Use type assertion to satisfy TypeScript
  return (mongoose.connection.readyState as number) === 1
}

/**
 * Check if we're currently connecting to the database
 */
export function isConnecting(): boolean {
  return mongoose.connection.readyState === 2
}

/**
 * Get database connection status
 */
export function getDatabaseStatus(): { 
  connected: boolean 
  ready: boolean
  connecting: boolean
  retries: number 
  state: string
} {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const stateIndex = Math.min(Math.max(mongoose.connection.readyState, 0), 3)
  return {
    connected: cached.conn !== null,
    ready: isConnectionReady(),
    connecting: isConnecting(),
    retries: cached.connectionRetries,
    state: states[stateIndex] || 'unknown'
  }
}

export default connectDB

