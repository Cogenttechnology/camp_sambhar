'use client'

import { useState } from 'react'
import Script from 'next/script'
import { ButtonEl } from './ui/Button'

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
  const configured = Boolean(bookingUrl || propertyId)

  const resolvedUrl =
    bookingUrl ||
    (propertyId ? `https://live.stayflexi.com/?hotelId=${encodeURIComponent(propertyId)}` : null)

  return (
    <div id="book" className="rounded-2xl bg-ivory/10 p-2 backdrop-blur-sm">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-ivory/20 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <Field label="Check-in" hint="Add dates" icon="calendar" />
        <Field label="Check-out" hint="Add dates" icon="calendar" />
        <Field label="Guests" hint="2 Adults" icon="user" />
        <ButtonEl
          variant="light"
          className="m-1 rounded-lg sm:rounded-lg"
          onClick={() => setOpen(true)}
        >
          Check availability
        </ButtonEl>
      </div>

      {open && resolvedUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-charcoal px-3 py-1 text-sm text-white"
              aria-label="Close booking"
            >
              Close
            </button>
            <iframe
              src={resolvedUrl}
              title="Book your stay"
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {open && !configured && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div className="max-w-md rounded-2xl bg-white p-8 text-center text-charcoal">
            <p className="font-[family-name:var(--font-serif)] text-2xl">Booking opens soon</p>
            <p className="mt-3 text-muted">
              Our online booking engine is being connected. In the meantime, send us an enquiry and
              we’ll hold your dates.
            </p>
            <a
              href="/contact"
              className="mt-6 inline-block rounded-full bg-red-500 px-6 py-3 text-sm text-white hover:bg-red-600"
            >
              Send an enquiry
            </a>
          </div>
        </div>
      )}

      {propertyId && (
        <Script
          src="https://cdn.stayflexi.com/booking-engine/widget.js"
          strategy="lazyOnload"
        />
      )}
    </div>
  )
}

function Field({ label, hint, icon }: { label: string; hint: string; icon: 'calendar' | 'user' }) {
  return (
    <div className="flex items-center gap-3 bg-ivory/10 px-5 py-4 text-left text-ivory">
      <span className="opacity-70">
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
      <span className="leading-tight">
        <span className="block text-xs uppercase tracking-widest opacity-70">{label}</span>
        <span className="block text-sm">{hint}</span>
      </span>
    </div>
  )
}
