import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getContactFormRouting } from '@/lib/mailboxes';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const routing = getContactFormRouting(subject);
    const adminEmail = [routing.mailbox];
    const staffInbox = routing.mailbox;

    const safeName = escapeHtml(String(name).trim());
    const safeEmail = escapeHtml(String(email).trim());
    const safePhone = escapeHtml(String(phone ?? '').trim());
    const safeMessage = escapeHtml(String(message).trim());
    const topicLabel = escapeHtml(routing.topicLabel);
    const isPrayerTopic = String(subject).trim().toLowerCase() === 'prayer';

    // Admin notification — includes every field the visitor submitted
    const adminSubject = `New Contact Form [${routing.teamLabel}]: ${routing.topicLabel}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone || 'Not provided'}</p>
        <p><strong>Topic:</strong> ${topicLabel}${isPrayerTopic ? ' <span style="color:#b45309;">(Prayer Request)</span>' : ''}</p>
        <p><strong>Form value:</strong> ${escapeHtml(String(subject))}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${safeMessage}</p>
        <hr>
        <p><em>Submitted via El-Shaddai Revival Centre website</em></p>
      </div>
    `;

    const replySubject = 'Thank You for Contacting El-Shaddai Revival Centre';
    const visitorEmail = String(email).trim();
    const replyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Reaching Out!</h2>
        <p>Dear ${safeName},</p>
        <p>Thank you for contacting El-Shaddai Revival Centre. We have received your message and one of our team members will respond within 24-48 hours.</p>
        <p><strong>Your message was delivered to our team at:</strong> ${staffInbox} (${routing.teamLabel})</p>
        <p><strong>Topic:</strong> ${topicLabel}</p>
        <hr>
        <p>If you need immediate assistance, please call us at +233 55 401 7121.</p>
        <p>Blessings,<br>El-Shaddai Revival Centre Team</p>
      </div>
    `;

    console.log(
      `Contact form: topic=${subject} → staff To: ${staffInbox}, auto-reply To: ${visitorEmail}`
    );

    // 1) Full submission to the team inbox only (info or prayer, based on topic).
    // 2) Thank-you / confirmation only to the visitor's email.
    const adminSent = await sendEmail({
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
      replyTo: visitorEmail,
    });
    const replySent = await sendEmail({
      to: [visitorEmail],
      subject: replySubject,
      html: replyHtml,
    });

    console.log('Staff notification sent:', adminSent, 'Visitor reply sent:', replySent);

    if (!adminSent || !replySent) {
      console.error('Email send failures - staff:', !adminSent, 'visitor:', !replySent, 'Check SMTP config');
      return NextResponse.json(
        {
          success: false,
          error:
            'We could not send your message by email. Check the server email (SMTP) settings, then try again—or contact us directly by email or phone.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, message: 'Message sent.' });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
