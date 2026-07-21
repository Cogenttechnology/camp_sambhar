import type { Metadata } from 'next'
import Link from 'next/link'
import { getBirdPhotos } from '../../../lib/birds'
import { getSiteSettings } from '../../../lib/queries'
import { buildMetadata } from '../../../lib/seo'
import { PageHero } from '../../../components/layout/PageHero'
import { PayloadImage } from '../../../components/PayloadImage'
import { Reveal } from '../../../components/ui/Reveal'
import {
  ArtAccent,
  FieldLabel,
  OrnamentBand,
  PaperTexture,
  TopoPattern,
} from '../../../components/ui/Nature'
import { JsonLd, breadcrumbJsonLd } from '../../../lib/jsonld'
import { BIRDING, BIRD_GROUPS } from '../../../seed/data/content'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'Birds of Sambhar Lake — Flamingos & Migratory Species',
      description:
        "Over 100 bird species recorded at Sambhar Lake, a Ramsar Wetland of International Importance. Greater and Lesser Flamingos, pelicans, painted storks, waders and raptors — with guided birding from Camp Sambhar Resort.",
      path: '/birds',
    },
    settings,
  )
}

export default async function BirdsPage() {
  const photos = await getBirdPhotos()
  const totalSpecies = BIRD_GROUPS.reduce((n, g) => n + g.species.length, 0)

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Birds of Sambhar', path: '/birds' },
        ])}
      />

      <PageHero
        eyebrow="Ramsar Wetland of International Importance"
        title={BIRDING.title}
        intro="A paradise for bird lovers, photographers and nature enthusiasts — on Asia's largest inland salt lake."
        image={photos[0] as never}
      />

      {/* Intro copy */}
      <section className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <PaperTexture opacity={0.35} />
        <ArtAccent art="curlew" className="-right-10 top-8 hidden w-52 lg:block" opacity={0.3} flip />
        <ArtAccent art="grass" className="-left-12 bottom-0 hidden w-44 lg:block" opacity={0.32} />

        <div className="container-page relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <Reveal className="prose-body max-w-2xl text-lg">
            {BIRDING.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>

          <Reveal direction="left" delay={100}>
            <div className="rounded-2xl bg-white p-8">
              <h2 className="font-[family-name:var(--font-serif)] text-2xl">What you can experience</h2>
              <ul className="mt-5 space-y-3">
                {BIRDING.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-charcoal/90">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                    {h}
                  </li>
                ))}
              </ul>
              <Link
                href="/experiences/bird-watching"
                className="mt-7 inline-block rounded-full bg-red-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Book a guided birding tour
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Photo strip — one large frame, then a grid */}
      {photos.length > 1 && (
        <section className="relative overflow-hidden bg-white py-[var(--spacing-section)]">
          <ArtAccent art="flamingo" className="-left-8 top-24 hidden w-36 lg:block" opacity={0.22} />

          <div className="container-page relative">
            <FieldLabel className="mb-3">In the field</FieldLabel>
            <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
              Seen at the lake
            </h2>

            {photos[1] && (
              <Reveal className="mt-10" direction="scale">
                <figure className="relative aspect-[21/9] overflow-hidden rounded-2xl">
                  <PayloadImage
                    media={photos[1] as never}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </figure>
              </Reveal>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {photos.slice(2, 11).map((photo, i) => (
                <Reveal key={i} delay={i * 60} direction="scale">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <PayloadImage
                      media={photo as never}
                      fill
                      sizes="(max-width:768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted">
              Photographs taken at Sambhar Lake by our naturalists and visiting photographers.
            </p>
          </div>
        </section>
      )}

      {/* Species checklist */}
      <section className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <TopoPattern opacity={0.05} />
        <ArtAccent
          art="curlew"
          className="-right-14 bottom-24 hidden w-56 lg:block"
          opacity={0.25}
        />

        <div className="container-page relative">
          <Reveal>
            <FieldLabel className="mb-3">Field checklist</FieldLabel>
            <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
              {totalSpecies}+ species recorded at Sambhar
            </h2>
            <p className="mt-4 max-w-2xl text-muted">
              Compiled from the <em>Biodiversity of Sambhar Lake</em> survey by the Deputy Conservator
              of Forests, Jaipur — Rajasthan Forest Department, Government of Rajasthan.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {BIRD_GROUPS.map((group, i) => (
              <Reveal key={group.order} delay={i * 70}>
                <div className="h-full rounded-2xl bg-white p-6">
                  <h3 className="font-[family-name:var(--font-serif)] text-xl text-red-600">
                    {group.order}
                  </h3>
                  <ul className="mt-4 space-y-1.5 text-sm text-charcoal/85">
                    {group.species.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <OrnamentBand className="bg-ivory pb-4" opacity={0.5} />

      {/* Closing — night sky, so no multiply blend or the ink would vanish */}
      <section className="relative overflow-hidden bg-indigo-900 py-[var(--spacing-section)] text-ivory">
        <ArtAccent
          art="constellation"
          className="-right-10 -top-6 hidden w-72 lg:block"
          opacity={0.18}
          blend="none"
        />
        <ArtAccent
          art="flamingo"
          className="-left-10 bottom-0 hidden w-40 lg:block"
          opacity={0.14}
          blend="none"
        />

        <div className="container-page relative max-w-3xl text-center">
          <Reveal>
            <p className="font-[family-name:var(--font-serif)] text-2xl leading-relaxed sm:text-3xl">
              {BIRDING.closing}
            </p>
            <Link
              href="/contact"
              className="mt-9 inline-block rounded-full bg-red-500 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              Plan your birding trip
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
