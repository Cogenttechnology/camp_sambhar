import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '../../../lib/payload'
import { getSiteSettings } from '../../../lib/queries'
import { buildMetadata } from '../../../lib/seo'
import { PayloadImage } from '../../../components/PayloadImage'
import { Reveal } from '../../../components/ui/Reveal'
import { Parallax } from '../../../components/ui/Parallax'
import { ArtAccent, PaperTexture, TopoPattern, WaveDivider, Ornament } from '../../../components/ui/Nature'
import type { Media } from '../../../payload-types'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'Experiences — Birding, Stargazing & Salt Heritage',
      description:
        'Guided bird watching with naturalists, professional stargazing under dark skies, and the Sambhar village and salt heritage tour. Small groups, local guides.',
      path: '/experiences',
    },
    settings,
  )
}

const ART_BY_CATEGORY: Record<string, 'flamingo' | 'constellation' | 'salt-crystals'> = {
  nature: 'flamingo',
  astronomy: 'constellation',
  culture: 'salt-crystals',
}

export default async function ExperiencesPage() {
  const payload = await getPayloadClient()
  const [{ docs: experiences }, { docs: albums }] = await Promise.all([
    payload.find({ collection: 'experiences', sort: 'order', depth: 2, limit: 30 }),
    payload.find({
      collection: 'gallery-albums',
      where: { slug: { equals: 'birds-of-sambhar' } },
      depth: 2,
      limit: 1,
    }),
  ])

  const heroImage = (experiences[0]?.heroImage as Media) ?? null
  const birdPhotos = (albums[0]?.images ?? []).map((i) => i.image as Media).filter(Boolean)

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
              Experiences
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-serif)] text-[length:var(--text-hero)] leading-[var(--text-hero--line-height)]">
              Ways to feel
              <br />
              Sambhar
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ivory/85">
              Small groups, local guides, and a landscape that rewards those who slow down.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Experience list ── */}
      <section className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <PaperTexture opacity={0.35} />
        <TopoPattern opacity={0.05} />

        <div className="container-page relative space-y-24">
          {experiences.map((exp, i) => {
            const gallery = (exp.gallery ?? []).map((g) => g.image as Media).filter(Boolean)
            const reversed = i % 2 === 1
            const art = ART_BY_CATEGORY[exp.category as string]
            return (
              <article key={exp.id} className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
                {art && (
                  <ArtAccent
                    art={art}
                    className={`hidden w-44 lg:block ${
                      reversed ? '-left-14 top-0' : '-right-14 bottom-0'
                    }`}
                    opacity={0.4}
                    flip={reversed}
                  />
                )}

                <Reveal
                  direction={reversed ? 'right' : 'left'}
                  className={reversed ? 'lg:order-2' : undefined}
                >
                  <Link href={`/experiences/${exp.slug}`} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <PayloadImage
                        media={exp.heroImage as never}
                        fill
                        sizes="(max-width:1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {gallery.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {gallery.slice(0, 2).map((g, gi) => (
                          <div key={gi} className="relative aspect-[3/2] overflow-hidden rounded-lg">
                            <PayloadImage
                              media={g as never}
                              fill
                              sizes="(max-width:1024px) 45vw, 24vw"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Link>
                </Reveal>

                <Reveal delay={100} className={reversed ? 'lg:order-1' : undefined}>
                  <p className="eyebrow mb-2">{formatCategory(exp.category)}</p>
                  <h2 className="font-[family-name:var(--font-serif)] text-4xl">{exp.title}</h2>
                  <p className="mt-4 max-w-md text-lg text-muted">{exp.teaser}</p>

                  <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-y border-sand-400/40 py-5">
                    {exp.duration ? (
                      <div>
                        <dt className="text-xs uppercase tracking-widest text-muted">Duration</dt>
                        <dd className="mt-1 font-medium text-charcoal">{exp.duration}</dd>
                      </div>
                    ) : null}
                    {exp.bestTime ? (
                      <div>
                        <dt className="text-xs uppercase tracking-widest text-muted">Best time</dt>
                        <dd className="mt-1 font-medium text-charcoal">{exp.bestTime}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                    <ul className="mt-6 space-y-2.5">
                      {exp.highlights.slice(0, 4).map((h) => (
                        <li key={h.id ?? h.text} className="flex gap-3 text-charcoal/90">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                          {h.text}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href={`/experiences/${exp.slug}`}
                    className="mt-8 inline-block rounded-full bg-charcoal px-7 py-3.5 text-sm text-ivory transition-colors hover:bg-red-600"
                  >
                    Read more
                  </Link>
                </Reveal>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── Birding photo band ── */}
      {birdPhotos.length > 3 && (
        <>
          <WaveDivider fill="var(--color-indigo-900)" />
          <section className="bg-indigo-900 py-[var(--spacing-section)] text-ivory">
            <div className="container-page">
              <Reveal className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand-400">
                  On the lake
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
                  Over 100 species recorded here
                </h2>
                <p className="mt-4 text-ivory/80">
                  Sambhar is a Ramsar Wetland of International Importance — flamingos, pelicans,
                  painted storks, waders and raptors, season after season.
                </p>
              </Reveal>
              <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                {birdPhotos.slice(0, 8).map((p, i) => (
                  <Reveal key={i} delay={i * 60} direction="scale">
                    <div className="relative aspect-square overflow-hidden rounded-xl">
                      <PayloadImage
                        media={p as never}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="mt-10">
                <Link
                  href="/birds"
                  className="inline-flex items-center gap-2 rounded-full border border-ivory/50 px-7 py-3.5 text-sm transition-colors hover:bg-ivory hover:text-charcoal"
                >
                  See the full species checklist
                </Link>
              </div>
            </div>
          </section>
          <WaveDivider fill="var(--color-ivory)" flip />
        </>
      )}

      {/* ── CTA ── */}
      <section className="bg-ivory pb-[var(--spacing-section)]">
        <div className="container-page max-w-2xl text-center">
          <Ornament className="text-sand-500" />
          <h2 className="mt-6 font-[family-name:var(--font-serif)] text-3xl">
            Every experience is included with your stay
          </h2>
          <p className="mt-4 text-muted">
            Tell us what draws you here — birds, stars, salt or silence — and we’ll shape your days
            around it.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-red-500 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            Plan your visit
          </Link>
        </div>
      </section>
    </>
  )
}

function formatCategory(c?: string | null) {
  if (!c) return 'Experience'
  const map: Record<string, string> = {
    nature: 'Wildlife & Nature',
    astronomy: 'Astronomy',
    culture: 'Culture & Heritage',
    adventure: 'Adventure',
  }
  return map[c] ?? c
}
