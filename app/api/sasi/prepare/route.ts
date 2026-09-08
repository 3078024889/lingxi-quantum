import { NextResponse } from "next/server";
import { createProjectProposal } from "@/lib/sasi/project-proposal";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  const result = createProjectProposal(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ kind: result.kind, status: "prepared", stages: result.stages, ...result.proposal });
}
