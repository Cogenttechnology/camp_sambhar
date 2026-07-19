import type { MetadataRoute } from 'next'
import { getPayloadClient } from '../lib/payload'
import { SITE_URL } from '../lib/utils'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/stay',
    '/experiences',
    '/cafe',
    '/gallery',
    '/blog',
    '/about',
    '/contact',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }))

  const [rooms, experiences, posts, pages] = await Promise.all([
    payload.find({ collection: 'rooms', limit: 200, depth: 0 }),
    payload.find({ collection: 'experiences', limit: 200, depth: 0 }),
    payload.find({
      collection: 'blog-posts',
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
    }),
    payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' }, slug: { not_equals: 'about' } },
      limit: 200,
      depth: 0,
    }),
  ])

  const dynamic: MetadataRoute.Sitemap = [
    ...rooms.docs.map((d) => ({ url: `${SITE_URL}/stay/${d.slug}`, lastModified: new Date(d.updatedAt) })),
    ...experiences.docs.map((d) => ({ url: `${SITE_URL}/experiences/${d.slug}`, lastModified: new Date(d.updatedAt) })),
    ...posts.docs.map((d) => ({ url: `${SITE_URL}/blog/${d.slug}`, lastModified: new Date(d.updatedAt) })),
    ...pages.docs.map((d) => ({ url: `${SITE_URL}/about/${d.slug}`, lastModified: new Date(d.updatedAt) })),
  ]

  return [...staticRoutes, ...dynamic]
}
