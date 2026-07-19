import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '../../../lib/payload'
import { getSiteSettings } from '../../../lib/queries'
import { buildMetadata } from '../../../lib/seo'
import { PayloadImage } from '../../../components/PayloadImage'
import { Reveal } from '../../../components/ui/Reveal'
import { Parallax } from '../../../components/ui/Parallax'
import { MenuExplorer, type MenuEntry } from '../../../components/MenuExplorer'
import { ArtAccent, PaperTexture, TopoPattern, WaveDivider, OrnamentBand } from '../../../components/ui/Nature'
import { JsonLd } from '../../../lib/jsonld'
import { SITE_URL } from '../../../lib/utils'
import type { Media } from '../../../payload-types'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'SaltBox Café & Restaurant — Rajasthani & Global Cuisine',
      description:
        'The SaltBox at Camp Sambhar — Rajasthani classics like Laal Maas and Dal Baati, plus Chinese, Italian and global comfort food. In-tent dining, private dining and bonfire evenings by the salt lake.',
      path: '/cafe',
    },
    settings,
  )
}

export default async function CafePage() {
  const payload = await getPayloadClient()
  const settings = await getSiteSettings()

  const [{ docs: categories }, { docs: items }, { docs: albums }] = await Promise.all([
    payload.find({ collection: 'menu-categories', sort: 'order', limit: 50 }),
    payload.find({
      collection: 'menu-items',
      sort: 'order',
      depth: 1,
      limit: 300,
      where: { available: { equals: true } },
    }),
    payload.find({
      collection: 'gallery-albums',
      where: { slug: { in: ['saltbox-restaurant', 'our-kitchen'] } },
      depth: 2,
      limit: 2,
    }),
  ])

  const catName = new Map<number, string>()
  for (const c of categories) catName.set(c.id as number, c.title as string)

  const entries: MenuEntry[] = items.map((it) => {
    const cid = typeof it.category === 'object' ? it.category?.id : it.category
    return {
      id: it.id as number,
      name: it.name as string,
      price: it.price,
      description: it.description,
      veg: Array.isArray(it.dietary) ? it.dietary.includes('veg' as never) : false,
      signature: Boolean(it.signature),
      category: catName.get(cid as number) ?? 'Other',
    }
  })

  const restaurantAlbum = albums.find((a) => a.slug === 'saltbox-restaurant')
  const kitchenAlbum = albums.find((a) => a.slug === 'our-kitchen')
  const allRest = (restaurantAlbum?.images ?? []).map((i) => i.image as Media).filter(Boolean)
  const kitchenPhotos = (kitchenAlbum?.images ?? []).map((i) => i.image as Media).filter(Boolean)

  // Curate the order: lead with the bright interior showing the lake through the
  // glass wall, then laid tables and the daytime exterior. Several source shots
  // are night-lit with seasonal decor, so they sit at the back rather than in the hero.
  const PREFERRED = ['res-4', 'rest-1', 'resturant', 'res-exterior-3', 'res-exterior-4', '8']
  const rank = (m: Media) => {
    const name = (m.filename ?? '').replace(/\.[a-z]+$/i, '')
    const i = PREFERRED.indexOf(name)
    return i === -1 ? PREFERRED.length + 1 : i
  }
  const ordered = [...allRest].sort((a, b) => rank(a) - rank(b))
  const hero = ordered[0]
  // Only the curated shots go in the editorial grid — the remaining source
  // photos are night-lit with seasonal decor and stay in the Gallery instead.
  const restPhotos = ordered.filter((m) => rank(m) < PREFERRED.length)

  const signatures = entries.filter((e) => e.signature).slice(0, 3)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          name: 'SaltBox Café & Restaurant',
          servesCuisine: ['Rajasthani', 'North Indian', 'Chinese', 'Italian'],
          url: `${SITE_URL}/cafe`,
          telephone: settings.phone ?? undefined,
          address: {
            '@type': 'PostalAddress',
            streetAddress: settings.address ?? undefined,
            addressRegion: 'Rajasthan',
            addressCountry: 'IN',
          },
          priceRange: '₹₹',
          hasMenu: `${SITE_URL}/cafe#menu`,
        }}
      />

      {/* ── Hero ── */}
      <section className="relative min-h-[68vh] overflow-hidden">
        <Parallax className="absolute inset-0" strength={60}>
          <PayloadImage media={hero as never} fill priority sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/45 to-charcoal/25" />
        <div className="container-page relative flex min-h-[68vh] items-end pb-16 pt-32">
          <Reveal className="max-w-2xl text-ivory">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand-400">
              SaltBox Café &amp; Restaurant
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-serif)] text-[length:var(--text-hero)] leading-[var(--text-hero--line-height)]">
              Local flavours.
              <br />
              Open skies.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ivory/85">
              From Rajasthani classics to global comfort food — every meal crafted with local
              produce and served with a view of the salt lake.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Intro + signature dishes ── */}
      <section className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <PaperTexture opacity={0.35} />
        <ArtAccent art="grass" className="-left-10 bottom-0 hidden w-56 lg:block" opacity={0.5} />
        <div className="container-page relative">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <Reveal>
              <p className="eyebrow mb-3">The kitchen</p>
              <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
                Cooked fresh, eaten slowly
              </h2>
              <p className="mt-5 text-lg text-muted">
                Our kitchen works with local produce and Rajasthani recipes — the slow-cooked Laal
                Maas, dal baati churma, and a long list of vegetarian favourites. There is Chinese,
                Italian and comfort food too, so every traveller finds something familiar.
              </p>
              <ul className="mt-7 flex flex-wrap gap-3">
                {['In-tent dining', 'Private dining', 'Bonfire evenings', 'Pure veg options'].map(
                  (t) => (
                    <li
                      key={t}
                      className="rounded-full border border-sand-400/70 px-4 py-2 text-sm text-charcoal"
                    >
                      {t}
                    </li>
                  ),
                )}
              </ul>
              {settings.businessHours ? (
                <p className="mt-6 text-sm text-muted">{settings.businessHours}</p>
              ) : null}
            </Reveal>

            <Reveal direction="left" delay={120}>
              <div className="grid grid-cols-2 gap-4">
                {restPhotos.slice(1, 5).map((p, i) => (
                  <div
                    key={i}
                    className={cnAspect(i)}
                  >
                    <PayloadImage
                      media={p as never}
                      fill
                      sizes="(max-width:1024px) 45vw, 22vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {signatures.length > 0 && (
            <div className="mt-20">
              <OrnamentBand className="mb-4" opacity={0.7} />
              <h3 className="text-center font-[family-name:var(--font-serif)] text-3xl">
                Our signature dishes
              </h3>

              <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
                {/* Hero dish photo */}
                <Reveal direction="right">
                  <figure className="relative overflow-hidden rounded-2xl">
                    <Image
                      src="/food/laal-maas.jpg"
                      alt="Laal Maas — slow-cooked Rajasthani red mutton curry, served in a brass handi"
                      width={1600}
                      height={1200}
                      sizes="(max-width:1024px) 100vw, 55vw"
                      className="h-full w-full object-cover"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/85 to-transparent p-6 text-ivory">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sand-400">
                        The one to order
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-serif)] text-2xl">Laal Maas</p>
                      <p className="mt-1 text-sm text-ivory/85">
                        Slow-cooked heritage red mutton curry — fiery, deep and unmistakably
                        Rajasthani.
                      </p>
                    </figcaption>
                  </figure>
                </Reveal>

                {/* Signature list */}
                <div className="space-y-4">
                  {signatures.map((s, i) => (
                    <Reveal key={s.id} delay={i * 90} direction="left">
                      <div className="flex items-baseline justify-between gap-6 rounded-2xl border border-sand-400/40 bg-white/70 px-6 py-5">
                        <div>
                          <p className="font-[family-name:var(--font-serif)] text-xl">{s.name}</p>
                          <p className="mt-1 text-sm text-muted">{s.category}</p>
                        </div>
                        <p className="flex-shrink-0 font-medium text-red-600">{s.price}</p>
                      </div>
                    </Reveal>
                  ))}
                  <p className="pt-2 text-sm text-muted">
                    Ask our kitchen about the Camp Sambhar Thali — a full spread of Rajasthani
                    classics, best shared at a long table.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Menu ── */}
      <section id="menu" className="relative overflow-hidden bg-ivory pb-[var(--spacing-section)]">
        <TopoPattern opacity={0.05} />
        <div className="container-page relative">
          <Reveal>
            <p className="eyebrow mb-3">The menu</p>
            <h2 className="font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
              {entries.length} dishes, one long table
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Filter by course or dietary preference, or search for a favourite.
            </p>
          </Reveal>

          <div className="mt-10">
            <MenuExplorer categories={categories.map((c) => c.title as string)} items={entries} />
          </div>
        </div>
      </section>

      {/* ── Kitchen strip ── */}
      {kitchenPhotos.length > 0 && (
        <>
          <WaveDivider fill="var(--color-sage-500)" />
          <section className="relative overflow-hidden bg-sage-500 py-[var(--spacing-section)] text-ivory">
            <div className="container-page">
              <Reveal>
                <h2 className="max-w-lg font-[family-name:var(--font-serif)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)]">
                  From our kitchen to your table
                </h2>
              </Reveal>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kitchenPhotos.slice(0, 4).map((p, i) => (
                  <Reveal key={i} delay={i * 80} direction="scale">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <PayloadImage
                        media={p as never}
                        fill
                        sizes="(max-width:1024px) 50vw, 25vw"
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
      )}

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-ivory pb-[var(--spacing-section)]">
        <ArtAccent art="salt-crystals" className="-right-6 top-0 hidden w-64 lg:block" opacity={0.55} />
        <div className="container-page relative max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl">Dining, your way</h2>
          <p className="mt-4 text-muted">
            Order to your tent, join us in the restaurant, or ask about a private dinner under the
            stars beside the bonfire.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-red-500 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              Enquire about private dining
            </Link>
            <Link
              href="/stay"
              className="rounded-full border border-charcoal px-8 py-4 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-ivory"
            >
              See our stays
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

/** Stagger the photo grid so it feels hand-placed rather than gridded. */
function cnAspect(i: number) {
  const base = 'relative overflow-hidden rounded-xl'
  const shapes = ['aspect-[4/5]', 'aspect-square mt-8', 'aspect-square -mt-8', 'aspect-[4/5]']
  return `${base} ${shapes[i % shapes.length]}`
}
