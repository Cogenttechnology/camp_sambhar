import Link from 'next/link'
import Image from 'next/image'
import { getHomeData } from '../../lib/home-data'
import { getSiteSettings } from '../../lib/queries'
import { PayloadImage } from '../../components/PayloadImage'
import { Reveal } from '../../components/ui/Reveal'
import { AvailabilityBar } from '../../components/StayflexiWidget'
import { EnquiryPopup } from '../../components/EnquiryPopup'
import { Parallax } from '../../components/ui/Parallax'
import {
  ArtAccent,
  FieldLabel,
  FlamingoWatermark,
  PaperTexture,
  TopoPattern,
  WaveDivider,
} from '../../components/ui/Nature'
import { getShowcasePhotos } from '../../lib/showcase'
import type { Room, Experience, Review, BlogPost, Media } from '../../payload-types'

export const revalidate = 3600

export default async function HomePage() {
  const [{ rooms, experiences, reviews, posts, birdPhotos }, settings, showcase] =
    await Promise.all([getHomeData(), getSiteSettings(), getShowcasePhotos()])

  return (
    <>
      <Hero heroMedia={settings.defaultOgImage} />
      <IntroSection />
      <RoomsSection rooms={rooms} bookingUrl={settings.stayflexiBookingUrl} propertyId={settings.stayflexiPropertyId} />
      <ExperiencesSection experiences={experiences} />
      <BirdsSection photos={birdPhotos} />
      <CafeSection />
      <StargazingSection />
      <ShowcaseSection photos={showcase} />
      <ReviewsSection reviews={reviews} />
      <RouteSection />
      <JournalSection posts={posts} />
      <EnquiryStrip />
      <EnquiryPopup />
    </>
  )
}

/* ─────────────────────────── Hero ─────────────────────────── */
function Hero({ heroMedia }: { heroMedia: Room['heroImage'] | number | null | undefined }) {
  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden">
      <Parallax className="absolute inset-0" strength={70}>
        <PayloadImage media={heroMedia as never} fill priority sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-charcoal/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent" />

      <div className="container-page relative flex min-h-[92vh] flex-col justify-center py-24">
        <div className="max-w-2xl text-ivory">
          <Reveal direction="up">
            <h1 className="font-[family-name:var(--font-serif)] text-[length:var(--text-hero)] font-medium leading-[var(--text-hero--line-height)]">
              Where the<br />Salt Desert<br />Meets the Stars
            </h1>
          </Reveal>
          <Reveal direction="up" delay={150}>
            <p className="mt-6 max-w-md text-lg text-ivory/85">
              A rare wilderness escape at Sambhar Lake, Rajasthan.
            </p>
          </Reveal>
          <Reveal direction="up" delay={300}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/about"
                className="rounded-full bg-red-500 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Explore the camp
              </Link>
              <Link
                href="/stay#book"
                className="rounded-full border border-ivory/70 px-8 py-4 text-sm font-medium text-ivory transition-colors hover:bg-blush hover:text-charcoal"
              >
                Book your stay
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/70">
        <span className="mb-2 block text-center text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="mx-auto block h-8 w-px animate-pulse bg-ivory/60" />
      </div>
    </section>
  )
}

/* ─────────────────── Intro: Slow down ─────────────────── */
function IntroSection() {
  const promises = [
    { icon: '/icons/eco.png', label: 'Eco-conscious' },
    { icon: '/icons/family.png', label: 'Family friendly' },
    { icon: '/icons/binoculars.png', label: 'Guided experiences' },
  ]
  return (
    <section className="relative overflow-hidden bg-blush py-[var(--spacing-section)]">
      {/* The white flamingo from the client's stationery, used as a watermark. */}
      {/* Far enough left that the text column never crosses it — the watermark
          should be felt, not read through. */}
      <FlamingoWatermark className="-left-40 bottom-0 hidden w-[26rem] xl:block" opacity={0.55} />

      <div className="container-page relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <FieldLabel className="mb-4 text-red-500">The Camp</FieldLabel>
          <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
            Slow down. Look closer. Stay wild.
          </h2>
          <p className="mt-6 max-w-md text-muted text-lg">
            Camp Sambhar is a soulful eco-luxury retreat on the edge of Asia’s largest inland salt
            lake. Here, time slows, nature speaks, and every stay leaves a lighter footprint.
          </p>
          <ul className="mt-8 flex flex-wrap gap-10">
            {promises.map((p) => (
              <li key={p.label} className="flex flex-col items-start gap-3">
                <Image src={p.icon} alt="" width={40} height={40} aria-hidden className="h-10 w-10 object-contain" />
                <span className="text-sm font-medium text-charcoal">{p.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} direction="left" className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/photos/tent-veranda.png"
              alt="A private tent veranda overlooking the salt lake at Camp Sambhar"
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {/* Decorative waterbird line-art */}
          <Image
            src="/illustrations/curlew.png"
            alt=""
            width={200}
            height={140}
            aria-hidden
            className="float-slow pointer-events-none absolute -right-2 -top-12 w-32 opacity-80 mix-blend-multiply lg:w-48"
          />
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────── Rooms: Rest beneath an endless sky ─────────────── */
function RoomsSection({
  rooms,
  bookingUrl,
  propertyId,
}: {
  rooms: Room[]
  bookingUrl?: string | null
  propertyId?: string | null
}) {
  return (
    <section className="relative overflow-hidden bg-red-600 py-[var(--spacing-section)] text-ivory">
      {/* Soften the flat red with the topographic pattern and a line-art accent */}
      <TopoPattern opacity={0.07} />
      {/* Dark band: multiply would crush the ink into the red, so blend off. */}
      <ArtAccent
        art="acacia-khejri"
        className="-right-16 top-8 hidden w-72 lg:block"
        opacity={0.16}
        blend="none"
      />

      <div className="container-page relative">
        {/* Heading + intro sit side by side so the top edge isn't half-empty */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ivory/70">
              Where you sleep
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
              Rest beneath an endless sky
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-md text-ivory/85 lg:pb-2">
              Two ways to stay on the edge of the salt lake — wood-and-canvas cottages with ensuite
              comforts, or a lighter tent pitched close to the land.
            </p>
          </Reveal>
        </div>

        {/* Cards: two-up on desktop so they fill the width, with detail rows */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {rooms.slice(0, 2).map((room, i) => (
            <Reveal key={room.id} delay={i * 120} direction="scale">
              <Link href={`/stay/${room.slug}`} className="group block h-full">
                <div className="relative aspect-[16/11] overflow-hidden rounded-2xl">
                  <PayloadImage
                    media={room.heroImage as never}
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Lift darker photos so they read on the red ground */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/45 via-transparent to-transparent" />
                  {room.priceFrom ? (
                    <span className="absolute right-4 top-4 rounded-full bg-blush/95 px-4 py-1.5 text-xs font-medium text-charcoal">
                      From ₹{room.priceFrom.toLocaleString('en-IN')}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-5 font-[family-name:var(--font-serif)] text-3xl">{room.title}</h3>
                <p className="mt-2 text-ivory/80">{room.shortDescription}</p>

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ivory/20 pt-4 text-sm text-ivory/75">
                  {room.maxAdults ? <span>Sleeps up to {room.maxAdults}</span> : null}
                  <span className="inline-flex items-center gap-2 font-medium text-ivory transition-colors group-hover:text-sand-400">
                    View details <Arrow />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-12">
          <AvailabilityBar bookingUrl={bookingUrl} propertyId={propertyId} />
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Experiences: Four ways to feel Sambhar ─────────────── */
function ExperiencesSection({ experiences }: { experiences: Experience[] }) {
  const [feature, ...rest] = experiences
  if (!feature) return null
  return (
    <section className="relative overflow-hidden bg-blush py-[var(--spacing-section)]">
      <Image
        src="/illustrations/flamingo.png"
        alt=""
        width={220}
        height={330}
        aria-hidden
        className="float-slow pointer-events-none absolute -left-6 top-24 hidden w-40 opacity-70 mix-blend-multiply lg:block"
      />
      <div className="container-page relative">
        <Reveal direction="up">
          <h2 className="max-w-md font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
            Four ways to feel Sambhar
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal direction="scale">
            <Link href={`/experiences/${feature.slug}`} className="group block">
              <div className="relative aspect-[5/4] overflow-hidden rounded-2xl">
                <PayloadImage
                  media={feature.heroImage as never}
                  fill
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-serif)] text-2xl">{feature.title}</h3>
              <p className="mt-2 max-w-md text-muted">{feature.teaser}</p>
              <span className="eyebrow mt-4 inline-flex items-center gap-2">
                Explore experiences <Arrow />
              </span>
            </Link>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
            {rest.map((exp, i) => (
              <Reveal key={exp.id} delay={i * 80}>
                <Link
                  href={`/experiences/${exp.slug}`}
                  className="group flex items-center gap-4 rounded-xl bg-white/60 p-3 transition-colors hover:bg-white"
                >
                  <div className="relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg">
                    <PayloadImage media={exp.heroImage as never} fill sizes="80px" className="object-cover" />
                  </div>
                  <span>
                    <span className="block font-[family-name:var(--font-serif)] text-lg leading-tight">
                      {exp.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted line-clamp-2">{exp.teaser}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Birds: the flamingo season ─────────────── */
function BirdsSection({ photos }: { photos: Media[] }) {
  if (photos.length < 4) return null
  const [feature, ...rest] = photos

  return (
    <>
      <WaveDivider fill="var(--color-sage-500)" />
      <section className="relative overflow-hidden bg-sage-500 py-[var(--spacing-section)] text-ivory">
        <ArtAccent
          art="flamingo"
          className="-right-8 top-16 hidden w-44 lg:block"
          opacity={0.28}
        />

        <div className="container-page relative">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            {/* Signature flamingo frame */}
            <Reveal direction="right">
              <Link href="/birds" className="group block">
                <figure className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <PayloadImage
                    media={feature as never}
                    fill
                    sizes="(max-width:1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </figure>
              </Link>
            </Reveal>

            <Reveal direction="left" delay={120}>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ivory/80">
                Ramsar Wetland of International Importance
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
                The flamingos arrive every winter
              </h2>
              <p className="mt-5 max-w-md text-ivory/85">
                Thousands of Greater and Lesser Flamingos travel here from distant countries,
                alongside pelicans, painted storks, avocets, spoonbills and raptors — over a hundred
                species recorded on the lake.
              </p>

              <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
                <div>
                  <dt className="text-xs uppercase tracking-widest text-ivory/70">Species recorded</dt>
                  <dd className="mt-1 font-[family-name:var(--font-serif)] text-3xl">100+</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-ivory/70">Best season</dt>
                  <dd className="mt-1 font-[family-name:var(--font-serif)] text-3xl">Nov–Feb</dd>
                </div>
              </dl>

              <Link
                href="/birds"
                className="mt-9 inline-flex items-center gap-2 rounded-full border border-ivory/60 px-7 py-3.5 text-sm transition-colors hover:bg-blush hover:text-charcoal"
              >
                Birds of Sambhar <Arrow />
              </Link>
            </Reveal>
          </div>

          {/* Supporting frames */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {rest.slice(0, 4).map((photo, i) => (
              <Reveal key={i} delay={i * 70} direction="scale">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <PayloadImage
                    media={photo as never}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider fill="var(--color-ivory)" flip />
    </>
  )
}

/* ─────────────── Café: Local flavours. Open skies. ─────────────── */
function CafeSection() {
  return (
    <section className="grid lg:grid-cols-2">
      <div className="relative min-h-[360px] lg:min-h-[520px]">
        <Image
          src="/photos/cafe-bonfire.png"
          alt="Bonfire dining under the stars at the Saltbox Café"
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent" />
        <div className="absolute inset-0 flex items-end p-8 text-ivory/80">
          <span className="text-xs uppercase tracking-[0.3em]">Bonfire dining · Saltbox Café</span>
        </div>
      </div>
      <div className="flex flex-col justify-center bg-sage-500 px-8 py-16 text-ivory lg:px-16">
        <Reveal direction="left">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ivory/80">
            Saltbox Café &amp; Restaurant
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
            Local flavours. Open skies.
          </h2>
          <p className="mt-5 max-w-md text-ivory/85">
            From Rajasthani classics to global comfort food, every meal is crafted with local produce
            and love.
          </p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {['Signature dishes', 'Private dining', 'Bonfire evenings'].map((t) => (
              <li key={t} className="rounded-full border border-ivory/40 px-4 py-2 text-sm">
                {t}
              </li>
            ))}
          </ul>
          <Link
            href="/cafe"
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-ivory/60 px-6 py-3 text-sm transition-colors hover:bg-blush hover:text-charcoal"
          >
            View the menu <Arrow />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────── Stargazing: When daylight fades ─────────────── */
function StargazingSection() {
  return (
    <section className="relative overflow-hidden bg-indigo-900 py-[var(--spacing-section)] text-ivory">
      {/* Dim tent-under-stars photo, left side */}
      <div className="absolute inset-0">
        <Image
          src="/photos/tent-stars.png"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover object-left opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/60 via-indigo-900/80 to-indigo-900" />
      </div>
      <Stars />
      {/* Constellation line art */}
      <Image
        src="/illustrations/constellation.png"
        alt=""
        aria-hidden
        width={360}
        height={240}
        className="float-slow pointer-events-none absolute right-6 top-10 hidden w-72 opacity-40 md:block"
      />
      <div className="container-page relative flex flex-col items-end text-right">
        <Reveal direction="left" className="max-w-lg">
          <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
            When daylight fades, the universe arrives.
          </h2>
          <p className="mt-5 text-ivory/80">
            Clear desert skies, countless stars, and stories that stay with you.
          </p>
          <Link
            href="/experiences/professional-stargazing"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-sand-400 hover:text-ivory"
          >
            Stargazing experiences <Arrow />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function Stars() {
  const stars = [
    [8, 20], [18, 60], [30, 35], [42, 72], [55, 18], [66, 48], [74, 28], [85, 64], [92, 40],
    [12, 80], [50, 55], [38, 12], [70, 82], [88, 15], [22, 42],
  ]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {stars.map(([x, y], i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-blush"
          style={{ left: `${x}%`, top: `${y}%`, opacity: 0.3 + (i % 5) * 0.14 }}
        />
      ))}
    </div>
  )
}

/* ─────────────── Reviews: Loved by our guests ─────────────── */
function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const avg =
    reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1) : '5.0'
  return (
    <section className="bg-blush py-[var(--spacing-section)]">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
          <Reveal className="lg:w-56">
            <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
              Loved by our guests
            </h2>
            <div className="mt-6 flex items-center gap-3">
              <span className="font-[family-name:var(--font-serif)] text-4xl text-red-500">{avg}</span>
              <span className="flex text-red-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} />
                ))}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">Google Reviews</p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 80}>
                <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
                  <span className="font-[family-name:var(--font-serif)] text-3xl leading-none text-sand-500">“</span>
                  <blockquote className="mt-2 flex-1 text-charcoal/90">{r.text}</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="block font-semibold text-charcoal">{r.authorName}</span>
                    <span className="text-muted">Google review</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>

        <ul className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-4 border-t border-sand-400/40 pt-8 text-sm text-muted">
          {['Eco-conscious & responsible', 'Safe & secure stay', 'Family friendly activities', 'Curated local experiences'].map(
            (t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sage-500" />
                {t}
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  )
}

/* ─────────────── Route: Just far enough from ordinary ─────────────── */
function RouteSection() {
  const routes = [
    ['From Jaipur', '2.5 hrs / 160 km'],
    ['From Ajmer', '1.5 hrs / 75 km'],
    ['From Delhi', '5.5 hrs / 320 km'],
  ]
  return (
    <section className="bg-blush py-[var(--spacing-section)]">
      <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-center">
        <Reveal>
          <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
            Just far enough from ordinary
          </h2>
          <p className="mt-4 text-muted">Easy to reach. Hard to leave.</p>
          <ul className="mt-6 space-y-3">
            {routes.map(([from, time]) => (
              <li key={from} className="flex items-center gap-3 text-charcoal">
                <span className="text-red-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11Z" />
                    <circle cx="12" cy="10" r="2.4" />
                  </svg>
                </span>
                <span className="font-medium">{from}</span>
                <span className="text-muted">— {time}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-red-500 px-7 py-3 text-sm font-medium text-white hover:bg-red-600"
          >
            Get directions
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/illustrations/route-map.png"
              alt="Illustrated map of the route from Jaipur to Sambhar Lake"
              width={2048}
              height={768}
              className="h-auto w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────── Journal ─────────────── */
/* ─────────────── Gallery: a mosaic of the place ─────────────── */
function ShowcaseSection({ photos }: { photos: { media: Media; alt: string }[] }) {
  if (photos.length < 6) return null

  // A deliberately uneven mosaic — equal tiles read as a stock contact sheet.
  //
  // Two feature tiles over a 4-column grid, sized so the rows close exactly:
  //   rows 1-2  aerial 2x2 (4) + tall 1x2 (2) + two 1x1 (2) = 8 cells
  //   row 3     four 1x1                                    = 4 cells
  // Ten photographs, twelve cells, no ragged edge.
  //
  // A third wide tile was tried here and removed: mixing col-span and row-span
  // in the same auto-placed grid pushed the tail onto an extra row and left a
  // hole, which is exactly what a mosaic must not do.
  const span = [
    'sm:col-span-2 sm:row-span-2', // 0 aerial anchor
    'sm:row-span-2', // 1 tall wildlife frame
    '', // 2
    '', // 3
    '', // 4
    '', // 5
    '', // 6
    '', // 7
  ]

  const tiles = photos.slice(0, 8)

  return (
    <section className="relative overflow-hidden bg-blush py-[var(--spacing-section)]">
      <PaperTexture opacity={0.3} />
      <TopoPattern opacity={0.05} />
      <ArtAccent art="grass" className="-left-12 bottom-8 hidden w-44 lg:block" opacity={0.24} />

      <div className="container-page relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <FieldLabel className="mb-3 text-red-500">In pictures</FieldLabel>
            <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
              A place best seen, not described
            </h2>
          </div>
          <Link href="/gallery" className="eyebrow hidden items-center gap-2 sm:inline-flex">
            View the full gallery <Arrow />
          </Link>
        </div>

        <div className="mt-10 grid auto-rows-[168px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:grid-cols-4 sm:gap-4">
          {tiles.map((p, i) => (
            <Reveal
              key={p.media.id ?? i}
              delay={(i % 4) * 70}
              direction="scale"
              className={`${span[i] ?? ''} group relative overflow-hidden rounded-xl`}
            >
              <PayloadImage
                media={p.media as never}
                alt={p.alt}
                fill
                sizes="(max-width:640px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Reveal>
          ))}
        </div>

        <Link
          href="/gallery"
          className="eyebrow mt-8 inline-flex items-center gap-2 sm:hidden"
        >
          View the full gallery <Arrow />
        </Link>
      </div>
    </section>
  )
}

function JournalSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null
  return (
    <section className="bg-white py-[var(--spacing-section)]">
      <div className="container-page">
        <div className="flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
            From the Journal
          </h2>
          <Link href="/blog" className="eyebrow hidden items-center gap-2 sm:inline-flex">
            View all articles <Arrow />
          </Link>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <PayloadImage
                    media={post.coverImage as never}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-serif)] text-xl">{post.title}</h3>
                <p className="mt-2 text-sm text-muted line-clamp-2">{post.excerpt}</p>
                <span className="eyebrow mt-3 inline-flex items-center gap-2">Read more <Arrow /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────── Enquiry strip ─────────────── */
function EnquiryStrip() {
  return (
    <section className="bg-red-500 py-16 text-ivory">
      <div className="container-page flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl font-[family-name:var(--font-serif)] text-3xl leading-tight sm:text-4xl">
          Plan your Sambhar escape
        </h2>
        <p className="max-w-md text-ivory/85">
          Tell us your dates and what draws you here — we’ll craft the rest.
        </p>
        <Link
          href="/contact"
          className="rounded-full bg-blush px-8 py-4 text-sm font-medium text-charcoal transition-colors hover:bg-white"
        >
          Send an enquiry
        </Link>
      </div>
    </section>
  )
}

/* ─────────────── Small shared bits ─────────────── */
function Arrow() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1 6h15M11 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Star() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7L12 2Z" />
    </svg>
  )
}
