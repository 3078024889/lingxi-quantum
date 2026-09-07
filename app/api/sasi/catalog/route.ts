import { NextResponse } from "next/server";
import { CREDIT_PACKS, POINTS_PER_RMB, SASI_PROVIDERS, SASI_QUALITY_TIERS, SASI_SKILLS } from "@/lib/sasi/catalog";

export function GET() {
  return NextResponse.json({ pointsPerRmb: POINTS_PER_RMB, creditPacks: CREDIT_PACKS, qualityTiers: SASI_QUALITY_TIERS, providers: SASI_PROVIDERS, skills: SASI_SKILLS });
}
