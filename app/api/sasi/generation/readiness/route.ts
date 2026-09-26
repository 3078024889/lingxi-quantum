import {NextResponse} from "next/server";import {sovereignGenerationReadiness} from "@/lib/sasi/sovereign-generation/readiness";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json(sovereignGenerationReadiness(),{headers:{"Cache-Control":"no-store"}})}
