import { getPayloadClient } from './payload'
import { getBirdPhotos } from './birds'

/** Fetch everything the homepage needs in one place. */
export async function getHomeData() {
  const payload = await getPayloadClient()
  const birdPhotos = await getBirdPhotos()

  const [rooms, experiences, reviews, posts] = await Promise.all([
    payload.find({ collection: 'rooms', sort: 'order', limit: 3, depth: 1 }),
    payload.find({ collection: 'experiences', sort: 'order', limit: 4, depth: 1 }),
    payload.find({
      collection: 'reviews',
      where: { featured: { equals: true } },
      sort: '-date',
      limit: 3,
      depth: 1,
    }),
    payload.find({
      collection: 'blog-posts',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 3,
      depth: 1,
    }),
  ])

  return {
    rooms: rooms.docs,
    experiences: experiences.docs,
    reviews: reviews.docs,
    posts: posts.docs,
    birdPhotos,
  }
}
