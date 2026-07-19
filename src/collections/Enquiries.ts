import type { CollectionConfig } from 'payload'

/**
 * Leads captured from the site's enquiry popup and contact form.
 * Created server-side by /api/enquiry — the public cannot read or list them.
 * Staff manage them here as a lightweight CRM.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  access: {
    read: ({ req }) => Boolean(req.user),
    // Creation happens via the local API in the route handler (overrideAccess).
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'phone', 'status', 'createdAt'],
    description: 'Guest enquiries and booking leads.',
    group: 'Leads',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'checkIn', type: 'date' },
        { name: 'checkOut', type: 'date' },
        { name: 'guests', type: 'number', min: 1 },
      ],
    },
    { name: 'interest', type: 'text', admin: { description: 'What the guest is interested in (room, experience, dining).' } },
    { name: 'message', type: 'textarea' },
    { name: 'sourcePage', type: 'text', admin: { readOnly: true } },
  ],
}
