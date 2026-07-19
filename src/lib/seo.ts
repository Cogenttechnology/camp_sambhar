import type { Metadata } from 'next'
import { SITE_URL } from './utils'
import { absoluteMediaUrl } from '../components/PayloadImage'
import type { Media, SiteSetting } from '../payload-types'

const SITE_NAME = 'Camp Sambhar Resort'

type SeoInput = {
  title?: string | null
  description?: string | null
  image?: Media | number | null
  path?: string
  noindex?: boolean | null
  /** Payload SEO-plugin `meta` group, if present on the doc. */
  meta?: { title?: string | null; description?: string | null; image?: Media | number | null } | null
}

/** Build Next.js Metadata from a document's SEO fields with sensible fallbacks. */
export function buildMetadata(input: SeoInput, settings?: SiteSetting | null): Metadata {
  const title = input.meta?.title || input.title || SITE_NAME
  const description =
    input.meta?.description ||
    input.description ||
    settings?.defaultMetaDescription ||
    'An eco, rustic-luxury desert camping resort at Sambhar Lake, Rajasthan — flamingos, dark-sky stargazing, and salt-lake heritage.'

  const imageRef = input.meta?.image || input.image || settings?.defaultOgImage
  const ogImage =
    imageRef && typeof imageRef !== 'number' ? absoluteMediaUrl((imageRef as Media).url) : undefined

  const url = input.path ? `${SITE_URL}${input.path}` : SITE_URL

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: input.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}
