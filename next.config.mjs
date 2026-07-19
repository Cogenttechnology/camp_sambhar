import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow remote images from the object-storage/CDN host (set via env for prod).
  images: {
    remotePatterns: [
      // Local dev / Payload media route
      { protocol: 'http', hostname: 'localhost' },
      // S3 / R2 public bucket host — configured per environment.
      ...(process.env.NEXT_PUBLIC_MEDIA_HOSTNAME
        ? [{ protocol: 'https', hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME }]
        : []),
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
