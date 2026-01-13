import { NextRequest, NextResponse } from 'next/server'
import { getIndexNowKey } from '@/lib/indexnow'

/**
 * IndexNow Key File Route
 * 
 * This route serves the IndexNow key file for ownership verification.
 * Accessible at: https://seniorsimple.org/api/indexnow/key
 * 
 * The key file should also be accessible at the root: https://seniorsimple.org/{key}.txt
 * This can be configured via Vercel rewrites or by hosting a static file.
 * 
 * Documentation: https://www.indexnow.org/documentation
 */
export async function GET(request: NextRequest) {
  const indexNowKey = getIndexNowKey()

  // Return the key as plain text (UTF-8 encoded)
  // This matches the IndexNow specification requirement
  return new NextResponse(indexNowKey, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}





