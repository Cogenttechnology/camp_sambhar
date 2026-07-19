import type { Metadata } from 'next'
import './globals.css'
import { displayFont, bodyFont, logoFont } from './fonts'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import { getSiteSettings } from '../../lib/queries'
import { JsonLd, lodgingBusinessJsonLd } from '../../lib/jsonld'
import { SITE_URL } from '../../lib/utils'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Camp Sambhar Resort — A nature escape on the salt lake',
    template: '%s | Camp Sambhar Resort',
  },
  description:
    'An eco, rustic-luxury desert camping resort at Sambhar Lake, Rajasthan — flamingos, dark-sky stargazing, salt-lake heritage, and the Saltbox Café.',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html
      lang="en"
      // The inline script below (and browser extensions) mutate <html>'s class
      // before React hydrates; suppress the expected root-level mismatch.
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} ${logoFont.variable}`}
    >
      <head>
        {/* Mark JS-capable before paint so reveal animations enhance, never hide, content. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body>
        <JsonLd data={lodgingBusinessJsonLd(settings)} />
        <Navbar siteName={(settings.siteName ?? 'Camp Sambhar').toUpperCase()} />
        <main>{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
