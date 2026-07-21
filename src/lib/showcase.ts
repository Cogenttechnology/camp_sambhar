import { getPayloadClient } from './payload'
import { isPublishable } from './birds'
import type { GalleryAlbum, Media } from '../payload-types'

/**
 * The home-page gallery selection.
 *
 * The media library holds ~470 images of very mixed quality — snapshots of
 * guests in the pool, under-exposed night frames, duplicate record shots. Those
 * are fine inside the full Gallery but would undercut the home page, so this is
 * a hand-picked set chosen by reviewing contact sheets of every album.
 *
 * Order matters: it is the reading order of the mosaic, strongest frames first
 * and subjects deliberately alternated (aerial, wildlife, camp, dining, night)
 * so no two neighbouring tiles look alike.
 *
 * Birds are represented but kept light — the home page already has a dedicated
 * birds section, so this leans on the frames that section does not use.
 */
const SHOWCASE: { file: string; alt: string }[] = [
  {
    file: 'drone-2',
    alt: 'Aerial view of Camp Sambhar Resort — tents, pool and the white salt lake beyond',
  },
  {
    file: 'sambhar-1-21',
    alt: 'A flock of Lesser Flamingos lifting off from Sambhar Lake',
  },
  {
    file: 'rest-1',
    alt: 'Laid tables at the SaltBox restaurant looking out over the lake',
  },
  {
    file: 'untitled-2283',
    alt: 'A Spotted Owlet perched in a thorn tree near the camp',
  },
  {
    file: '7',
    alt: 'Swiss tent cottages beside the pool at Camp Sambhar Resort',
  },
  {
    file: 'sambhar-1-29-01',
    alt: 'Greater Flamingos wading in the shallows of the salt lake',
  },
  {
    file: '3',
    alt: 'A chef working the flame at the SaltBox kitchen',
  },
  {
    file: 'camp-sambhar-hiking-t-2',
    alt: 'A hiking tent pitched against the Rajasthan sunset',
  },
  {
    file: 'drone-1',
    alt: 'The camp from the air, ringed by open Rajasthan farmland',
  },
  {
    file: '5',
    alt: 'The pool at Camp Sambhar, tents lined along the far edge',
  },
]

const baseName = (m: Media) => (m.filename ?? '').replace(/\.[a-z]+$/i, '')

/**
 * Fetch the showcase photographs, in curated order.
 *
 * Falls back to whatever good frames exist if a curated file is missing — the
 * media library is editable in the CMS, so a hard dependency on exact filenames
 * would leave the section broken and empty rather than merely different.
 */
export async function getShowcasePhotos(): Promise<{ media: Media; alt: string }[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'gallery-albums',
    depth: 2,
    limit: 50,
  })

  const byName = new Map<string, Media>()
  for (const album of docs as GalleryAlbum[]) {
    for (const entry of album.images ?? []) {
      const media = entry.image as Media
      if (media && typeof media === 'object' && isPublishable(media)) {
        byName.set(baseName(media), media)
      }
    }
  }

  const picked = SHOWCASE.map(({ file, alt }) => {
    const media = byName.get(file)
    return media ? { media, alt } : null
  }).filter(Boolean) as { media: Media; alt: string }[]

  if (picked.length >= 6) return picked

  // Top up from the wider library so the mosaic is never half-empty.
  const used = new Set(picked.map((p) => baseName(p.media)))
  for (const [name, media] of byName) {
    if (picked.length >= 8) break
    if (used.has(name)) continue
    picked.push({ media, alt: media.alt ?? 'Camp Sambhar Resort' })
  }

  return picked
}
