import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '../../../lib/payload'
import { getSiteSettings } from '../../../lib/queries'
import { buildMetadata } from '../../../lib/seo'
import { PageHero } from '../../../components/layout/PageHero'
import { PayloadImage } from '../../../components/PayloadImage'
import { RichText } from '../../../components/RichText'
import { Reveal } from '../../../components/ui/Reveal'
import { ArtAccent, PaperTexture } from '../../../components/ui/Nature'
import type { Media } from '../../../payload-types'

export const revalidate = 3600

const ABOUT_LINKS = [
  {
    title: 'About Sambhar Lake',
    slug: 'sambhar-lake',
    blurb: 'Asia’s largest inland salt lake — flamingos, salt pans, and vast skies.',
  },
  {
    title: 'Sustainability & CSR',
    slug: 'sustainability',
    blurb: 'How we tread lightly on a fragile place, and work with the community around it.',
  },
  {
    title: 'Birds of Sambhar',
    slug: 'birds',
    blurb: 'Over 100 recorded species on a Ramsar Wetland of International Importance.',
    external: true,
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'About Camp Sambhar',
      description: 'A soulful, family-run eco-camp on the shores of Sambhar Salt Lake, Rajasthan.',
      path: '/about',
    },
    settings,
  )
}

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const [{ docs: team }, { docs: albums }] = await Promise.all([
    payload.find({ collection: 'team', sort: 'order', depth: 1, limit: 20 }),
    payload.find({
      collection: 'gallery-albums',
      where: { slug: { equals: 'from-the-air' } },
      depth: 2,
      limit: 1,
    }),
  ])
  const heroImage = ((albums[0]?.images ?? [])[0]?.image as Media) ?? null

  return (
    <>
      <PageHero
        eyebrow="About"
        title="A nature escape, run with care"
        intro="Camp Sambhar is a soulful eco-luxury retreat on the edge of Asia’s largest inland salt lake — a Ramsar Wetland of International Importance."
        image={heroImage}
      />

      {/* Accreditation strip */}
      <section className="border-b border-sand-400/40 bg-white py-8">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
          <p className="text-sm text-muted">
            <span className="font-semibold text-charcoal">DOT</span> — Approved by Department of
            Tourism, Government of Rajasthan
          </p>
          <span className="hidden h-4 w-px bg-sand-400 sm:block" />
          <p className="text-sm text-muted">
            <span className="font-semibold text-charcoal">ATOAI</span> — Allied Membership
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <PaperTexture opacity={0.35} />
        <ArtAccent art="acacia-khejri" className="-left-16 top-10 hidden w-56 lg:block" opacity={0.28} />
        <div className="container-page relative grid gap-6 md:grid-cols-3">
          {ABOUT_LINKS.map((l, i) => (
            <Reveal key={l.slug} delay={i * 80}>
              <Link
                href={l.external ? `/${l.slug}` : `/about/${l.slug}`}
                className="group flex h-full flex-col rounded-2xl bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <h2 className="font-[family-name:var(--font-serif)] text-xl">{l.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{l.blurb}</p>
                <span className="eyebrow mt-4 inline-flex items-center gap-2">Read more →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {team.length > 0 && (
        <section className="bg-sand-400/20 py-[var(--spacing-section)]">
          <div className="container-page">
            <h2 className="font-[family-name:var(--font-serif)] text-3xl">Our team</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m) => (
                <Reveal key={m.id}>
                  <div>
                    <div className="relative aspect-square overflow-hidden rounded-2xl">
                      <PayloadImage media={m.photo as never} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" />
                    </div>
                    <h3 className="mt-4 font-[family-name:var(--font-serif)] text-lg">{m.name}</h3>
                    <p className="text-sm text-red-600">{m.role}</p>
                    <div className="prose-body mt-2 text-sm text-muted">
                      <RichText data={m.bio as never} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
