import type { CollectionConfig } from 'payload'

/** Admin / staff accounts for the Payload dashboard. */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Staff who can log in to manage content.',
    group: 'Settings',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}
