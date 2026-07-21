import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '../../../lib/payload'
import { getSiteSettings } from '../../../lib/queries'
import { buildMetadata } from '../../../lib/seo'
import { PageHero } from '../../../components/layout/PageHero'
import { ArtAccent, PaperTexture, TopoPattern, TornEdge } from '../../../components/ui/Nature'
import { PayloadImage } from '../../../components/PayloadImage'
import { Reveal } from '../../../components/ui/Reveal'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(
    {
      title: 'Journal',
      description: 'Stories, guides, and field notes from Sambhar Lake — flamingo seasons, salt heritage, and stargazing nights.',
      path: '/blog',
    },
    settings,
  )
}

export default async function BlogPage() {
  const payload = await getPayloadClient()
  const { docs: posts } = await payload.find({
    collection: 'blog-posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    depth: 1,
    limit: 30,
  })

  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Field notes from Sambhar"
        intro="Stories, guides, and quiet observations from the salt lake."
        art="curlew"
      />

      <TornEdge fill="var(--color-ivory)" />

      <section className="relative overflow-hidden bg-blush pb-[var(--spacing-section)] pt-10">
        <PaperTexture opacity={0.35} />
        <TopoPattern opacity={0.05} />
        <ArtAccent art="acacia-khejri" className="-right-16 bottom-10 hidden w-56 lg:block" opacity={0.28} />
        <ArtAccent art="grass" className="-left-12 top-16 hidden w-44 lg:block" opacity={0.26} />
        <div className="container-page relative grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 80}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <PayloadImage
                    media={post.coverImage as never}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h2 className="mt-4 font-[family-name:var(--font-serif)] text-xl">{post.title}</h2>
                <p className="mt-2 text-sm text-muted line-clamp-2">{post.excerpt}</p>
                <span className="eyebrow mt-3 inline-block">Read more →</span>
              </Link>
            </Reveal>
          ))}
          {posts.length === 0 && <p className="text-muted">New stories are on the way.</p>}
        </div>
      </section>
    </>
  )
}
