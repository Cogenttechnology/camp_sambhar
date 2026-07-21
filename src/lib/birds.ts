import { getPayloadClient } from './payload'
import type { Media } from '../payload-types'

/**
 * Photographs that must never be published, whatever else changes.
 *
 * These show a White-throated Kingfisher held in a hand — one of them appears
 * to be an injured or dead bird. On an eco-tourism site that reads as wildlife
 * disturbance and invites exactly the criticism the brand should avoid. They
 * are filtered out of every surface, not merely left off the curated list.
 */
export const EXCLUDED_PHOTOS = ['img20240406083700', 'img20240406084142'] as const

/**
 * The bird album holds 55 photographs of mixed quality — many are distant
 * record shots of the shoreline. These are the strong, publishable frames
 * (close-ups, flocks in flight, feeding groups), in the order we want to show
 * them. Anything not listed still appears in the Gallery.
 */
export const BEST_BIRD_PHOTOS = [
  'sambhar-1-21', // Lesser Flamingos lifting off en masse — the signature shot
  'sambhar-1-29-01', // Flamingo group, necks raised
  'common-28', // Flamingos feeding against the white salt bank
  'untitled-2261', // Stonechat perched on thorn branch, soft bokeh
  '55k-0874-2', // Raft of Northern Shovelers
  'sambhar-1-28',
  'untitled-2283',
  'untitled-1434',
  '55k-0258',
  'sambhar-974',
  'img-7870',
  'sambhar-1-20-copy',
  '55k-0923-2',
  'img-202211252152344',
] as const

const baseName = (m: Media) => (m.filename ?? '').replace(/\.[a-z]+$/i, '')

/** True when a photo is safe to show anywhere on the site. */
export const isPublishable = (m: Media) =>
  !(EXCLUDED_PHOTOS as readonly string[]).includes(baseName(m))

/** Rank a media item by our curated order; unlisted photos sort to the end. */
export function birdRank(m: Media): number {
  const i = (BEST_BIRD_PHOTOS as readonly string[]).indexOf(baseName(m))
  return i === -1 ? BEST_BIRD_PHOTOS.length + 1 : i
}

/**
 * Fetch the bird album's photos, best first.
 * `onlyCurated` limits the result to the hand-picked frames.
 */
export async function getBirdPhotos(onlyCurated = true): Promise<Media[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'gallery-albums',
    where: { slug: { equals: 'birds-of-sambhar' } },
    depth: 2,
    limit: 1,
  })
  const all = (docs[0]?.images ?? [])
    .map((i) => i.image as Media)
    .filter(Boolean)
    .filter(isPublishable)
  const sorted = [...all].sort((a, b) => birdRank(a) - birdRank(b))
  return onlyCurated ? sorted.filter((m) => birdRank(m) < BEST_BIRD_PHOTOS.length) : sorted
}
