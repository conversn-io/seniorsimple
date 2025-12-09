/**
 * Booking confirmation store using CallReady Quiz Database (Supabase).
 * 
 * Persistent across serverless instances, suitable for production.
 * Uses booking_confirmations table with 15-minute TTL.
 * 
 * Uses CallReady Quiz DB (jqjftrlnyysqcwbbigpw) since this is lead/funnel data.
 */

import { callreadyQuizDb } from './callready-quiz-db'

type BookingRecord = {
  email?: string
  phone?: string
  name?: string
  createdAt: number
  source?: string
  payload?: any
}

const TTL_MINUTES = 15

function getKey(identifier: string): string {
  return identifier.toLowerCase().trim()
}

/**
 * Record a booking confirmation
 */
export async function recordBooking(key: string, data: Omit<BookingRecord, 'createdAt'>): Promise<void> {
  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + TTL_MINUTES * 60 * 1000)
    
    const record = {
      key: getKey(key),
      email: data.email?.toLowerCase().trim() || null,
      phone: data.phone?.trim() || null,
      name: data.name?.trim() || null,
      source: data.source || 'webhook',
      payload: data.payload || {},
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }
    
    // Use upsert to handle duplicates (ON CONFLICT key DO UPDATE)
    const { error } = await callreadyQuizDb
      .from('booking_confirmations')
      .upsert(record, {
        onConflict: 'key',
      })
    
    if (error) {
      console.error('❌ Error storing booking in Supabase:', error)
      throw error
    }
    
    console.log(`✅ Stored booking confirmation in Supabase: ${record.key}`)
  } catch (error) {
    console.error('❌ Error storing booking confirmation:', error)
    throw error
  }
}

/**
 * Get booking confirmation record
 */
export async function getBooking(key: string): Promise<BookingRecord | null> {
  try {
    // Use maybeSingle() instead of single() to handle "no rows found" gracefully
    // single() returns 406 when no rows found, maybeSingle() returns null
    const { data, error } = await callreadyQuizDb
      .from('booking_confirmations')
      .select('*')
      .eq('key', getKey(key))
      .gt('expires_at', new Date().toISOString()) // Only get non-expired records
      .maybeSingle()
    
    if (error) {
      console.error('❌ Error getting booking from Supabase:', error)
      return null
    }
    
    if (!data) {
      // No record found (maybeSingle returns null when no rows)
      return null
    }
    
    // Convert Supabase record to BookingRecord format
    return {
      email: data.email || undefined,
      phone: data.phone || undefined,
      name: data.name || undefined,
      createdAt: new Date(data.created_at).getTime(),
      source: data.source || undefined,
      payload: data.payload || {},
    }
  } catch (error) {
    console.error('❌ Error getting booking confirmation:', error)
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
    console.error('❌ Error checking booking in Supabase:', error)
    return false
  }
}

/**
 * Clear/delete booking confirmation
 */
export async function clearBooking(key: string): Promise<void> {
  try {
    const { error } = await callreadyQuizDb
      .from('booking_confirmations')
      .delete()
      .eq('key', getKey(key))
    
    if (error) {
      console.error('❌ Error deleting booking from Supabase:', error)
      throw error
    }
    
    console.log(`🗑️  Deleted booking confirmation from Supabase: ${getKey(key)}`)
  } catch (error) {
    console.error('❌ Error deleting booking confirmation:', error)
    throw error
  }
}
