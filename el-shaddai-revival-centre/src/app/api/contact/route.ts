import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    const { name, email, phone, subject, message } = formData;
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Determine recipient based on subject
    const isPrayerRequest = subject === 'prayer';
    const adminEmail = isPrayerRequest ? ['prayerrequest.copelshaddai@gmail.com'] : ['info.copelshaddai@gmail.com'];
    const recipientLabel = isPrayerRequest ? 'Prayer Team' : 'General Team';

    // Admin notification email
    const adminSubject = `New Contact Form [${recipientLabel}]: ${subject}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}${isPrayerRequest ? ' (PRIORITY: Prayer Request)' : ''}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
        <hr>
        <p><em>Submitted via El-Shaddai Revival Centre website</em></p>
      </div>
    `;

    console.log(`Contact form submission - Prayer: ${isPrayerRequest}, to: ${adminEmail.join(',')}`);
    
    const adminSent = await sendEmail({
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
    });
    console.log('Admin email sent:', adminSent);

    // Auto-reply to user
    const replySubject = 'Thank You for Contacting El-Shaddai Revival Centre';
    const replyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Reaching Out!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for contacting El-Shaddai Revival Centre. We have received your message and one of our team members will respond within 24-48 hours.</p>
        <p><strong>Your message has been forwarded to:</strong> ${isPrayerRequest ? 'prayerrequest.copelshaddai@gmail.com (Prayer Team)' : 'info.copelshaddai@gmail.com (General Team)'}</p>
        <hr>
        <p>If you need immediate assistance, please call us at +233 50 123 4567.</p>
        <p>Blessings,<br>El-Shaddai Revival Centre Team</p>
      </div>
    `;

    const replySent = await sendEmail({
      to: [email],
      subject: replySubject,
      html: replyHtml,
    });
    console.log('Reply email sent:', replySent);

    // Non-blocking emails - always success for form, log issues
    if (!adminSent || !replySent) {
      console.error('Email send failures - admin:', !adminSent, 'reply:', !replySent, 'Check SMTP config');
    }

    return NextResponse.json({ success: true, message: 'Message received! Check console for email logs.' });

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

