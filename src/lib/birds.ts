import { getPayloadClient } from './payload'
import type { Media } from '../payload-types'

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
  const all = (docs[0]?.images ?? []).map((i) => i.image as Media).filter(Boolean)
  const sorted = [...all].sort((a, b) => birdRank(a) - birdRank(b))
  return onlyCurated ? sorted.filter((m) => birdRank(m) < BEST_BIRD_PHOTOS.length) : sorted
}
