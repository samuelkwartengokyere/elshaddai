import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

// Check if we're in build/static generation time
const isBuildTime = process.env.NODE_ENV === 'production' && 
                    !process.env.MONGODB_URI

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

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

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('Database connection failed:', e)
    throw e
  }

  return cached.conn
}

export default connectDB

