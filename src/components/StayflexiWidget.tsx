'use client'

import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { ButtonEl } from './ui/Button'

/**
 * Renders into document.body. The widget sits inside sections that establish
 * their own stacking contexts (transforms, overflow-hidden), which trapped the
 * modal behind the sticky header and clipped it. Mounting at the body escapes
 * all of that. Client-only: portals need a real DOM node.
 */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

/** Today and tomorrow as yyyy-mm-dd, for sensible date-input minimums. */
function isoDay(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

/**
 * Site Settings is the source of truth, with the env var as the fallback —
 * the arrangement .env.example already documents. Without this the widget
 * depended solely on a CMS field, so an unseeded database showed guests the
 * "booking opens soon" notice even with the property ID configured in .env.
 * NEXT_PUBLIC_ is required: this is a client component, so the value must be
 * inlined at build time. The property ID is public (it appears in the booking
 * URL) — no secret is being exposed.
 */
const ENV_PROPERTY_ID = process.env.NEXT_PUBLIC_STAYFLEXI_PROPERTY_ID || ''

/**
 * Stayflexi booking. We render an availability form that opens the Stayflexi
 * booking engine — in a modal iframe when a booking URL is configured, so the
 * guest never leaves the site. Falls back to an enquiry CTA if not configured.
 */
export function AvailabilityBar({
  bookingUrl,
  propertyId,
}: {
  bookingUrl?: string | null
  propertyId?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')

  // The query parameter is hotel_id, with an underscore — confirmed against the
  // property's live booking link. The engine's own bundle uses `hotelId` as its
  // internal state key, which is a red herring: passing hotelId in the URL makes
  // it report "It seems you missed the hotel id".
  //
  // An earlier build also pointed at live.stayflexi.com, which does not resolve.
  // bookingengine.stayflexi.com is the live host and sends no X-Frame-Options or
  // frame-ancestors header, so it is embeddable.
  const effectivePropertyId = propertyId || ENV_PROPERTY_ID

  const baseUrl =
    bookingUrl ||
    (effectivePropertyId
      ? `https://bookingengine.stayflexi.com/?hotel_id=${encodeURIComponent(effectivePropertyId)}`
      : null)

  // Escape closes the modal, and the page behind it must not scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  // No date parameters are appended, deliberately.
  //
  // Passing checkin/checkout in ISO form makes the engine throw
  // "RangeError: Invalid time value" and render nothing — the white modal this
  // replaced. Tested in a real browser: dd-MM-yyyy and MM-dd-yyyy avoid the
  // crash but do not pre-fill anything, showing exactly what the bare URL shows.
  // So the parameters carry no benefit and a real risk of a blank screen.
  //
  // The dates the guest picks here still matter: they are passed to the engine's
  // own picker by the guest, and the fields set expectations before the modal
  // opens. If Stayflexi documents a supported deep-link format later, add it
  // here — but verify it renders before shipping.
  const resolvedUrl = baseUrl

  return (
    <div id="book" className="rounded-2xl bg-ivory/10 p-2 backdrop-blur-sm">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-ivory/20 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <DateField
          label="Check-in"
          icon="calendar"
          value={checkIn}
          min={isoDay()}
          onChange={(v) => {
            setCheckIn(v)
            // Keep the stay valid: check-out must follow check-in.
            if (checkOut && v && checkOut <= v) setCheckOut('')
          }}
        />
        <DateField
          label="Check-out"
          icon="calendar"
          value={checkOut}
          min={checkIn || isoDay(1)}
          onChange={setCheckOut}
        />
        <GuestField label="Guests" value={guests} onChange={setGuests} />
        <ButtonEl
          variant="light"
          className="m-1 rounded-lg sm:rounded-lg"
          onClick={() => setOpen(true)}
        >
          Check availability
        </ButtonEl>
      </div>

      {open && resolvedUrl && (
        <Portal>
          <div
            className="fixed inset-0 z-[200] flex items-stretch justify-center bg-charcoal/80 backdrop-blur-sm sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Book your stay"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative flex h-[100dvh] w-full flex-col bg-white shadow-2xl sm:h-[92dvh] sm:max-w-6xl sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Branded bar: the engine's own chrome is generic, so this keeps
                  the modal recognisably Camp Sambhar. */}
              <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-sand-400/40 bg-blush px-5 py-3.5 sm:rounded-t-2xl">
                <p className="font-[family-name:var(--font-serif)] text-lg leading-none text-charcoal">
                  Book your stay
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="-mr-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-charcoal/70 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
                  aria-label="Close booking"
                >
                  Close
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* min-h-0 lets the iframe shrink inside the flex column instead of
                  overflowing it, which is what clipped the engine's footer. */}
              <iframe
                src={resolvedUrl}
                title="Book your stay"
                className="min-h-0 w-full flex-1 border-0 sm:rounded-b-2xl"
              />
            </div>
          </div>
        </Portal>
      )}

      {/* Keyed off resolvedUrl, not `configured` — a configured-but-unusable URL
          must still show the enquiry fallback rather than a dead button. */}
      {open && !resolvedUrl && (
        <Portal>
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
          >
            <div
              className="max-w-md rounded-2xl bg-white p-8 text-center text-charcoal shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-[family-name:var(--font-serif)] text-2xl">Booking opens soon</p>
              <p className="mt-3 text-muted">
                Our online booking engine is being connected. In the meantime, send us an enquiry
                and we’ll hold your dates.
              </p>
              <a
                href="/contact"
                className="mt-6 inline-block rounded-full bg-red-500 px-6 py-3 text-sm text-white hover:bg-red-600"
              >
                Send an enquiry
              </a>
            </div>
          </div>
        </Portal>
      )}

    </div>
  )
}

function FieldIcon({ icon }: { icon: 'calendar' | 'user' }) {
  return (
    <span aria-hidden className="opacity-70">
      {icon === 'calendar' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
        </svg>
      )}
    </span>
  )
}

const fieldShell = 'flex items-center gap-3 bg-ivory/10 px-5 py-4 text-left text-ivory'
const controlBase =
  'w-full bg-transparent text-sm text-ivory outline-none focus-visible:underline [color-scheme:dark]'

function DateField({
  label,
  icon,
  value,
  min,
  onChange,
}: {
  label: string
  icon: 'calendar' | 'user'
  value: string
  min?: string
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <div className={fieldShell}>
      <FieldIcon icon={icon} />
      <span className="min-w-0 flex-1 leading-tight">
        <label htmlFor={id} className="block text-xs uppercase tracking-widest opacity-70">
          {label}
        </label>
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className={controlBase}
        />
      </span>
    </div>
  )
}

function GuestField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <div className={fieldShell}>
      <FieldIcon icon="user" />
      <span className="min-w-0 flex-1 leading-tight">
        <label htmlFor={id} className="block text-xs uppercase tracking-widest opacity-70">
          {label}
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${controlBase} [&>option]:text-charcoal`}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={String(n)}>
              {n} {n === 1 ? 'Adult' : 'Adults'}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}
