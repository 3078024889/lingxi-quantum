import { NextRequest, NextResponse } from 'next/server';
import { planAssembly } from '@/lib/sasi/drama-eight-step';
import { sasiVideoProviderReadiness } from '@/lib/sasi/provider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST/GET: eight-step + clip job plan; reports provider readiness without spending. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const script = typeof body?.script === 'string' ? body.script : undefined;
  const plan = planAssembly(script);
  const readiness = sasiVideoProviderReadiness();
  return NextResponse.json({ ...plan, providerReadiness: readiness });
}

export async function GET() {
  const plan = planAssembly();
  const readiness = sasiVideoProviderReadiness();
  return NextResponse.json({ ...plan, providerReadiness: readiness, usage: 'POST { script }' });
}
