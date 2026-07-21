import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '../../../../lib/payload'
import { getSiteSettings } from '../../../../lib/queries'
import { buildMetadata } from '../../../../lib/seo'
import { PageHero } from '../../../../components/layout/PageHero'
import { RichText } from '../../../../components/RichText'
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from '../../../../lib/jsonld'
import {
  ArtAccent,
  DropCap,
  Ornament,
  OrnamentBand,
  PaperTexture,
} from '../../../../components/ui/Nature'
import type { BlogPost, Team } from '../../../../payload-types'

export const revalidate = 3600

async function getPost(slug: string): Promise<BlogPost | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { _status: { equals: 'published' } },
    limit: 100,
    depth: 0,
  })
  return docs.map((p) => ({ slug: p.slug as string }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  const settings = await getSiteSettings()
  if (!post) return {}
  return buildMetadata(
    {
      title: post.title,
      description: post.excerpt,
      image: post.coverImage as never,
      path: `/blog/${post.slug}`,
      meta: (post as { meta?: never }).meta,
    },
    settings,
  )
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const author = typeof post.author === 'object' ? (post.author as Team) : null
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <>
      <PageHero eyebrow="Journal" title={post.title} intro={post.excerpt} image={post.coverImage as never} />

      <JsonLd
        data={articleJsonLd({
          title: post.title,
          excerpt: post.excerpt,
          path: `/blog/${post.slug}`,
          image: post.coverImage as never,
          publishedAt: post.publishedAt,
          authorName: author?.name,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Journal', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <article className="relative overflow-hidden bg-ivory py-[var(--spacing-section)]">
        <PaperTexture opacity={0.3} />
        <ArtAccent
          art="curlew"
          className="-left-20 top-24 hidden w-56 lg:block"
          opacity={0.2}
        />
        <ArtAccent
          art="grass"
          className="-right-16 bottom-24 hidden w-52 lg:block"
          opacity={0.22}
        />
        <div className="container-page relative max-w-2xl">
          <div className="mb-8 flex items-center gap-3 text-sm text-muted">
            {author ? <span>By {author.name}</span> : null}
            {author && dateStr ? <span>·</span> : null}
            {dateStr ? <time dateTime={post.publishedAt ?? undefined}>{dateStr}</time> : null}
          </div>

          <Ornament className="mb-8 text-charcoal" />

          {/* Drop-capped standfirst — sets an editorial tone before the body. */}
          {post.excerpt ? (
            <DropCap className="mb-8 font-[family-name:var(--font-serif)] text-xl leading-relaxed text-charcoal/90">
              {post.excerpt}
            </DropCap>
          ) : null}

          <div className="prose-body">
            <RichText data={post.body as never} />
          </div>

          <Ornament className="mt-12 text-charcoal" />

          <div className="mt-6 border-t border-sand-400/40 pt-6">
            <Link href="/blog" className="text-sm font-medium text-red-600 hover:underline">
              ← All journal entries
            </Link>
          </div>
        </div>
        <OrnamentBand className="relative mt-12" opacity={0.5} />
      </article>
    </>
  )
}
