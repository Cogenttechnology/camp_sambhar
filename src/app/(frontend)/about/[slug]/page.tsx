import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '../../../../lib/payload'
import { getSiteSettings } from '../../../../lib/queries'
import { buildMetadata } from '../../../../lib/seo'
import { PageHero } from '../../../../components/layout/PageHero'
import { RenderBlocks } from '../../../../components/blocks/RenderBlocks'
import { JsonLd, breadcrumbJsonLd } from '../../../../lib/jsonld'
import {
  ArtAccent,
  Ornament,
  OrnamentBand,
  PaperTexture,
} from '../../../../components/ui/Nature'
import type { Page } from '../../../../payload-types'

export const revalidate = 3600

async function getPage(slug: string): Promise<Page | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    limit: 100,
    depth: 0,
    where: { slug: { not_equals: 'about' } },
  })
  return docs.map((p) => ({ slug: p.slug as string }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  const settings = await getSiteSettings()
  if (!page) return {}
  return buildMetadata(
    {
      title: page.title,
      description: page.intro,
      image: page.heroImage as never,
      path: `/about/${page.slug}`,
      meta: (page as { meta?: never }).meta,
    },
    settings,
  )
}

export default async function AboutSubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <>
      <PageHero eyebrow="About" title={page.title} intro={page.intro} image={page.heroImage as never} />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: page.title, path: `/about/${page.slug}` },
        ])}
      />

      <div className="relative overflow-hidden">
        <ArtAccent
          art="acacia-khejri"
          className="-left-20 top-32 hidden w-56 lg:block"
          opacity={0.22}
        />
        <ArtAccent
          art="camel"
          className="-right-20 bottom-40 hidden w-56 lg:block"
          opacity={0.2}
          flip
        />
        <div className="relative">
          <RenderBlocks blocks={page.layout} />
        </div>
      </div>

      <section className="relative overflow-hidden bg-ivory pb-[var(--spacing-section)] pt-6">
        <PaperTexture opacity={0.3} />
        <div className="container-page relative">
          <Ornament className="mb-8 text-charcoal" />
          <Link href="/about" className="text-sm font-medium text-red-600 hover:underline">
            ← About Camp Sambhar
          </Link>
        </div>
        <OrnamentBand className="relative mt-12" opacity={0.5} />
      </section>
    </>
  )
}
