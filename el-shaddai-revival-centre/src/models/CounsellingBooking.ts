import mongoose, { Schema, Document } from 'mongoose';

export interface ICounsellingBooking extends Document {
  id: string;
  createdAt: Date;
  userId?: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  
  // Booking Details
  counsellorId: string;
  bookingType: 'online' | 'in-person';
  preferredDate: string;
  preferredTime: string;
  sessionDuration: number;
  topic: string;
  notes?: string;
  
  // Microsoft Teams Details (for online)
  teamsMeetingUrl?: string;
  teamsJoinUrl?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmationNumber?: string;
  
  // Payment (if applicable)
  isPaid: boolean;
  paymentAmount?: number;
  paymentReference?: string;
}

const CounsellingBookingSchema = new Schema<ICounsellingBooking>({
  id: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: String },
  
  // Personal Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String },
  
  // Booking Details
  counsellorId: { type: String, required: true },
  bookingType: { type: String, enum: ['online', 'in-person'], required: true },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  sessionDuration: { type: Number, required: true },
  topic: { type: String, required: true },
  notes: { type: String },
  
  // Microsoft Teams Details (for online)
  teamsMeetingUrl: { type: String },
  teamsJoinUrl: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  confirmationNumber: { type: String, required: true, unique: true },
  
  // Payment (if applicable)
  isPaid: { type: Boolean, default: false },
  paymentAmount: { type: Number },
  paymentReference: { type: String },
});

// Index for faster queries
CounsellingBookingSchema.index({ confirmationNumber: 1 });
CounsellingBookingSchema.index({ email: 1 });
CounsellingBookingSchema.index({ counsellorId: 1 });
CounsellingBookingSchema.index({ status: 1 });

const CounsellingBooking = mongoose.models.CounsellingBooking || 
  mongoose.model<ICounsellingBooking>('CounsellingBooking', CounsellingBookingSchema);

export default CounsellingBooking;

