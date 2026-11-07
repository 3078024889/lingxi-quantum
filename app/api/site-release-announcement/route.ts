import {NextResponse} from "next/server";
import {mainSiteReleaseNoticeState} from "@/lib/release/main-site-notice-gate";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export function GET(){
  // NO enablement during CI, preview, standalone public-only Cloudflare builds,
  // partial payment readiness or unaudited domain/identity repairs.
  return NextResponse.json(mainSiteReleaseNoticeState(),{
    headers:{
      "Cache-Control":"private, no-store, max-age=0",
      "X-Content-Type-Options":"nosniff",
    },
  });
}
