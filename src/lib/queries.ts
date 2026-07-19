import { unstable_cache } from 'next/cache'
import { getPayloadClient } from './payload'
import type { SiteSetting } from '../payload-types'

/**
 * Site settings are needed on every page (nav, footer, contact, SEO defaults).
 * Cached and tagged so a CMS edit can revalidate it.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSetting> => {
    const payload = await getPayloadClient()
    return payload.findGlobal({ slug: 'site-settings', depth: 1 })
  },
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 3600 },
)
