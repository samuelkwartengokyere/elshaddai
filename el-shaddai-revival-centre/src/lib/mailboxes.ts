/**
 * Team inbox addresses (who receives notifications). Set in .env.local to match your three Gmail boxes.
 *
 * Sending still uses ONE SMTP login (SMTP_USER + SMTP_PASS + EMAIL_FROM). Gmail delivers to
 * info@, prayer@, and payment@ by putting them in the "To" / "Bcc" fields — you do not need
 * three separate SMTP passwords unless each mailbox is its own Google account with no
 * "Send mail as" setup; then use the account that is allowed to send as / to those addresses.
 */
export const mailboxes = {
  info: process.env.CONTACT_INFO_EMAIL?.trim() || 'info.copelshaddai@gmail.com',
  prayer: process.env.CONTACT_PRAYER_EMAIL?.trim() || 'prayerrequest.copelshaddai@gmail.com',
  payments: process.env.CONTACT_PAYMENTS_EMAIL?.trim() || 'payment.copelshaddai@gmail.com',
} as const;

/** Form `<select value="…">` → label shown in notification emails. */
export const CONTACT_TOPIC_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  prayer: 'Prayer Request',
  counseling: 'Counseling Request',
  events: 'Events & Ministries',
  outreach: 'Outreach & Benevolence',
  technical: 'Technical Support',
  other: 'Other',
};

export type ContactFormRoute = {
  /** Staff inbox that receives the full submission */
  mailbox: string;
  teamLabel: string;
  /** Human-readable topic from the dropdown */
  topicLabel: string;
};

/**
 * Contact form: route by subject. Prayer requests → prayer inbox; all other topics → info inbox.
 * (Payments mailbox is used by the donations API, not this form.)
 */
export function getContactFormRouting(subject: string): ContactFormRoute {
  const key = String(subject).trim().toLowerCase();
  const topicLabel = CONTACT_TOPIC_LABELS[key] ?? String(subject).trim();
  if (key === 'prayer') {
    return {
      mailbox: mailboxes.prayer,
      teamLabel: 'Prayer Team',
      topicLabel,
    };
  }
  return {
    mailbox: mailboxes.info,
    teamLabel: 'General Team',
    topicLabel,
  };
}
