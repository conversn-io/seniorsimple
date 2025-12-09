# Vercel KV Setup for Booking Confirmation Store

The booking confirmation webhook now uses Vercel KV (Redis) for persistent storage across serverless instances.

## Setup Steps

1. **Create Vercel KV Database:**
   - Go to Vercel Dashboard → Your Project → Storage
   - Click "Create Database" → Select "KV"
   - Choose a name (e.g., `seniorsimple-kv`)
   - Select a region (preferably close to your deployment region)

2. **Environment Variables (Auto-configured):**
   - Vercel automatically sets `KV_URL` and `KV_REST_API_TOKEN` when you link the KV database
   - These are automatically detected by `@vercel/kv` package
   - No manual configuration needed!

3. **Link KV to Your Project:**
   - In Vercel Dashboard → Your Project → Storage → Your KV Database
   - Click "Link to Project" → Select your SeniorSimple project
   - Vercel will automatically add the environment variables

4. **Verify Setup:**
   - After linking, redeploy your project (or push a new commit)
   - The webhook endpoint will automatically use KV storage
   - Check Vercel logs to confirm KV connection

## How It Works

- **Storage Key Format:** `booking:confirm:{email|phone}`
- **TTL:** 15 minutes (auto-expires)
- **Persistent:** Works across all serverless function instances
- **No Instance Isolation:** POST and GET can hit different instances, data persists

## Testing

After setup, test the webhook:
1. Trigger a GHL webhook POST
2. Poll the GET endpoint
3. Data should persist even if POST and GET hit different instances

## Troubleshooting

If you see KV connection errors:
- Verify KV database is linked to your project
- Check environment variables are set in Vercel Dashboard
- Ensure `@vercel/kv` package is installed (`npm install @vercel/kv`)
- Check Vercel logs for specific error messages

