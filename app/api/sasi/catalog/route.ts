import { NextResponse } from "next/server";
import { CREDIT_PACKS, SASI_CAPABILITIES, SASI_QUALITY_TIERS, SASI_SKILLS } from "@/lib/sasi/catalog";

export function GET() {
  return NextResponse.json({ creditPacks: CREDIT_PACKS, qualityTiers: SASI_QUALITY_TIERS, capabilities: SASI_CAPABILITIES, skills: SASI_SKILLS });
}
