'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { EnquiryInput } from '../lib/enquiry-schema'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function EnquiryForm({
  sourcePage,
  compact = false,
}: {
  sourcePage?: string
  compact?: boolean
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryInput>()
  const [status, setStatus] = useState<Status>('idle')
  const [whatsapp, setWhatsapp] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const onSubmit = async (values: EnquiryInput) => {
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, sourcePage: sourcePage || 'unknown' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setWhatsapp(data.whatsapp ?? null)
      setStatus('success')
      reset()
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center">
        <p className="font-[family-name:var(--font-serif)] text-2xl text-charcoal">Thank you</p>
        <p className="mt-2 text-muted">
          We’ve received your enquiry and will be in touch shortly.
        </p>
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm text-white transition-colors hover:bg-sage-600"
          >
            Continue on WhatsApp
          </a>
        )}
      </div>
    )
  }

  const inputCls =
    'w-full rounded-lg border border-sand-400/60 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-red-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0"
        {...register('company')}
      />

      <div className={compact ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
        <div>
          <input placeholder="Full name" className={inputCls} {...register('name', { required: true })} />
          {errors.name && <p className="mt-1 text-xs text-red-600">Please enter your name.</p>}
        </div>
        <div>
          <input placeholder="Phone number" className={inputCls} {...register('phone', { required: true })} />
          {errors.phone && <p className="mt-1 text-xs text-red-600">Please enter your phone.</p>}
        </div>
      </div>

      <div className={compact ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
        <input type="email" placeholder="Email (optional)" className={inputCls} {...register('email')} />
        <input placeholder="Interested in (room, stargazing…)" className={inputCls} {...register('interest')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-xs text-muted">
          Check-in
          <input type="date" className={inputCls} {...register('checkIn')} />
        </label>
        <label className="text-xs text-muted">
          Check-out
          <input type="date" className={inputCls} {...register('checkOut')} />
        </label>
        <label className="text-xs text-muted">
          Guests
          <input type="number" min={1} defaultValue={2} className={inputCls} {...register('guests')} />
        </label>
      </div>

      <textarea
        placeholder="Tell us what draws you here…"
        rows={compact ? 3 : 4}
        className={inputCls}
        {...register('message')}
      />

      {status === 'error' && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-full bg-red-500 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  )
}
