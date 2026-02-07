// Email Service using Nodemailer
// This module handles sending confirmation emails and notifications

import { CounsellingBooking } from '@/types/counselling';
import { TeamsMeeting } from './teams';
import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
}

interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

interface EmailPayload {
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

// Get email configuration from environment variables
function getConfig(): EmailConfig {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'counselling@elshaddai.com',
    fromName: process.env.EMAIL_FROM_NAME || 'El-Shaddai Revival Centre',
  };
}

// Create a transporter for sending emails
function createTransporter() {
  const config = getConfig();
  
  // For demo purposes, if no SMTP config is provided, use a mock
  if (!config.user || !config.pass) {
    console.log('Email configuration incomplete. Using mock email service.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
}

// Send a single email
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const config = getConfig();
  
  // For demo/development without SMTP config
  if (!config.user || !config.pass) {
    console.log('📧 [MOCK EMAIL] Sending email:');
    console.log(`   To: ${payload.to.join(', ')}`);
    console.log(`   Subject: ${payload.subject}`);
    return true;
  }

  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 [MOCK EMAIL] No transporter available:');
      console.log(`   To: ${payload.to.join(', ')}`);
      console.log(`   Subject: ${payload.subject}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.from}>`,
      to: payload.to.join(', '),
      cc: payload.cc?.join(', '),
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments,
    });

    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

// Send booking confirmation email to the user
export async function sendBookingConfirmation(
  booking: CounsellingBooking,
  meeting?: TeamsMeeting
): Promise<boolean> {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const subject = `Counselling Session Confirmed - ${booking.confirmationNumber}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Counselling Session Confirmation</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #003399 0%, #C8102E 100%); padding: 40px 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">El-Shaddai Revival Centre</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Counselling Session Confirmation</p>
  </div>

  <!-- Content -->
  <div style="background: #ffffff; padding: 40px 30px;">
    <h2 style="color: #003399; margin-top: 0; font-size: 24px;">Your Session is Confirmed! 🎉</h2>
    <p style="font-size: 16px; color: #555;">Dear ${booking.firstName} ${booking.lastName},</p>
    
    <p style="font-size: 16px; color: #555;">Thank you for booking a counselling session with El-Shaddai Revival Centre. We're excited to support you on your journey of faith and personal growth.</p>
    
    <!-- Session Details Card -->
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 5px solid #C8102E;">
      <h3 style="color: #003399; margin-top: 0; margin-bottom: 20px; font-size: 18px;">📋 Session Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📅 Date:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${formatDate(booking.preferredDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px;">🕐 Time:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${formatTime(booking.preferredTime)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px;">⏱️ Duration:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${booking.sessionDuration} minutes</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px;">💻 Type:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${booking.bookingType === 'online' ? 'Online (Google Teams)' : 'In-Person Visit'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📝 Topic:</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${booking.topic}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px;">🔖 Confirmation #:</td>
          <td style="padding: 8px 0; color: #C8102E; font-weight: 700; font-size: 14px;">${booking.confirmationNumber}</td>
        </tr>
      </table>
    </div>

    ${booking.bookingType === 'online' && meeting ? `
    <!-- Google Teams Section -->
    <div style="background: linear-gradient(135deg, #003399 0%, #0044cc 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
      <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">📹 Join Your Google Teams Meeting</h3>
      <a href="${meeting.joinWebUrl}" style="display: inline-block; background: #C8102E; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; margin-top: 10px; box-shadow: 0 4px 6px rgba(200, 16, 46, 0.3);">
        🎥 Join Meeting Now
      </a>
      <p style="color: rgba(255,255,255,0.9); margin: 20px 0 0 0; font-size: 13px;">
        Or copy this link:<br>
        <span style="background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 4px; word-break: break-all;">${meeting.joinWebUrl}</span>
      </p>
    </div>
    ` : `
    <!-- In-Person Section -->
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
      <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">📍 Visit Our Centre</h3>
      <p style="color: white; margin: 0 0 10px 0; font-size: 16px;">El-Shaddai Revival Centre</p>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Nabewam, Ghana</p>
      <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 13px;">Please arrive 10 minutes early for check-in</p>
    </div>
    `}

    <!-- Preparation Tips -->
    <div style="background: #fffbeb; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #fcd34d;">
      <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">💡 Before Your Session</h3>
      <ul style="color: #78350f; margin: 0; padding-left: 20px; font-size: 14px;">
        <li style="margin-bottom: 8px;">Find a quiet, private space where you won't be disturbed</li>
        <li style="margin-bottom: 8px;">${booking.bookingType === 'online' ? 'Test your internet connection and ensure your camera/microphone work' : 'Bring any relevant documents or notes you want to discuss'}</li>
        <li style="margin-bottom: 8px;">Write down any questions or topics you'd like to cover</li>
        <li style="margin-bottom: 8px;">Come with an open heart and mind ready for growth</li>
        <li>Join 5 minutes early to settle in and prepare</li>
      </ul>
    </div>

    <!-- Need to Reschedule -->
    <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
      <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Need to change your appointment?</p>
      <p style="color: #003399; margin: 0; font-size: 14px;">
        Email us at <a href="mailto:counselling@elshaddai.com" style="color: #C8102E; font-weight: 600;">counselling@elshaddai.com</a> 
        or call <strong>+233 50 123 4567</strong> at least 24 hours before your session.
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background: #003399; padding: 30px; text-align: center;">
    <p style="color: rgba(255,255,255,0.8); margin: 0 0 10px 0; font-size: 14px;">© ${new Date().getFullYear()} El-Shaddai Revival Centre. All rights reserved.</p>
    <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">
      "Cast all your anxiety on Him because He cares for you." - 1 Peter 5:7
    </p>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: [booking.email],
    subject,
    html,
  });
}

// Send notification email to the counsellor
export async function sendCounsellorNotification(
  booking: CounsellingBooking,
  counsellorEmail: string,
  counsellorName: string
): Promise<boolean> {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const subject = `New Counselling Booking - ${booking.confirmationNumber}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #003399 0%, #C8102E 100%); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">El-Shaddai Revival Centre</h1>
    <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">New Counselling Booking</p>
  </div>

  <div style="background: #f9fafb; padding: 30px;">
    <h2 style="color: #003399; margin-top: 0;">New Appointment Booked</h2>
    <p>Dear ${counsellorName},</p>
    
    <p>A new counselling session has been booked with you. Here are the details:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C8102E;">
      <h3 style="color: #003399; margin-top: 0;">Client Information</h3>
      <p><strong>Name:</strong> ${booking.firstName} ${booking.lastName}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Phone:</strong> ${booking.phone}</p>
      <p><strong>Location:</strong> ${booking.city ? `${booking.city}, ` : ''}${booking.country}</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #003399;">
      <h3 style="color: #003399; margin-top: 0;">Session Details</h3>
      <p><strong>Date:</strong> ${formatDate(booking.preferredDate)}</p>
      <p><strong>Time:</strong> ${formatTime(booking.preferredTime)}</p>
      <p><strong>Duration:</strong> ${booking.sessionDuration} minutes</p>
      <p><strong>Type:</strong> ${booking.bookingType === 'online' ? 'Online (Google Teams)' : 'In-Person'}</p>
      <p><strong>Topic:</strong> ${booking.topic}</p>
      <p><strong>Confirmation #:</strong> ${booking.confirmationNumber}</p>
    </div>

    ${booking.notes ? `
    <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #92400e; margin-top: 0;">Additional Notes</h3>
      <p style="margin: 0;">${booking.notes}</p>
    </div>
    ` : ''}

    <p style="margin-top: 30px;">Please log in to your dashboard to confirm this appointment.</p>
  </div>

  <div style="background: #1a365d; padding: 20px; text-align: center;">
    <p style="color: white; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} El-Shaddai Revival Centre</p>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: [counsellorEmail],
    subject,
    html,
  });
}

// Send cancellation email
export async function sendCancellationEmail(
  booking: CounsellingBooking
): Promise<boolean> {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const subject = `Counselling Session Cancelled - ${booking.confirmationNumber}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #C8102E; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Session Cancelled</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px;">
    <h2 style="color: #003399;">Booking Cancelled</h2>
    <p>Dear ${booking.firstName} ${booking.lastName},</p>
    
    <p>Your counselling session scheduled for ${formatDate(booking.preferredDate)} at ${formatTime(booking.preferredTime)} has been cancelled.</p>
    
    <p><strong>Confirmation Number:</strong> ${booking.confirmationNumber}</p>
    
    <p>If you would like to reschedule, please visit our booking page or contact us.</p>
    
    <p>We hope to serve you again soon!</p>
  </div>

  <div style="background: #1a365d; padding: 20px; text-align: center;">
    <p style="color: white; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} El-Shaddai Revival Centre</p>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: [booking.email],
    subject,
    html,
  });
}

// Check if email is configured
export function isEmailConfigured(): boolean {
  const config = getConfig();
  return !!(config.user && config.pass);
}

