import type { Field } from 'payload'

/** Turn a title into a URL-safe slug. */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * A slug field that auto-fills from a source field (default: `title`) on create,
 * but stays editable. Indexed for fast lookups on public routes.
 */
export const slugField = (source = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'URL path segment. Auto-generated from the title; edit with care once published.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const src = data?.[source]
        if (typeof src === 'string' && src.length > 0) return slugify(src)
        return value
      },
    ],
  },
})
