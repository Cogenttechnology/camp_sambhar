import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: { read: () => true },
  admin: {
    description: 'Global brand, contact, SEO, and integration settings used across the whole site.',
    group: 'Settings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            { name: 'siteName', type: 'text', defaultValue: 'Camp Sambhar Resort' },
            { name: 'tagline', type: 'text', defaultValue: 'A nature escape on the salt lake.' },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'logoLight', type: 'upload', relationTo: 'media', admin: { description: 'Logo for dark backgrounds.' } },
            {
              name: 'announcementBar',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: false },
                { name: 'text', type: 'text' },
                { name: 'link', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'phone', type: 'text' },
            { name: 'whatsappNumber', type: 'text', admin: { description: 'International format, digits only, e.g. 919812345678.' } },
            { name: 'email', type: 'email' },
            { name: 'address', type: 'textarea' },
            {
              name: 'businessHours',
              type: 'text',
              admin: { description: 'e.g. Café open 7:00 AM – 10:30 PM' },
            },
            {
              name: 'socials',
              type: 'array',
              labels: { singular: 'Social link', plural: 'Social links' },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  options: ['Instagram', 'Facebook', 'Twitter', 'YouTube', 'LinkedIn'],
                  required: true,
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Location',
          fields: [
            { name: 'mapLat', type: 'number', label: 'Latitude', admin: { step: 0.000001 } },
            { name: 'mapLng', type: 'number', label: 'Longitude', admin: { step: 0.000001 } },
            {
              name: 'mapEmbedUrl',
              type: 'text',
              label: 'Google Maps embed URL',
              admin: { description: 'The src URL from a Google Maps "Embed a map" iframe.' },
            },
            { name: 'directions', type: 'textarea', admin: { description: 'How to reach us — shown on Contact.' } },
          ],
        },
        {
          label: 'Booking',
          fields: [
            {
              name: 'stayflexiPropertyId',
              type: 'text',
              label: 'Stayflexi property ID',
              admin: { description: 'Property/hotel ID for the Stayflexi booking widget.' },
            },
            {
              name: 'stayflexiBookingUrl',
              type: 'text',
              label: 'Stayflexi booking URL',
              admin: { description: 'Fallback booking engine URL if the embed cannot load.' },
            },
          ],
        },
        {
          label: 'SEO defaults',
          fields: [
            { name: 'defaultMetaDescription', type: 'textarea', maxLength: 200 },
            { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
            { name: 'googleBusinessProfileUrl', type: 'text' },
            { name: 'priceRange', type: 'text', defaultValue: '₹₹₹', admin: { description: 'For LodgingBusiness structured data.' } },
          ],
        },
      ],
    },
  ],
}
