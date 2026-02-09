import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

// Check if we're in build/static generation time
const isBuildTime = process.env.NODE_ENV === 'production' && 
                    !process.env.MONGODB_URI

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
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

const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds

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

  // If already connected, return cached connection
  if (cached.conn) {
    return cached.conn
  }

  // Check if we should retry
  const now = Date.now()
  const shouldRetry = 
    cached.connectionRetries < MAX_RETRIES &&
    (now - cached.lastConnectionAttempt > RETRY_DELAY)

  // If there's an existing promise and we're not retrying, return it
  if (cached.promise && !shouldRetry) {
    try {
      cached.conn = await cached.promise
      return cached.conn
    } catch (e) {
      // Promise failed, will retry below
      console.warn('Previous connection attempt failed, retrying...')
      cached.promise = null
    }
  }

  // New connection attempt
  if (shouldRetry || !cached.promise) {
    cached.lastConnectionAttempt = now
    cached.connectionRetries++
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    console.log(`Attempting database connection (attempt ${cached.connectionRetries}/${MAX_RETRIES})...`)
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Database connected successfully')
      cached.connectionRetries = 0 // Reset retries on success
      return mongoose
    }).catch((error) => {
      console.error(`❌ Database connection failed (attempt ${cached.connectionRetries}/${MAX_RETRIES}):`, error.message)
      
      // Don't throw on last retry - return null instead
      if (cached.connectionRetries >= MAX_RETRIES) {
        console.error('Max connection retries reached, continuing without database')
        return null as any
      }
      
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    
    // If we've exhausted retries, return null gracefully
    if (cached.connectionRetries >= MAX_RETRIES) {
      console.warn('Database connection unavailable, continuing in degraded mode')
      return null
    }
    
    // Rethrow for caller to handle
    throw e
  }

  return cached.conn
}

/**
 * Check if database connection is available
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    const conn = await connectDB()
    return conn !== null
  } catch {
    return false
  }
}

/**
 * Get database connection status
 */
export function getDatabaseStatus(): { connected: boolean; retries: number } {
  return {
    connected: cached.conn !== null,
    retries: cached.connectionRetries
  }
}

export default connectDB

