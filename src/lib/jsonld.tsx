import { SITE_URL } from './utils'
import { absoluteMediaUrl } from '../components/PayloadImage'
import type { Media, SiteSetting } from '../payload-types'

function imageFrom(ref?: Media | number | null): string | undefined {
  if (!ref || typeof ref === 'number') return undefined
  return absoluteMediaUrl(ref.url) ?? undefined
}

/** LodgingBusiness structured data for the resort (used site-wide / on Home). */
export function lodgingBusinessJsonLd(settings: SiteSetting, aggregateRating?: { rating: number; count: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: settings.siteName ?? 'Camp Sambhar Resort',
    description: settings.defaultMetaDescription ?? undefined,
    url: SITE_URL,
    image: imageFrom(settings.defaultOgImage) ?? imageFrom(settings.logo),
    telephone: settings.phone ?? undefined,
    email: settings.email ?? undefined,
    priceRange: settings.priceRange ?? '₹₹₹',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Rajasthan',
      addressCountry: 'IN',
      streetAddress: settings.address ?? undefined,
    },
    geo:
      settings.mapLat && settings.mapLng
        ? { '@type': 'GeoCoordinates', latitude: settings.mapLat, longitude: settings.mapLng }
        : undefined,
    sameAs: [
      ...(settings.socials?.map((s) => s.url) ?? []),
      settings.googleBusinessProfileUrl,
    ].filter(Boolean),
    aggregateRating: aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: aggregateRating.rating,
          reviewCount: aggregateRating.count,
        }
      : undefined,
  }
}

export function articleJsonLd(post: {
  title: string
  excerpt?: string | null
  path: string
  image?: Media | number | null
  publishedAt?: string | null
  authorName?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: imageFrom(post.image),
    datePublished: post.publishedAt ?? undefined,
    author: post.authorName ? { '@type': 'Person', name: post.authorName } : undefined,
    mainEntityOfPage: `${SITE_URL}${post.path}`,
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

/** Renders a JSON-LD script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
