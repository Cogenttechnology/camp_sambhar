import type { CollectionConfig } from 'payload'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team Member', plural: 'Team' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
    description: 'People behind Camp Sambhar — shown on the About / Our Team page.',
    group: 'Content',
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'richText' },
    {
      name: 'socials',
      type: 'array',
      labels: { singular: 'Link', plural: 'Social links' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: ['Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'Website'],
          required: true,
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
