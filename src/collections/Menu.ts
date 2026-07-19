import type { CollectionConfig } from 'payload'

export const MenuCategories: CollectionConfig = {
  slug: 'menu-categories',
  labels: { singular: 'Menu Category', plural: 'Menu Categories' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order'],
    description: 'Sections of the Saltbox Café menu (e.g. Small Plates, Mains, Desserts).',
    group: 'Saltbox Café',
  },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  labels: { singular: 'Menu Item', plural: 'Menu Items' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'signature', 'available'],
    description: 'Individual dishes on the Saltbox Café menu.',
    group: 'Saltbox Café',
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'menu-categories',
      required: true,
    },
    { name: 'price', type: 'text', admin: { placeholder: 'e.g. ₹450' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'dietary',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Veg', value: 'veg' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Gluten-free', value: 'gf' },
        { label: 'Contains nuts', value: 'nuts' },
        { label: 'Spicy', value: 'spicy' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'signature', type: 'checkbox', label: 'Signature dish', defaultValue: false },
        { name: 'available', type: 'checkbox', defaultValue: true },
      ],
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
