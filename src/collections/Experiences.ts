import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  labels: { singular: 'Experience', plural: 'Experiences' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'order'],
    description: 'Activities: bird watching, village tour, salt making, stargazing, and more.',
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
              defaultValue: 'nature',
              options: [
                { label: 'Wildlife & Nature', value: 'nature' },
                { label: 'Astronomy', value: 'astronomy' },
                { label: 'Culture & Heritage', value: 'culture' },
                { label: 'Adventure', value: 'adventure' },
              ],
            },
            {
              name: 'teaser',
              type: 'textarea',
              required: true,
              admin: { description: 'Short hook for cards and the experiences grid.' },
            },
            { name: 'description', type: 'richText' },
            { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
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
                { name: 'duration', type: 'text', admin: { placeholder: 'e.g. 2–3 hours' } },
                { name: 'bestTime', type: 'text', label: 'Best time', admin: { placeholder: 'e.g. Nov–Feb, early morning' } },
                {
                  name: 'difficulty',
                  type: 'select',
                  options: [
                    { label: 'Easy', value: 'easy' },
                    { label: 'Moderate', value: 'moderate' },
                    { label: 'Challenging', value: 'challenging' },
                  ],
                },
              ],
            },
            {
              name: 'highlights',
              type: 'array',
              labels: { singular: 'Highlight', plural: 'Highlights' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'whatToBring',
              type: 'array',
              labels: { singular: 'Item', plural: 'What to bring' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'relatedExperiences',
              type: 'relationship',
              relationTo: 'experiences',
              hasMany: true,
              admin: { description: 'Suggested related activities.' },
            },
          ],
        },
      ],
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
