import { NextRequest, NextResponse } from 'next/server';
import { runEightStep } from '@/lib/sasi/drama-eight-step';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/sasi/drama/eight-step  body: { script?: string } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const script = typeof body?.script === 'string' ? body.script : undefined;
    return NextResponse.json(runEightStep(script));
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'eight_step_failed' },
      { status: 500 },
    );
  }
}

/** GET returns sample-script demo */
export async function GET() {
  return NextResponse.json({
    ...runEightStep(),
    usage: 'POST JSON { script } or GET for sample demo',
  });
}
