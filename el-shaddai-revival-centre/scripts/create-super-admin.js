/**
 * Script to create the initial super admin user
 * Run with: node scripts/create-super-admin.js
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elshaddai-revival'

// Admin schema (inline to avoid import issues)
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'editor'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
})

// Create model if it doesn't exist
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema)

async function createSuperAdmin() {
  const email = process.argv[2] || 'admin@elshaddai.com'
  const password = process.argv[3] || 'admin123'
  const name = process.argv[4] || 'Super Admin'

  console.log('Connecting to MongoDB...')
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    })
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() })
    
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists`)
      
      // Update to super_admin if not already
      if (existingAdmin.role !== 'super_admin') {
        existingAdmin.role = 'super_admin'
        existingAdmin.isActive = true
        await existingAdmin.save()
        console.log('Updated existing admin to super_admin role')
      }
      
      await mongoose.disconnect()
      return
    }

    // Create new super admin
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const superAdmin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'super_admin',
      isActive: true
    })

    await superAdmin.save()
    console.log(`Super admin created successfully!`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Role: super_admin`)
    
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

createSuperAdmin()

