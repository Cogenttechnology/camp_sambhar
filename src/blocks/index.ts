import type { Block } from 'payload'

/**
 * Page-builder blocks. Staff compose flexible marketing pages (About cluster,
 * Sambhar Lake, Eco Tourism, CSR) from these without touching code.
 */

export const TextBlock: Block = {
  slug: 'textBlock',
  labels: { singular: 'Text', plural: 'Text blocks' },
  fields: [
    { name: 'eyebrow', type: 'text', admin: { description: 'Small label above the heading.' } },
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText' },
    {
      name: 'align',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Centered', value: 'center' },
      ],
    },
  ],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: 'Image + Text', plural: 'Image + Text blocks' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText' },
    {
      name: 'imageSide',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Image left', value: 'left' },
        { label: 'Image right', value: 'right' },
      ],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Stats', plural: 'Stats blocks' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'stats',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        { name: 'value', type: 'text', required: true, admin: { placeholder: 'e.g. 230 km²' } },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'galleryBlock',
  labels: { singular: 'Gallery', plural: 'Gallery blocks' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
  ],
}

export const QuoteBlock: Block = {
  slug: 'quote',
  labels: { singular: 'Quote', plural: 'Quote blocks' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    { name: 'attribution', type: 'text' },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action', plural: 'CTA blocks' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Enquire now' },
    { name: 'buttonUrl', type: 'text', defaultValue: '/contact' },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'sage',
      options: [
        { label: 'Sage', value: 'sage' },
        { label: 'Night sky', value: 'night' },
        { label: 'Sand', value: 'sand' },
      ],
    },
  ],
}

export const pageBuilderBlocks = [
  TextBlock,
  ImageTextBlock,
  StatsBlock,
  GalleryBlock,
  QuoteBlock,
  CtaBlock,
]
