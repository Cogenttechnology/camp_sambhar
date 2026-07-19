import { z } from 'zod'

/** Shared validation for the enquiry form (client + server). */
export const enquirySchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(120),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().min(6, 'Enter a valid phone number').max(20),
  checkIn: z.string().optional().or(z.literal('')),
  checkOut: z.string().optional().or(z.literal('')),
  guests: z.coerce.number().int().min(1).max(50).optional(),
  interest: z.string().max(120).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
  sourcePage: z.string().max(200).optional().or(z.literal('')),
  // Honeypot — must stay empty.
  company: z.string().max(0).optional().or(z.literal('')),
  // Cloudflare Turnstile token (optional in dev).
  turnstileToken: z.string().optional().or(z.literal('')),
})

export type EnquiryInput = z.infer<typeof enquirySchema>
