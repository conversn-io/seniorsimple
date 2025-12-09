/**
 * Booking confirmation store using Vercel KV (Redis).
 * 
 * Persistent across serverless instances, suitable for production.
 * 
 * Environment variables required:
 * - KV_URL (Vercel KV REST API URL)
 * - KV_REST_API_TOKEN (Vercel KV REST API token)
 * 
 * Or use @vercel/kv which auto-detects from Vercel environment.
 */

import { kv } from '@vercel/kv'

type BookingRecord = {
  email?: string
  phone?: string
  name?: string
  createdAt: number
  source?: string
  payload?: any
}

const TTL_SECONDS = 60 * 15 // 15 minutes
const KEY_PREFIX = 'booking:confirm:'

function getKey(identifier: string): string {
  return `${KEY_PREFIX}${identifier.toLowerCase()}`
}

/**
 * Record a booking confirmation
 */
export async function recordBooking(key: string, data: Omit<BookingRecord, 'createdAt'>): Promise<void> {
  try {
    const record: BookingRecord = {
      ...data,
      createdAt: Date.now(),
    }
    
    const kvKey = getKey(key)
    // Store with TTL (expires after 15 minutes)
    await kv.set(kvKey, record, { ex: TTL_SECONDS })
    
    console.log(`✅ Stored booking confirmation in KV: ${kvKey}`)
  } catch (error) {
    console.error('❌ Error storing booking in KV:', error)
    throw error
  }
}

/**
 * Get booking confirmation record
 */
export async function getBooking(key: string): Promise<BookingRecord | null> {
  try {
    const kvKey = getKey(key)
    const record = await kv.get<BookingRecord>(kvKey)
    
    if (!record) {
      return null
    }
    
    // Check if expired (backup check, though TTL should handle this)
    const now = Date.now()
    const age = now - record.createdAt
    if (age > TTL_SECONDS * 1000) {
      // Expired, delete it
      await kv.del(kvKey)
      return null
    }
    
    return record
  } catch (error) {
    console.error('❌ Error getting booking from KV:', error)
    return null
  }
}

/**
 * Check if booking confirmation exists
 */
export async function hasBooking(key: string): Promise<boolean> {
  try {
    const record = await getBooking(key)
    return record !== null
  } catch (error) {
    console.error('❌ Error checking booking in KV:', error)
    return false
  }
}

/**
 * Clear/delete booking confirmation
 */
export async function clearBooking(key: string): Promise<void> {
  try {
    const kvKey = getKey(key)
    await kv.del(kvKey)
    console.log(`🗑️  Deleted booking confirmation from KV: ${kvKey}`)
  } catch (error) {
    console.error('❌ Error deleting booking from KV:', error)
    throw error
  }
}
