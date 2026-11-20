import {NextResponse} from "next/server";
import {publicToolSurface} from "@/lib/tools/public-surface";
import {isAnonymousLocalTool} from "@/lib/tools/local-free-tools";

export const dynamic="force-dynamic";
const headers={
 "Access-Control-Allow-Origin":"*",
 "Cache-Control":"public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
 "X-Content-Type-Options":"nosniff"
} as const;

/** Public, read-only directory. Paid, server-metered and non-local tools are excluded. */
export async function GET(){
 const rows=publicToolSurface()
  .filter(tool=>isAnonymousLocalTool(tool)&&/^[a-z0-9-]{1,80}$/.test(tool.slug))
  .map(tool=>({
   slug:tool.slug,
   titleZh:tool.titleZh,
   titleEn:tool.titleEn||tool.titleZh,
   descZh:tool.descZh.slice(0,240),
   descEn:(tool.descEn||tool.descZh).slice(0,240),
   href:tool.href,
   category:tool.category,
   kind:tool.kind,
   access:"anonymous" as const,
   execution:"local" as const
  }));
 return NextResponse.json({
  schemaVersion:1,
  publisher:"LINGXIFIELD",
  title:"Free anonymous local tools",
  site:"https://lingxifield.com/tools",
  total:rows.length,
  rows
 },{headers});
}
