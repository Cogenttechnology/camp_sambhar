import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '../../../lib/payload'
import { getSiteSettings } from '../../../lib/queries'
import { buildMetadata } from '../../../lib/seo'
import { PayloadImage } from '../../../components/PayloadImage'
import { Reveal } from '../../../components/ui/Reveal'
import { Parallax } from '../../../components/ui/Parallax'
import { AvailabilityBar } from '../../../components/StayflexiWidget'
import { ArtAccent, PaperTexture, TopoPattern, WaveDivider } from '../../../components/ui/Nature'
import type { Media } from '../../../payload-types'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'Stay — Swiss Tent Cottages & Hiking Tents',
      description:
        'Wood-and-canvas Swiss Tent Cottages with ensuite comforts and a 180° view of the salt flats, plus lighter hiking tents. Check availability at Camp Sambhar Resort.',
      path: '/stay',
    },
    settings,
  )
}

const AMENITIES = [
  { label: '180° salt-lake views', icon: 'view' },
  { label: 'Ensuite bathrooms', icon: 'bath' },
  { label: 'Pool access', icon: 'pool' },
  { label: 'In-tent dining', icon: 'dining' },
  { label: 'Backup power', icon: 'power' },
  { label: 'Pet friendly', icon: 'pet' },
] as const

export default async function StayPage() {
  const payload = await getPayloadClient()
  const settings = await getSiteSettings()
  const [{ docs: rooms }, { docs: albums }] = await Promise.all([
    payload.find({ collection: 'rooms', sort: 'order', depth: 2, limit: 20 }),
    payload.find({
      collection: 'gallery-albums',
      where: { slug: { in: ['swiss-tent-cottages', 'the-pool', 'from-the-air'] } },
      depth: 2,
      limit: 3,
    }),
  ])

  // Prefer the aerial shot as the establishing hero — it shows the camp against the lake.
  const aerialAlbum = albums.find((a) => a.slug === 'from-the-air')
  const heroImage =
    ((aerialAlbum?.images ?? [])[0]?.image as Media) ?? (rooms[0]?.heroImage as Media) ?? null
  const poolAlbum = albums.find((a) => a.slug === 'the-pool')
  const poolPhotos = (poolAlbum?.images ?? []).map((i) => i.image as Media).filter(Boolean)

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] overflow-hidden">
        <Parallax className="absolute inset-0" strength={60}>
          <PayloadImage media={heroImage as never} fill priority sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/25" />
        <div className="container-page relative flex min-h-[70vh] items-end pb-16 pt-32">
          <Reveal className="max-w-2xl text-ivory">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand-400">
              Accommodation
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-serif)] text-[length:var(--text-hero)] leading-[var(--text-hero--line-height)]">
              Where you rest
              <br />
              is part of the wild
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ivory/85">
              Wood-and-canvas cottages that open straight onto the white salt flats — with the lake,
              the birds and the stars right outside.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Availability ── */}
      <section className="bg-red-600 py-10 text-ivory">
        <div className="container-page">
          <AvailabilityBar
            bookingUrl={settings.stayflexiBookingUrl}
            propertyId={settings.stayflexiPropertyId}
          />
        </div>
      </section>

      {/* ── Amenities strip ── */}
      <section className="relative overflow-hidden bg-blush py-14">
        <PaperTexture opacity={0.4} />
        <div className="container-page relative">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
            {AMENITIES.map((a, i) => (
              <Reveal key={a.label} delay={i * 60}>
                <li className="flex flex-col items-center gap-3 text-center">
                  <AmenityIcon name={a.icon} />
                  <span className="text-sm text-charcoal">{a.label}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Rooms ── */}
      <section className="relative overflow-hidden bg-blush pb-[var(--spacing-section)]">
        <TopoPattern opacity={0.05} />
        <ArtAccent art="acacia-khejri" className="-left-16 top-24 hidden w-64 lg:block" opacity={0.35} />
        <ArtAccent art="grass" className="-left-12 bottom-1/4 hidden w-48 lg:block" opacity={0.4} />
        <ArtAccent
          art="curlew"
          className="-right-6 top-16 hidden w-52 lg:block"
          opacity={0.45}
          flip
        />
        <ArtAccent art="camel" className="-right-16 bottom-16 hidden w-60 lg:block" opacity={0.3} />

        <div className="container-page relative space-y-24">
          {rooms.map((room, i) => {
            const gallery = (room.gallery ?? []).map((g) => g.image as Media).filter(Boolean)
            const reversed = i % 2 === 1
            return (
              <article key={room.id} className="grid gap-10 lg:grid-cols-2 lg:items-center">
                {/* Images — a main shot plus two supporting frames */}
                <Reveal
                  direction={reversed ? 'right' : 'left'}
                  className={reversed ? 'lg:order-2' : undefined}
                >
                  <Link href={`/stay/${room.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <PayloadImage
                        media={room.heroImage as never}
                        fill
                        sizes="(max-width:1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {gallery.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {gallery.slice(0, 3).map((g, gi) => (
                          <div
                            key={gi}
                            className="relative aspect-square overflow-hidden rounded-lg"
                          >
                            <PayloadImage
                              media={g as never}
                              fill
                              sizes="(max-width:1024px) 30vw, 16vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Link>
                </Reveal>

                {/* Copy */}
                <Reveal delay={100} className={reversed ? 'lg:order-1' : undefined}>
                  <p className="eyebrow mb-2">{formatCategory(room.category)}</p>
                  <h2 className="font-[family-name:var(--font-serif)] text-4xl">{room.title}</h2>
                  <p className="mt-4 max-w-md text-lg text-muted">{room.shortDescription}</p>

                  <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-y border-sand-400/40 py-5">
                    {room.maxAdults ? (
                      <div>
                        <dt className="text-xs uppercase tracking-widest text-muted">Sleeps</dt>
                        <dd className="mt-1 font-medium text-charcoal">
                          Up to {room.maxAdults} guests
                        </dd>
                      </div>
                    ) : null}
                    {room.priceFrom ? (
                      <div>
                        <dt className="text-xs uppercase tracking-widest text-muted">From</dt>
                        <dd className="mt-1 font-medium text-charcoal">
                          ₹{room.priceFrom.toLocaleString('en-IN')}{' '}
                          <span className="font-normal text-muted">/ night</span>
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {room.amenities.slice(0, 5).map((a) => (
                        <li
                          key={a.id ?? a.label}
                          className="rounded-full bg-white px-3 py-1.5 text-xs text-charcoal"
                        >
                          {a.label}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/stay/${room.slug}`}
                      className="rounded-full bg-charcoal px-7 py-3.5 text-sm text-ivory transition-colors hover:bg-red-600"
                    >
                      View details
                    </Link>
                    <Link
                      href="#book"
                      className="rounded-full border border-charcoal px-7 py-3.5 text-sm text-charcoal transition-colors hover:bg-charcoal hover:text-ivory"
                    >
                      Check availability
                    </Link>
                  </div>
                </Reveal>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── Pool ── */}
      {poolPhotos.length > 0 && (
        <>
          <WaveDivider fill="var(--color-sage-500)" />
          <section className="relative overflow-hidden bg-sage-500 py-[var(--spacing-section)] text-ivory">
            <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ivory/80">
                  At the camp
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
                  A pool between the desert and the lake
                </h2>
                <p className="mt-5 max-w-md text-ivory/85">
                  Cool off after a morning of birding, then watch the light change over the salt
                  flats as the afternoon settles.
                </p>
              </Reveal>
              <Reveal direction="left" delay={120}>
                <div className="grid grid-cols-2 gap-4">
                  {poolPhotos.slice(0, 4).map((p, i) => (
                    <div
                      key={i}
                      className={`relative overflow-hidden rounded-xl ${
                        i % 2 === 0 ? 'aspect-[4/5]' : 'aspect-[4/5] mt-8'
                      }`}
                    >
                      <PayloadImage
                        media={p as never}
                        fill
                        sizes="(max-width:1024px) 45vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
          <WaveDivider fill="var(--color-ivory)" flip />
        </>
      )}

      {/* ── Policies note ── */}
      <section className="bg-blush pb-[var(--spacing-section)]">
        <div className="container-page max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl">Before you book</h2>
          <p className="mt-4 text-muted">
            We book on 100% payment. Bringing a dog? We have a pair of German Shepherds at the
            property and a simple pet policy. Everything is published in full.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/about/cancellation-policy" className="underline underline-offset-4 hover:text-red-600">
              Cancellation policy
            </Link>
            <Link href="/about/pet-policy" className="underline underline-offset-4 hover:text-red-600">
              Dog &amp; pet policy
            </Link>
            <Link href="/about/dos-and-donts" className="underline underline-offset-4 hover:text-red-600">
              Do’s and don’ts
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function formatCategory(c?: string | null) {
  if (!c) return 'Stay'
  return c
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

function AmenityIcon({ name }: { name: (typeof AMENITIES)[number]['icon'] }) {
  const cls = 'h-8 w-8 text-sage-500'
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, viewBox: '0 0 24 24' }
  switch (name) {
    case 'view':
      return (
        <svg className={cls} {...common}>
          <path d="M2 17h20M4 17c2-6 5-9 8-9s6 3 8 9" strokeLinecap="round" />
          <circle cx="17" cy="6" r="2.2" />
        </svg>
      )
    case 'bath':
      return (
        <svg className={cls} {...common}>
          <path d="M3 12h18v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3Z" />
          <path d="M7 12V6a2 2 0 114 0" strokeLinecap="round" />
        </svg>
      )
    case 'pool':
      return (
        <svg className={cls} {...common}>
          <path d="M2 16c2 0 2 1.5 4 1.5S8 16 10 16s2 1.5 4 1.5S16 16 18 16s2 1.5 4 1.5" strokeLinecap="round" />
          <path d="M7 14V5a2 2 0 114 0v9M13 14V5a2 2 0 114 0v9" strokeLinecap="round" />
        </svg>
      )
    case 'dining':
      return (
        <svg className={cls} {...common}>
          <path d="M6 3v8a2 2 0 002 2v8M6 3v5M9 3v5M17 3c-1.5 2-2 4-2 6s.5 2 2 2v9" strokeLinecap="round" />
        </svg>
      )
    case 'power':
      return (
        <svg className={cls} {...common}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg className={cls} {...common}>
          <circle cx="5.5" cy="10" r="2" />
          <circle cx="10" cy="6" r="2" />
          <circle cx="15" cy="7" r="2" />
          <circle cx="19" cy="12" r="2" />
          <path d="M12 12c-3 0-5 3-5 5s2 3 5 3 5-1 5-3-2-5-5-5Z" />
        </svg>
      )
  }
}
