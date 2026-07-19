import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: { singular: 'Blog Post', plural: 'Blog' },
  access: {
    // Only published posts are public; drafts are staff-only.
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'featured', '_status'],
    description: 'Articles and guides — the SEO engine for top-of-funnel search.',
    group: 'Content',
  },
  versions: { drafts: true },
  defaultSort: '-publishedAt',
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
              name: 'excerpt',
              type: 'textarea',
              required: true,
              admin: { description: 'Summary for cards and meta description fallback.' },
            },
            { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
            { name: 'body', type: 'richText' },
          ],
        },
        {
          label: 'Meta',
          fields: [
            {
              name: 'publishedAt',
              type: 'date',
              admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
            },
            { name: 'author', type: 'relationship', relationTo: 'team' },
            {
              name: 'categories',
              type: 'array',
              labels: { singular: 'Category', plural: 'Categories' },
              fields: [{ name: 'label', type: 'text', required: true }],
            },
            {
              name: 'tags',
              type: 'array',
              labels: { singular: 'Tag', plural: 'Tags' },
              fields: [{ name: 'label', type: 'text', required: true }],
            },
            { name: 'featured', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
