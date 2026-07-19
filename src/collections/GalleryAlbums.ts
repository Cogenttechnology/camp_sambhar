import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const GalleryAlbums: CollectionConfig = {
  slug: 'gallery-albums',
  labels: { singular: 'Album', plural: 'Gallery' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'order'],
    description: 'Photo albums grouped by theme, shown in the Gallery with a lightbox.',
    group: 'Content',
  },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'category',
      type: 'select',
      defaultValue: 'landscape',
      options: [
        { label: 'Landscape', value: 'landscape' },
        { label: 'Astronomy', value: 'astronomy' },
        { label: 'Wildlife', value: 'wildlife' },
        { label: 'Camp & Stay', value: 'camp' },
        { label: 'Dining', value: 'dining' },
        { label: 'People & Culture', value: 'people' },
      ],
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Photo', plural: 'Photos' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
