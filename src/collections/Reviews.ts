import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Review', plural: 'Reviews' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'rating', 'source', 'featured'],
    description: 'Curated guest testimonials. Paste your best real Google reviews here.',
    group: 'Content',
  },
  defaultSort: '-date',
  fields: [
    { name: 'authorName', type: 'text', required: true },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
    },
    { name: 'text', type: 'textarea', required: true },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'google',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'TripAdvisor', value: 'tripadvisor' },
        { label: 'Direct / Guestbook', value: 'direct' },
      ],
    },
    { name: 'sourceUrl', type: 'text', admin: { description: 'Optional link to the original review.' } },
    { name: 'date', type: 'date' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show on the homepage reviews section.' },
    },
  ],
}
