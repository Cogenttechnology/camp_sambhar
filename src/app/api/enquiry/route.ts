import { NextResponse } from 'next/server'
import { getPayloadClient } from '../../../lib/payload'
import { enquirySchema } from '../../../lib/enquiry-schema'
import { sendEnquiryEmail, verifyTurnstile } from '../../../lib/notify'
import { whatsappLink } from '../../../lib/utils'

// Very small in-memory rate limiter (per-IP). Resets on server restart —
// fine as a first line of defence alongside Turnstile + honeypot.
const hits = new Map<string, { count: number; ts: number }>()
const WINDOW = 60_000
const MAX = 5

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const rec = hits.get(ip)
  if (!rec || now - rec.ts > WINDOW) {
    hits.set(ip, { count: 1, ts: now })
    return false
  }
  rec.count += 1
  return rec.count > MAX
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = enquirySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check your details.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }
  const data = parsed.data

  // Honeypot: a filled "company" field means a bot.
  if (data.company) {
    return NextResponse.json({ ok: true }) // silently accept, do nothing
  }

  // Spam check
  const human = await verifyTurnstile(data.turnstileToken, ip)
  if (!human) {
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 })
  }

  // 1) Persist as a CMS lead (server-side, bypassing public create:false)
  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'enquiries',
      overrideAccess: true,
      data: {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
        checkIn: data.checkIn || undefined,
        checkOut: data.checkOut || undefined,
        guests: data.guests,
        interest: data.interest || undefined,
        message: data.message || undefined,
        sourcePage: data.sourcePage || undefined,
        status: 'new',
      },
    })
  } catch (err) {
    console.error('[enquiry] failed to save lead', err)
    // Don't fail the whole request if the DB write hiccups; email/whatsapp still help.
  }

  // 2) Email the resort (+ auto-reply handled by Resend template later if desired)
  await sendEnquiryEmail(data)

  // 3) Build a WhatsApp click-to-chat link for the success screen
  const payloadClient = await getPayloadClient()
  const settings = await payloadClient.findGlobal({ slug: 'site-settings' })
  const waMessage = `Hello Camp Sambhar! I'm ${data.name}. I'd like to enquire${
    data.checkIn ? ` for ${data.checkIn}${data.checkOut ? `–${data.checkOut}` : ''}` : ''
  }${data.interest ? ` about ${data.interest}` : ''}.`
  const whatsapp = whatsappLink(settings.whatsappNumber, waMessage)

  return NextResponse.json({ ok: true, whatsapp })
}
