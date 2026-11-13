import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export const runtime="nodejs";
// No pop-up on preview or unverified deployment. Operated via ECS systemd only.
export function GET(){
 const enabled=process.env.GLOBALSIAI_RELEASE_NOTICE_ENABLED==="1";
 return NextResponse.json({enabled,version:"2026-11-06-global-siai-dual-domain",site:"market"},
  {headers:{"Cache-Control":"no-store, max-age=0","X-Content-Type-Options":"nosniff"}});
}
