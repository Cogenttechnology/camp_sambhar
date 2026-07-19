import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { pageBuilderBlocks } from '../blocks'

/**
 * Flexible marketing pages composed from page-builder blocks.
 * Powers the About cluster: /about/<slug> (sambhar-lake, eco-tourism, csr, our-team)
 * and any future landing pages — all without code changes.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    description: 'Composable marketing pages (About, Sambhar Lake, Eco Tourism, CSR, etc.).',
    group: 'Content',
  },
  versions: { drafts: true },
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
              name: 'intro',
              type: 'textarea',
              admin: { description: 'Short lead paragraph under the page title.' },
            },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            {
              name: 'layout',
              type: 'blocks',
              labels: { singular: 'Section', plural: 'Sections' },
              blocks: pageBuilderBlocks,
            },
          ],
        },
      ],
    },
  ],
}
