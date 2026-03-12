import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    const { name, email, phone, type, isPrivate, request: prayerRequest, answeredPrayer } = formData;
    
    if (!name || !email || !prayerRequest) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const requestType = answeredPrayer ? 'Answered Prayer Praise Report' : `${type.charAt(0).toUpperCase() + type.slice(1)} Prayer Request`;
    const privacy = isPrivate ? 'PRIVATE - Prayer Team Only' : 'Public (can be shared)';

    // Prayer team notification
    const prayerSubject = `${requestType}: ${name}`;
    const prayerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${requestType}</h2>
        ${answeredPrayer ? `
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">PRAISE REPORT! 🙌</h3>
            <p><strong>Praise God!</strong> ${name} has an answered prayer to share:</p>
          </div>
        ` : ''}
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Privacy:</strong> <strong>${privacy}</strong></p>
        <p><strong>Request:</strong></p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; white-space: pre-wrap;">
          ${prayerRequest}
        </div>
        <hr>
        <p style="color: #007bff; font-size: 16px;"><strong>Prayer Team Action:</strong></p>
        <ul style="color: #007bff;">
          <li>✅ Pray immediately</li>
          <li>📧 Reply to sender within 24hrs</li>
          <li>🙏 Add to prayer chain if appropriate</li>
        </ul>
      </div>
    `;

    const prayerSent = await sendEmail({
      to: ['prayerrequest.copelshaddai@gmail.com'],
      subject: prayerSubject,
      html: prayerHtml,
    });

    // Auto-reply to user
    const replySubject = answeredPrayer ? 'Thank You for Your Praise Report!' : 'Prayer Request Received';
    const replyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${answeredPrayer ? 'Hallelujah! Praise Report Received 🙌' : 'Prayer Request Received'}</h2>
        <p>Dear ${name},</p>
        ${answeredPrayer ? `
          <p>Thank you for sharing your wonderful testimony of God\\'s faithfulness! 
          Our prayer team rejoices with you and will share this praise report to encourage others.</p>
        ` : `
          <p>Thank you for entrusting us with your prayer request. Our prayer team has received it 
          and will begin praying for you immediately - 24/7 coverage!</p>
          <p>Your request has been sent to prayerrequest.copelshaddai@gmail.com</p>
        `}
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #155724;">
            "The prayer of a righteous person is powerful and effective." 
          </p>
          <p style="margin: 0; font-style: italic; color: #155724;">— James 5:16</p>
        </div>
        <p>We are praying for God\\'s perfect will in your situation.</p>
        <p style="margin-top: 30px;">
          Blessings,<br>
          <strong>El-Shaddai Revival Centre Prayer Team</strong>
        </p>
      </div>
    `;

    const replySent = await sendEmail({
      to: [email],
      subject: replySubject,
      html: replyHtml,
    });

    if (prayerSent && replySent) {
      return NextResponse.json({ success: true, message: 'Prayer request sent successfully' });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to send prayer request' }, { status: 500 });
    }

  } catch (error) {
    console.error('Prayer API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

