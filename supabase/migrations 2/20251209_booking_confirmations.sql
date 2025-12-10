-- Create booking_confirmations table for webhook storage
-- Used to store GHL appointment booking confirmations temporarily (15min TTL)

CREATE TABLE IF NOT EXISTS booking_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- email or phone (lowercase)
  email TEXT,
  phone TEXT,
  name TEXT,
  source TEXT DEFAULT 'webhook',
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- Index for fast lookups by key
CREATE INDEX IF NOT EXISTS idx_booking_confirmations_key ON booking_confirmations(key);
CREATE INDEX IF NOT EXISTS idx_booking_confirmations_expires_at ON booking_confirmations(expires_at);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_booking_confirmations_email ON booking_confirmations(email) WHERE email IS NOT NULL;

-- Function to automatically clean up expired records
CREATE OR REPLACE FUNCTION cleanup_expired_booking_confirmations()
RETURNS void AS $$
BEGIN
  DELETE FROM booking_confirmations WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired records (if pg_cron is available)
-- SELECT cron.schedule('cleanup-booking-confirmations', '*/5 * * * *', 'SELECT cleanup_expired_booking_confirmations();');

-- RLS Policy (if needed - adjust based on your security requirements)
ALTER TABLE booking_confirmations ENABLE ROW LEVEL SECURITY;

-- Allow service role to read/write (for API routes)
CREATE POLICY "Service role can manage booking confirmations"
  ON booking_confirmations
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow anon to read (for polling endpoint - adjust if you want more security)
CREATE POLICY "Anon can read booking confirmations"
  ON booking_confirmations
  FOR SELECT
  USING (true);

