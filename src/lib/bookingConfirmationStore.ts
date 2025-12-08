/**
 * In-memory booking confirmation store.
 *
 * NOTE: This is per-server-instance and not durable. For production,
 * replace with a persistent/centralized store (Redis, KV, DB).
 */

type BookingRecord = {
  email?: string
  phone?: string
  name?: string
  createdAt: number
  source?: string
  payload?: any
}

const TTL_MS = 1000 * 60 * 15 // 15 minutes
const store = new Map<string, BookingRecord>()

function cleanupExpired() {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now - value.createdAt > TTL_MS) {
      store.delete(key)
    }
  }
}

export function recordBooking(key: string, data: Omit<BookingRecord, 'createdAt'>) {
  cleanupExpired()
  store.set(key, { ...data, createdAt: Date.now() })
}

export function getBooking(key: string): BookingRecord | null {
  cleanupExpired()
  return store.get(key) || null
}

export function hasBooking(key: string): boolean {
  cleanupExpired()
  return store.has(key)
}

export function clearBooking(key: string) {
  store.delete(key)
}

