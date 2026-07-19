import { getPayload } from 'payload'
import config from '@payload-config'
import type { Config } from '../payload-types'

/**
 * Cached Payload instance for use in Server Components and route handlers.
 * Uses the Local API — no network hop, direct DB access.
 */
export const getPayloadClient = async () => getPayload({ config })

export type CollectionSlug = keyof Config['collections']
