import type { Metadata } from 'next'
import { getPayloadClient } from '../../../lib/payload'
import { getSiteSettings } from '../../../lib/queries'
import { buildMetadata } from '../../../lib/seo'
import { PayloadImage } from '../../../components/PayloadImage'
import { GalleryLightbox } from '../../../components/GalleryLightbox'
import { Reveal } from '../../../components/ui/Reveal'
import { Parallax } from '../../../components/ui/Parallax'
import { ArtAccent, PaperTexture, TopoPattern, OrnamentBand } from '../../../components/ui/Nature'
import { isPublishable } from '../../../lib/birds'
import type { Media } from '../../../payload-types'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'Gallery — Camp Sambhar in Pictures',
      description:
        'Flamingos at dawn, the white salt flats, Swiss tent cottages, the pool, the SaltBox restaurant and nights under the stars at Camp Sambhar Resort.',
      path: '/gallery',
    },
    settings,
  )
}

export default async function GalleryPage() {
  const payload = await getPayloadClient()
  const { docs: albums } = await payload.find({
    collection: 'gallery-albums',
    sort: 'order',
    depth: 2,
    limit: 50,
  })

  const hero = (albums.find((a) => a.slug === 'from-the-air')?.images ?? [])[0]?.image as Media
  const totalPhotos = albums.reduce((n, a) => n + (a.images?.length ?? 0), 0)

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[62vh] overflow-hidden">
        <Parallax className="absolute inset-0" strength={55}>
          <PayloadImage media={hero as never} fill priority sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/25" />
        <div className="container-page relative flex min-h-[62vh] items-end pb-14 pt-32">
          <Reveal className="max-w-2xl text-ivory">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand-400">
              Gallery · {totalPhotos} photographs
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-serif)] text-[length:var(--text-hero)] leading-[var(--text-hero--line-height)]">
              The salt lake,
              <br />
              in pictures
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ── Albums ── */}
      <section className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <PaperTexture opacity={0.35} />
        <TopoPattern opacity={0.05} />
        <ArtAccent art="flamingo" className="-left-10 top-32 hidden w-40 lg:block" opacity={0.35} />
        <ArtAccent art="camel" className="-right-14 bottom-40 hidden w-56 lg:block" opacity={0.28} />

        <div className="container-page relative space-y-20">
          {albums.map((album, ai) => {
            const photos = (album.images ?? [])
              .filter((img) =>
                typeof img.image === 'object' ? isPublishable(img.image as Media) : true,
              )
              .map((img) => ({
                image: img.image as Media | number,
                caption: img.caption,
              }))
            if (photos.length === 0) return null
            return (
              <div key={album.id}>
                <Reveal>
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="eyebrow mb-2">{formatCategory(album.category)}</p>
                      <h2 className="font-[family-name:var(--font-serif)] text-3xl">
                        {album.title}
                      </h2>
                    </div>
                    <p className="hidden flex-shrink-0 text-sm text-muted sm:block">
                      {photos.length} photo{photos.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </Reveal>

                <div className="mt-7">
                  <GalleryLightbox photos={photos} />
                </div>

                {ai < albums.length - 1 && <OrnamentBand className="mt-16" opacity={0.5} />}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}

function formatCategory(c?: string | null) {
  if (!c) return 'Album'
  const map: Record<string, string> = {
    landscape: 'Landscape',
    astronomy: 'Astronomy',
    wildlife: 'Wildlife',
    camp: 'Camp & Stay',
    dining: 'Dining',
    people: 'People & Culture',
  }
  return map[c] ?? c
}
