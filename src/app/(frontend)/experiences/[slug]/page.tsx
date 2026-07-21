import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '../../../../lib/payload'
import { getSiteSettings } from '../../../../lib/queries'
import { buildMetadata } from '../../../../lib/seo'
import { PageHero } from '../../../../components/layout/PageHero'
import { PayloadImage } from '../../../../components/PayloadImage'
import { RichText } from '../../../../components/RichText'
import { JsonLd, breadcrumbJsonLd } from '../../../../lib/jsonld'
import { SITE_URL } from '../../../../lib/utils'
import {
  ArtAccent,
  FieldLabel,
  Ornament,
  PaperTexture,
  TopoPattern,
} from '../../../../components/ui/Nature'
import type { Experience } from '../../../../payload-types'

export const revalidate = 3600

async function getExperience(slug: string): Promise<Experience | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'experiences',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'experiences', limit: 100, depth: 0 })
  return docs.map((e) => ({ slug: e.slug as string }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const exp = await getExperience(slug)
  const settings = await getSiteSettings()
  if (!exp) return {}
  return buildMetadata(
    {
      title: exp.title,
      description: exp.teaser,
      image: exp.heroImage as never,
      path: `/experiences/${exp.slug}`,
      meta: (exp as { meta?: never }).meta,
    },
    settings,
  )
}

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const exp = await getExperience(slug)
  if (!exp) notFound()

  const related = (exp.relatedExperiences ?? []).filter(
    (r): r is Experience => typeof r === 'object' && r !== null,
  )
  const gallery = (exp.gallery ?? []).map((g) => g.image).filter(Boolean)
  const [accentA, accentB] = accentsFor(exp.slug ?? '', exp.title ?? '')

  return (
    <>
      <PageHero eyebrow="Experience" title={exp.title} intro={exp.teaser} image={exp.heroImage as never} />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TouristAttraction',
          name: exp.title,
          description: exp.teaser,
          url: `${SITE_URL}/experiences/${exp.slug}`,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Experiences', path: '/experiences' },
          { name: exp.title, path: `/experiences/${exp.slug}` },
        ])}
      />

      <section className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <PaperTexture opacity={0.4} />
        <TopoPattern opacity={0.05} />
        <ArtAccent art={accentA} className="-left-20 top-12 hidden w-60 lg:block" opacity={0.28} />
        <ArtAccent
          art={accentB}
          className="-right-16 bottom-48 hidden w-56 lg:block"
          opacity={0.3}
          flip
        />

        <div className="container-page relative grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="prose-body max-w-none">
            <RichText data={exp.description as never} />

            {exp.highlights && exp.highlights.length > 0 && (
              <div className="mt-8">
                <h3 className="font-[family-name:var(--font-serif)] text-2xl">Highlights</h3>
                <ul className="mt-4 space-y-2">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                      <span>{h.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="relative rounded-2xl bg-white p-6 shadow-sm">
            <dl className="space-y-3 text-sm">
              {exp.duration ? <Row label="Duration" value={exp.duration} /> : null}
              {exp.bestTime ? <Row label="Best time" value={exp.bestTime} /> : null}
              {exp.difficulty ? <Row label="Difficulty" value={cap(exp.difficulty)} /> : null}
            </dl>

            {exp.whatToBring && exp.whatToBring.length > 0 && (
              <div className="mt-6 border-t border-sand-400/40 pt-6">
                <FieldLabel className="mb-3 text-charcoal">What to bring</FieldLabel>
                <ul className="space-y-2 text-sm text-charcoal">
                  {exp.whatToBring.map((w, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sage-500" />
                      {w.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href="/contact"
              className="mt-6 block rounded-full bg-red-500 px-6 py-3 text-center text-sm text-white transition-colors hover:bg-red-600"
            >
              Enquire about this experience
            </Link>
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

        {related.length > 0 && (
          <div className="container-page relative mt-16">
            <Ornament className="mb-10 text-charcoal" />
            <FieldLabel className="mb-6 text-charcoal">You may also like</FieldLabel>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.slice(0, 3).map((r) => (
                <Link key={r.id} href={`/experiences/${r.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <PayloadImage media={r.heroImage as never} fill sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-3 font-[family-name:var(--font-serif)] text-lg">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="container-page relative mt-14">
          <Link href="/experiences" className="text-sm font-medium text-red-600 hover:underline">
            ← All experiences
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

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

type Accent = React.ComponentProps<typeof ArtAccent>['art']

/**
 * Picks the pair of naturalist accents that suits the experience — birds for
 * birding, a constellation for night skies, camel and khejri for the desert.
 * Falls back to the generic desert pairing.
 */
function accentsFor(slug: string, title: string): [Accent, Accent] {
  const s = `${slug} ${title}`.toLowerCase()
  if (/bird|flaming|wetland|lake|migrat/.test(s)) return ['flamingo', 'curlew']
  if (/star|night|sky|astro|moon/.test(s)) return ['constellation', 'grass']
  if (/salt|pan|flat|brine/.test(s)) return ['salt-crystals', 'curlew']
  if (/camel|safari|dune|ride/.test(s)) return ['camel', 'acacia-khejri']
  if (/village|heritage|temple|craft|culture|food/.test(s)) return ['acacia-khejri', 'camel']
  if (/walk|trek|hike|trail|nature/.test(s)) return ['grass', 'acacia-khejri']
  return ['acacia-khejri', 'grass']
}
