import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  labels: { singular: 'Room', plural: 'Rooms / Stays' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'priceFrom', 'order'],
    description: 'Accommodation categories shown on the Stay page.',
    group: 'Stay & Experiences',
  },
  defaultSort: 'order',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true },
            slugField(),
            {
              name: 'category',
              type: 'select',
              required: true,
              defaultValue: 'luxury-tent',
              options: [
                { label: 'Luxury Tent', value: 'luxury-tent' },
                { label: 'Cottage', value: 'cottage' },
                { label: 'Suite', value: 'suite' },
                { label: 'Family Tent', value: 'family-tent' },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              required: true,
              admin: { description: 'One or two sentences for cards and previews.' },
            },
            { name: 'description', type: 'richText' },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'gallery',
              type: 'array',
              labels: { singular: 'Photo', plural: 'Gallery' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'maxAdults', type: 'number', defaultValue: 2, min: 1 },
                { name: 'maxChildren', type: 'number', defaultValue: 0, min: 0 },
                { name: 'sizeSqft', type: 'number', label: 'Size (sq ft)' },
              ],
            },
            {
              name: 'priceFrom',
              type: 'number',
              label: 'Price from (₹ / night)',
              admin: { description: 'Indicative starting price shown as "from ₹…". Live rates come from Stayflexi.' },
            },
            {
              name: 'amenities',
              type: 'array',
              labels: { singular: 'Amenity', plural: 'Amenities' },
              fields: [{ name: 'label', type: 'text', required: true }],
            },
            {
              name: 'stayflexiRoomId',
              type: 'text',
              admin: { description: 'Maps this room to the Stayflexi booking engine (optional deep-link).' },
            },
          ],
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
}
