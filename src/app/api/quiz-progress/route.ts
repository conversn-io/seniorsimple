import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/quiz-progress
 * Logs quiz step answers to Vercel runtime logs for real-time abandonment diagnosis.
 * Fire-and-forget from client — no DB writes, just structured console output.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, funnelType, step, stepName, answer, totalSteps, meta } = body;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    const ua = request.headers.get('user-agent') || '';

    console.log(`📋 QUIZ ${funnelType} step=${step}/${totalSteps} "${stepName}" answer="${answer}" session=${sessionId} ip=${ip}`, meta ? JSON.stringify(meta) : '');

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail
  }
}
