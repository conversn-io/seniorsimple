# Supabase Booking Confirmation Store Setup

The booking confirmation webhook now uses Supabase for persistent storage across serverless instances.

## Setup Steps

1. **Run Migration:**
   ```bash
   # Apply the migration to create booking_confirmations table
   psql $DATABASE_URL -f supabase/migrations/20251209_booking_confirmations.sql
   ```
   
   Or use Supabase Dashboard:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/20251209_booking_confirmations.sql`
   - Run the SQL

2. **Verify Table Created:**
   - Check Supabase Dashboard → Table Editor
   - Should see `booking_confirmations` table
   - Verify indexes are created

3. **Environment Variables (Already Set):**
   - `NEXT_PUBLIC_SUPABASE_URL` - Already configured
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Already configured
   - No additional setup needed!

## How It Works

- **Storage:** Supabase `booking_confirmations` table
- **Key Format:** Lowercase email or phone
- **TTL:** 15 minutes (auto-expires via `expires_at` column)
- **Persistent:** Works across all serverless function instances
- **No Instance Isolation:** POST and GET can hit different instances, data persists

## Table Schema

```sql
booking_confirmations
├── id (UUID, primary key)
├── key (TEXT, unique) - email or phone (lowercase)
├── email (TEXT)
├── phone (TEXT)
├── name (TEXT)
├── source (TEXT) - 'webhook' or other
├── payload (JSONB) - Full webhook payload
├── created_at (TIMESTAMPTZ)
└── expires_at (TIMESTAMPTZ) - Auto-cleanup after 15min
```

## Testing

After migration:
1. Trigger a GHL webhook POST
2. Poll the GET endpoint
3. Data should persist even if POST and GET hit different instances
4. Check Supabase table to verify data is stored

## Cleanup

Expired records are automatically filtered out by queries (using `expires_at` check).
Optional: Set up a cron job to physically delete expired records (see migration file).

