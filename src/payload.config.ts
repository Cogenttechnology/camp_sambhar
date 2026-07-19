import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Rooms } from './collections/Rooms'
import { Experiences } from './collections/Experiences'
import { BlogPosts } from './collections/BlogPosts'
import { GalleryAlbums } from './collections/GalleryAlbums'
import { MenuCategories, MenuItems } from './collections/Menu'
import { Reviews } from './collections/Reviews'
import { Team } from './collections/Team'
import { Pages } from './collections/Pages'
import { Enquiries } from './collections/Enquiries'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseURI = process.env.DATABASE_URI || 'file:./camp-sambhar.db'
const usePostgres = databaseURI.startsWith('postgres')

// ── Database adapter: Postgres in production, SQLite for zero-setup local dev ──
const dbAdapter = usePostgres
  ? (await import('@payloadcms/db-postgres')).postgresAdapter({
      pool: { connectionString: databaseURI },
    })
  : (await import('@payloadcms/db-sqlite')).sqliteAdapter({
      client: { url: databaseURI },
    })

// ── Storage: S3/R2 when configured, otherwise local disk ──
const s3Configured = Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID)
const storagePlugins = s3Configured
  ? [
      s3Storage({
        collections: { media: { prefix: 'media' } },
        bucket: process.env.S3_BUCKET as string,
        config: {
          region: process.env.S3_REGION || 'auto',
          endpoint: process.env.S3_ENDPOINT || undefined,
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
          },
        },
      }),
    ]
  : []

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Camp Sambhar',
    },
  },
  editor: lexicalEditor(),
  collections: [
    Rooms,
    Experiences,
    BlogPosts,
    GalleryAlbums,
    MenuCategories,
    MenuItems,
    Reviews,
    Team,
    Pages,
    Enquiries,
    Media,
    Users,
  ],
  globals: [SiteSettings],
  db: dbAdapter,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  sharp: (await import('sharp')).default,
  plugins: [
    seoPlugin({
      collections: ['rooms', 'experiences', 'blog-posts', 'pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title || 'Camp Sambhar'} — Camp Sambhar Resort`,
    }),
    ...storagePlugins,
  ],
})
