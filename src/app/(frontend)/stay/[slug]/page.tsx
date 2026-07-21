import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '../../../../lib/payload'
import { getSiteSettings } from '../../../../lib/queries'
import { buildMetadata } from '../../../../lib/seo'
import { PageHero } from '../../../../components/layout/PageHero'
import { PayloadImage } from '../../../../components/PayloadImage'
import { RichText } from '../../../../components/RichText'
import { AvailabilityBar } from '../../../../components/StayflexiWidget'
import { JsonLd, breadcrumbJsonLd } from '../../../../lib/jsonld'
import {
  ArtAccent,
  FieldLabel,
  Ornament,
  PaperTexture,
  TopoPattern,
} from '../../../../components/ui/Nature'
import type { Room } from '../../../../payload-types'

export const revalidate = 3600

async function getRoom(slug: string): Promise<Room | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'rooms', limit: 100, depth: 0 })
  return docs.map((r) => ({ slug: r.slug as string }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const room = await getRoom(slug)
  const settings = await getSiteSettings()
  if (!room) return {}
  return buildMetadata(
    {
      title: room.title,
      description: room.shortDescription,
      image: room.heroImage as never,
      path: `/stay/${room.slug}`,
      meta: (room as { meta?: never }).meta,
    },
    settings,
  )
}

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [room, settings] = await Promise.all([getRoom(slug), getSiteSettings()])
  if (!room) notFound()

  const gallery = (room.gallery ?? []).map((g) => g.image).filter(Boolean)

  return (
    <>
      <PageHero eyebrow="Stay" title={room.title} intro={room.shortDescription} image={room.heroImage as never} />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Stay', path: '/stay' },
          { name: room.title, path: `/stay/${room.slug}` },
        ])}
      />

      <section className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <PaperTexture opacity={0.4} />
        <TopoPattern opacity={0.05} />
        <ArtAccent
          art="acacia-khejri"
          className="-left-20 top-10 hidden w-64 lg:block"
          opacity={0.28}
        />
        <ArtAccent
          art="grass"
          className="-right-14 bottom-40 hidden w-52 lg:block"
          opacity={0.3}
          flip
        />

        <div className="container-page relative grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="prose-body max-w-none">
            <RichText data={room.description as never} />
          </div>

          <aside className="relative rounded-2xl bg-white p-6 shadow-sm">
            <dl className="space-y-3 text-sm">
              {room.priceFrom ? (
                <div className="flex items-baseline justify-between">
                  <dt className="text-muted">From</dt>
                  <dd className="font-[family-name:var(--font-serif)] text-2xl text-charcoal">
                    ₹{room.priceFrom.toLocaleString('en-IN')}
                    <span className="text-sm text-muted"> / night</span>
                  </dd>
                </div>
              ) : null}
              {room.maxAdults ? (
                <Row label="Guests" value={`Up to ${room.maxAdults} adults${room.maxChildren ? ` + ${room.maxChildren} children` : ''}`} />
              ) : null}
              {room.sizeSqft ? <Row label="Size" value={`${room.sizeSqft} sq ft`} /> : null}
            </dl>

            {room.amenities && room.amenities.length > 0 && (
              <div className="mt-6 border-t border-sand-400/40 pt-6">
                <FieldLabel className="mb-3 text-charcoal">Amenities</FieldLabel>
                <ul className="grid grid-cols-1 gap-2 text-sm text-charcoal">
                  {room.amenities.map((a, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sage-500" />
                      {a.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <AvailabilityBarWrapper bookingUrl={settings.stayflexiBookingUrl} propertyId={settings.stayflexiPropertyId} />
            </div>
          </aside>
        </div>

        {gallery.length > 0 && (
          <div className="container-page relative mt-16">
            <FieldLabel className="mb-6 text-charcoal">Gallery</FieldLabel>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((img, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <PayloadImage media={img as never} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <Ornament className="relative mt-16 text-charcoal" />

        <div className="container-page relative mt-6">
          <Link href="/stay" className="text-sm font-medium text-red-600 hover:underline">
            ← All stays
          </Link>
        </div>
      </section>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="text-charcoal">{value}</dd>
    </div>
  )
}

/** Wraps the availability bar on a light card (dark labels look wrong on white). */
function AvailabilityBarWrapper({ bookingUrl, propertyId }: { bookingUrl?: string | null; propertyId?: string | null }) {
  return (
    <div className="rounded-xl bg-charcoal p-1">
      <AvailabilityBar bookingUrl={bookingUrl} propertyId={propertyId} />
    </div>
  )
}
