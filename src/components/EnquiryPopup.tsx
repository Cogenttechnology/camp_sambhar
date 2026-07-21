'use client'

import { useEffect, useState } from 'react'
import { EnquiryForm } from './EnquiryForm'

const DISMISS_KEY = 'cs-enquiry-dismissed'

/**
 * Homepage enquiry popup. Appears once per session after a short delay,
 * unless already dismissed. Also openable via a floating button.
 */
export function EnquiryPopup() {
  const [open, setOpen] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY)
    setShowButton(true)
    if (dismissed) return
    const t = setTimeout(() => setOpen(true), 12000)
    return () => clearTimeout(t)
  }, [])

  const close = () => {
    setOpen(false)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }

  return (
    <>
      {showButton && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 rounded-full bg-red-500 px-6 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-red-600"
        >
          Plan your escape
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-charcoal/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Plan your Sambhar escape"
          onClick={close}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-blush p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 text-charcoal/60 hover:text-charcoal"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            <p className="eyebrow mb-2">Plan your Sambhar escape</p>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl text-charcoal">
              Tell us your dates
            </h2>
            <p className="mt-2 text-sm text-muted">
              Share a few details and we’ll craft the rest — and hold your dates.
            </p>
            <div className="mt-6">
              <EnquiryForm sourcePage="/ (popup)" compact />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
