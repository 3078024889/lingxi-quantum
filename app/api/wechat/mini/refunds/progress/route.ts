import { NextResponse } from 'next/server';
import { requireMiniSession } from '@/lib/mini/session';
import { checkRateLimit } from '@/lib/rate-limit';
import { retryVirtualRefunds } from '@/lib/mini/virtual-refund';
import { expireMiniUnpaidOrders } from '@/lib/mini/order-cleanup';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
  if (!session.accountConnected) return NextResponse.json({ error: 'ACCOUNT_CONNECTION_REQUIRED' }, { status: 409 });
  if (!await checkRateLimit('mini-refund-progress:' + session.userId, 120, 3600)) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
  try {
    const refunds = await retryVirtualRefunds(5, session.userId);
    await expireMiniUnpaidOrders(session.userId);
    return NextResponse.json(refunds, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch { return NextResponse.json({ error: 'PROGRESS_UNAVAILABLE' }, { status: 503 }); }
}
