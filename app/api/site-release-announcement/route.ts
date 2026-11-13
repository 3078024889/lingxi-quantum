import {NextResponse} from "next/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
// Public notice stays off by default. Enable only after production gates and
// actual domain/login acceptance, never from preview/CI build variables.
export function GET(){
  const enabled=process.env.LINGXI_RELEASE_NOTICE_ENABLED==="1";
  return NextResponse.json({enabled,version:"2026-11-06-site-upgrade",site:"main"},
    {headers:{"Cache-Control":"no-store, max-age=0","X-Content-Type-Options":"nosniff"}});
}
