import { Cormorant_Garamond, Manrope, Montserrat } from 'next/font/google'

/** Editorial headings. */
export const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
})

/** Navigation, body, buttons. */
export const bodyFont = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

/** Logo wordmark ONLY (Montserrat ExtraBold). */
export const logoFont = Montserrat({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-logo',
  display: 'swap',
})
