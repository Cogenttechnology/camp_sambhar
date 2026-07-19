import type { EnquiryInput } from './enquiry-schema'

/**
 * Send the lead email via Resend. If no API key is configured (e.g. local dev),
 * we log instead of failing — the enquiry is still saved to the CMS.
 */
export async function sendEnquiryEmail(data: EnquiryInput): Promise<{ sent: boolean }> {
  const key = process.env.RESEND_API_KEY
  const to = process.env.ENQUIRY_TO_EMAIL
  const from = process.env.ENQUIRY_FROM_EMAIL || 'no-reply@campsambhar.com'

  if (!key || !to) {
    console.info('[enquiry] email not configured — lead:', {
      name: data.name,
      phone: data.phone,
      email: data.email,
    })
    return { sent: false }
  }

  const lines = [
    `New enquiry from ${data.name}`,
    '',
    `Phone: ${data.phone}`,
    data.email ? `Email: ${data.email}` : '',
    data.checkIn ? `Check-in: ${data.checkIn}` : '',
    data.checkOut ? `Check-out: ${data.checkOut}` : '',
    data.guests ? `Guests: ${data.guests}` : '',
    data.interest ? `Interested in: ${data.interest}` : '',
    data.message ? `\nMessage:\n${data.message}` : '',
    data.sourcePage ? `\n(from ${data.sourcePage})` : '',
  ].filter(Boolean)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email || undefined,
        subject: `New enquiry — ${data.name}`,
        text: lines.join('\n'),
      }),
    })
    return { sent: res.ok }
  } catch (err) {
    console.error('[enquiry] email send failed', err)
    return { sent: false }
  }
}

/** Verify a Cloudflare Turnstile token. Returns true if disabled (no secret set). */
export async function verifyTurnstile(token?: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // not configured → skip in dev
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}
