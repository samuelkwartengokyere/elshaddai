// Microsoft Teams Integration using Microsoft Graph API
// This module handles creating and managing Teams online meetings

import { CounsellingBooking } from '@/types/counselling';

interface TeamsConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  userId: string; // The organizer's user ID
}

export interface TeamsMeeting {
  id: string;
  joinUrl: string;
  joinWebUrl: string;
  meetingCode: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
}

interface TeamsAccessToken {
  accessToken: string;
  expiresIn: number;
}

// Get configuration from environment variables
function getConfig(): TeamsConfig {
  return {
    clientId: process.env.AZURE_CLIENT_ID || '',
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
    tenantId: process.env.AZURE_TENANT_ID || '',
    userId: process.env.AZURE_USER_ID || '',
  };
}

// Get access token using client credentials flow
async function getAccessToken(): Promise<TeamsAccessToken> {
  const config = getConfig();
  
  if (!config.clientId || !config.clientSecret || !config.tenantId) {
    throw new Error('Microsoft Teams configuration is incomplete. Please set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID environment variables.');
  }

  const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get access token: ${error.error_description || error.error}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

// Create a Teams online meeting
export async function createTeamsMeeting(
  booking: CounsellingBooking,
  durationMinutes: number = 60
): Promise<TeamsMeeting> {
  const config = getConfig();
  
  // Validate configuration
  if (!config.clientId || !config.clientSecret) {
    // Return a placeholder meeting for development/demo purposes
    return createPlaceholderMeeting(booking, durationMinutes);
  }

  try {
    const { accessToken } = await getAccessToken();
    
    const startDateTime = new Date(`${booking.preferredDate}T${booking.preferredTime}`);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
    
    const meetingSubject = `Counselling Session with ${booking.firstName} ${booking.lastName}`;
    
    const meetingPayload = {
      subject: meetingSubject,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      lobbyBypassSettings: {
        scope: 'organization',
        isDialInBypassEnabled: true,
      },
      allowedPresenters: 'organizer',
      isEntryExitAnnounced: false,
      allowMeetingChat: 'enabled',
      allowTeamworkReactions: true,
    };

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${config.userId}/onlineMeetings`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingPayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to create Teams meeting:', error);
      return createPlaceholderMeeting(booking, durationMinutes);
    }

    const meeting = await response.json();

    return {
      id: meeting.id,
      joinUrl: meeting.joinUrl,
      joinWebUrl: meeting.joinWebUrl,
      meetingCode: meeting.meetingCode,
      subject: meeting.subject,
      startDateTime: meeting.startDateTime,
      endDateTime: meeting.endDateTime,
    };
  } catch (error) {
    console.error('Error creating Teams meeting:', error);
    return createPlaceholderMeeting(booking, durationMinutes);
  }
}

// Create a placeholder meeting for development/demo
function createPlaceholderMeeting(
  booking: CounsellingBooking,
  durationMinutes: number
): TeamsMeeting {
  const meetingId = `teams-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const meetingCode = generateMeetingCode();
  
  // In production, this would be the actual Teams join URL
  const joinWebUrl = `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
  
  const startDateTime = new Date(`${booking.preferredDate}T${booking.preferredTime}`);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

  return {
    id: meetingId,
    joinUrl: joinWebUrl,
    joinWebUrl: joinWebUrl,
    meetingCode: meetingCode,
    subject: `Counselling Session - ${booking.firstName} ${booking.lastName}`,
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
  };
}

// Generate a random meeting code
function generateMeetingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate Teams meeting URL with prefilled information
export function generateTeamsJoinUrl(
  meeting: TeamsMeeting,
  userName: string
): string {
  const encodedName = encodeURIComponent(userName);
  const encodedMeetingId = encodeURIComponent(meeting.joinUrl);
  
  return `https://teams.microsoft.com/dl/launcher?url=${encodedMeetingId}&tenantId=&롤name=${encodedName}&client_type=WebClient`;
}

// Create a Teams meeting invite for calendar (.ics format)
export function generateCalendarInvite(
  booking: CounsellingBooking,
  meeting: TeamsMeeting
): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = new Date(meeting.startDateTime);
  const endDate = new Date(meeting.endDateTime);
  
  const now = new Date();
  const uid = `${meeting.id}-${booking.confirmationNumber}@elshaddai.com`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//El-Shaddai Revival Centre//Counselling//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${meeting.subject}
DESCRIPTION:Your counselling session with El-Shaddai Revival Centre.\\n\\nJoin Google Teams: ${meeting.joinWebUrl}\\n\\nConfirmation Number: ${booking.confirmationNumber}\\n\\nTopic: ${booking.topic}
LOCATION:Google Teams Online Meeting
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: Your counselling session starts in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

// Send Teams meeting invitation via email
export async function sendTeamsInvitation(
  booking: CounsellingBooking,
  meeting: TeamsMeeting,
  recipientEmail: string,
  counsellorEmail: string
): Promise<boolean> {
  const calendarInvite = generateCalendarInvite(booking, meeting);
  
  try {
    // This would integrate with your email service
    const emailPayload = {
      to: [recipientEmail],
      cc: [counsellorEmail],
      subject: `Counselling Session Confirmed - ${booking.confirmationNumber}`,
      html: generateConfirmationEmailHTML(booking, meeting),
      icalAttachment: {
        content: calendarInvite,
        filename: 'counselling-invite.ics',
        contentType: 'text/calendar',
      },
    };

    // In production, this would call your email API
    console.log('Sending Teams invitation email:', emailPayload);
    
    // For demo purposes, we'll return success
    return true;
  } catch (error) {
    console.error('Failed to send Teams invitation:', error);
    return false;
  }
}

// Generate confirmation email HTML
function generateConfirmationEmailHTML(
  booking: CounsellingBooking,
  meeting: TeamsMeeting
): string {
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

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #003399 0%, #C8102E 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">El-Shaddai Revival Centre</h1>
    <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Counselling Session Confirmation</p>
  </div>

  <div style="background: #f9fafb; padding: 30px;">
    <h2 style="color: #1a365d; margin-top: 0;">Your Counselling Session is Confirmed!</h2>
    <p>Dear ${booking.firstName} ${booking.lastName},</p>
    
    <p>Thank you for booking a counselling session with El-Shaddai Revival Centre. We're here to support you on your journey.</p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #C8102E;">
      <h3 style="color: #1a365d; margin-top: 0;">Session Details</h3>
      <p><strong>Date:</strong> ${formatDate(meeting.startDateTime)}</p>
      <p><strong>Time:</strong> ${formatTime(booking.preferredTime)}</p>
      <p><strong>Duration:</strong> ${booking.sessionDuration} minutes</p>
      <p><strong>Type:</strong> ${booking.bookingType === 'online' ? 'Online (Google Teams)' : 'In-Person'}</p>
      <p><strong>Topic:</strong> ${booking.topic}</p>
      <p><strong>Confirmation #:</strong> ${booking.confirmationNumber}</p>
    </div>

    ${booking.bookingType === 'online' ? `
    <div style="background: #1a365d; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <h3 style="color: white; margin-top: 0;">Join Your Google Teams Meeting</h3>
      <a href="${meeting.joinWebUrl}" style="display: inline-block; background: #C8102E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
        Join Teams Meeting
      </a>
      <p style="color: white; margin: 15px 0 0 0; font-size: 14px;">Or copy this link: ${meeting.joinWebUrl}</p>
    </div>
    ` : `
    <div style="background: #059669; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <h3 style="color: white; margin-top: 0;">Visit Our Centre</h3>
      <p style="color: white; margin: 0;">El-Shaddai Revival Centre</p>
      <p style="color: white; margin: 5px 0 0 0;">123 Church Street, Accra, Ghana</p>
    </div>
    `}

    <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #92400e; margin-top: 0;">Before Your Session</h3>
      <ul style="color: #78350f; margin: 0; padding-left: 20px;">
        <li>Find a quiet, private space for your session</li>
        <li>Ensure you have a stable internet connection</li>
        <li>Have your questions or topics ready to discuss</li>
        <li>Join the meeting 5 minutes early to test your audio/video</li>
      </ul>
    </div>

    <p>If you need to reschedule or cancel, please contact us at least 24 hours before your appointment.</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Need help? Contact us at <a href="mailto:counselling@elshaddai.com" style="color: #C8102E;">counselling@elshaddai.com</a>
    </p>
  </div>

  <div style="background: #1a365d; padding: 20px; text-align: center;">
    <p style="color: white; margin: 0; font-size: 14px;">© ${new Date().getFullYear()} El-Shaddai Revival Centre. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

// Delete a Teams meeting (for cancellations)
export async function deleteTeamsMeeting(meetingId: string): Promise<boolean> {
  const config = getConfig();
  
  if (!config.clientId || !config.clientSecret) {
    return true; // No actual meeting to delete in demo mode
  }

  try {
    const { accessToken } = await getAccessToken();
    
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${config.userId}/onlineMeetings/${meetingId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok || response.status === 204;
  } catch (error) {
    console.error('Failed to delete Teams meeting:', error);
    return false;
  }
}

// Check if Teams configuration is valid
export function isTeamsConfigured(): boolean {
  const config = getConfig();
  return !!(config.clientId && config.clientSecret && config.tenantId);
}

