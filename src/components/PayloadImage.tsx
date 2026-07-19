import Image from 'next/image'
import { cn } from '../lib/utils'
import { SITE_URL } from '../lib/utils'
import type { Media } from '../payload-types'

type MediaRef = Media | number | null | undefined

/** Resolve a (possibly un-populated) media relationship to a Media object. */
function resolveMedia(media: MediaRef): Media | null {
  if (!media || typeof media === 'number') return null
  return media
}

/**
 * Normalize a Payload media URL for use with next/image.
 * Payload returns same-origin absolute URLs (because serverURL is set); we strip
 * our own origin so next/image treats them as local paths (no remotePatterns
 * needed, and it optimizes them directly). Genuinely remote URLs (S3/CDN) pass through.
 */
export function mediaUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith(SITE_URL)) return url.slice(SITE_URL.length) || '/'
  if (url.startsWith('/')) return url
  return url
}

/** Absolute URL for OG/JSON-LD (metadata needs a full URL). */
export function absoluteMediaUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${SITE_URL}${url}`
}

type Props = {
  media: MediaRef
  className?: string
  sizes?: string
  /** Render as a fill image inside a positioned parent. */
  fill?: boolean
  priority?: boolean
  /** Override alt (falls back to the media's alt text). */
  alt?: string
}

/**
 * Renders a Payload media upload via next/image with sensible defaults:
 * absolute URL, alt text from the CMS, and AVIF/WebP served by Next.
 */
export function PayloadImage({ media, className, sizes, fill, priority, alt }: Props) {
  const resolved = resolveMedia(media)
  const url = mediaUrl(resolved?.url)
  if (!url) {
    return (
      <div
        className={cn('flex items-center justify-center bg-sand-300 text-muted', className)}
        aria-hidden
      >
        <span className="text-xs uppercase tracking-widest">Camp Sambhar</span>
      </div>
    )
  }

  const altText = alt ?? resolved?.alt ?? ''

  if (fill) {
    return (
      <Image
        src={url}
        alt={altText}
        fill
        priority={priority}
        sizes={sizes ?? '100vw'}
        className={cn('object-cover', className)}
      />
    )
  }

  return (
    <Image
      src={url}
      alt={altText}
      width={resolved?.width ?? 1600}
      height={resolved?.height ?? 1000}
      priority={priority}
      sizes={sizes ?? '100vw'}
      className={className}
    />
  )
}
