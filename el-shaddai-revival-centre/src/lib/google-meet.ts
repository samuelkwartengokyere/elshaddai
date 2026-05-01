// Google Meet for counselling sessions.
// Option A: Set BOOKING_GOOGLE_MEET_FIXED_URL to a stable Meet link (simplest).
// Option B: Google Calendar API — enable Calendar API, share a calendar with the service account,
// and set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID.

import { randomUUID } from 'crypto';
import { SignJWT, importPKCS8 } from 'jose';
import { CounsellingBooking } from '@/types/counselling';

export interface CounsellingVideoMeeting {
  id: string;
  joinUrl: string;
  joinWebUrl: string;
  meetingCode: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
}

function getDefaultTimeZone(): string {
  return process.env.BOOKING_GOOGLE_MEET_TIMEZONE?.trim() || 'Africa/Accra';
}

function isCalendarConfigured(): boolean {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const key = process.env.GOOGLE_PRIVATE_KEY?.trim();
  const cal = process.env.GOOGLE_CALENDAR_ID?.trim();
  return !!(email && key && cal);
}

/** True when a Meet link will be produced (fixed URL or Calendar integration). */
export function isGoogleMeetConfigured(): boolean {
  return !!(process.env.BOOKING_GOOGLE_MEET_FIXED_URL?.trim()) || isCalendarConfigured();
}

function randomMeetCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function buildSyntheticMeeting(
  booking: CounsellingBooking,
  joinWebUrl: string,
  durationMinutes: number
): CounsellingVideoMeeting {
  const startDateTime = new Date(`${booking.preferredDate}T${booking.preferredTime}`);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
  const id = booking.id || `meet-${Date.now()}-${randomUUID().slice(0, 8)}`;

  return {
    id,
    joinUrl: joinWebUrl,
    joinWebUrl,
    meetingCode: randomMeetCode(),
    subject: `Counselling — ${booking.firstName} ${booking.lastName}`,
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
  };
}

async function getServiceAccountAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  let privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim();
  if (!clientEmail || !privateKey) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY');
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const scope = 'https://www.googleapis.com/auth/calendar.events';
  const now = Math.floor(Date.now() / 1000);

  const jwt = await new SignJWT({ scope })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(clientEmail)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(await importPKCS8(privateKey, 'RS256'));

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google OAuth token exchange failed: ${err}`);
  }

  const data = (await tokenRes.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('No access_token from Google');
  return data.access_token;
}

async function createViaCalendarApi(
  booking: CounsellingBooking,
  durationMinutes: number
): Promise<CounsellingVideoMeeting> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID not set');

  const accessToken = await getServiceAccountAccessToken();
  const timeZone = getDefaultTimeZone();
  const start = new Date(`${booking.preferredDate}T${booking.preferredTime}`);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const requestId = randomUUID().replace(/-/g, '').slice(0, 32);

  const summary = `Counselling — ${booking.firstName} ${booking.lastName}`;
  const description = [
    `Confirmation: ${booking.confirmationNumber || 'N/A'}`,
    `Topic: ${booking.topic}`,
    booking.notes ? `Notes: ${booking.notes}` : '',
    `Participant: ${booking.email}`,
  ]
    .filter(Boolean)
    .join('\n');

  const payload = {
    summary,
    description,
    start: { dateTime: start.toISOString(), timeZone },
    end: { dateTime: end.toISOString(), timeZone },
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[Google Meet] Calendar events.insert failed:', body);
    throw new Error('Calendar API failed to create event');
  }

  const evt = (await res.json()) as {
    id?: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: { uri?: string }[] };
  };

  let join =
    evt.hangoutLink ||
    evt.conferenceData?.entryPoints?.find((e) => e.uri?.startsWith('https://meet.google.com'))?.uri;

  if (!join) {
    throw new Error('Calendar event created but no Meet hangoutLink returned');
  }

  return {
    id: evt.id || requestId,
    joinUrl: join,
    joinWebUrl: join,
    meetingCode: randomMeetCode(),
    subject: summary,
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
  };
}

/**
 * Create a Google Meet link for an online counselling booking.
 * Priority: BOOKING_GOOGLE_MEET_FIXED_URL → Calendar API → optional fallback/demo URL env.
 */
export async function createGoogleMeetSession(
  booking: CounsellingBooking,
  durationMinutes: number = 60
): Promise<CounsellingVideoMeeting> {
  const fixed = process.env.BOOKING_GOOGLE_MEET_FIXED_URL?.trim();
  if (fixed) {
    return buildSyntheticMeeting(booking, fixed, durationMinutes);
  }

  if (isCalendarConfigured()) {
    try {
      return await createViaCalendarApi(booking, durationMinutes);
    } catch (e) {
      console.error('[Google Meet] Calendar API error:', e);
    }
  }

  const fallback = process.env.BOOKING_GOOGLE_MEET_FALLBACK_URL?.trim();
  if (fallback) {
    return buildSyntheticMeeting(booking, fallback, durationMinutes);
  }

  console.warn(
    '[Google Meet] Configure BOOKING_GOOGLE_MEET_FIXED_URL, Google Calendar + service account (see src/lib/google-meet.ts), or BOOKING_GOOGLE_MEET_FALLBACK_URL. No Meet link generated.'
  );
  return buildSyntheticMeeting(booking, '', durationMinutes);
}

/** @deprecated Prefer deleteGoogleMeetEvent */
export async function deleteTeamsMeeting(_meetingId: string): Promise<boolean> {
  return deleteGoogleMeetEvent(_meetingId);
}

export async function deleteGoogleMeetEvent(meetingOrEventId: string): Promise<boolean> {
  if (!isCalendarConfigured() || !meetingOrEventId) return true;

  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!calendarId) return true;

  try {
    const accessToken = await getServiceAccountAccessToken();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(meetingOrEventId)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok || res.status === 204;
  } catch (e) {
    console.error('[Google Meet] Failed to delete calendar event:', e);
    return false;
  }
}

export function generateCalendarInvite(
  booking: CounsellingBooking,
  meeting: CounsellingVideoMeeting
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
DESCRIPTION:Your counselling session with El-Shaddai Revival Centre.\\n\\nJoin Google Meet: ${meeting.joinWebUrl}\\n\\nConfirmation Number: ${booking.confirmationNumber}\\n\\nTopic: ${booking.topic}
LOCATION:Google Meet
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
