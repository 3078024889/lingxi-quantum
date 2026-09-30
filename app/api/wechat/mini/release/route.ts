import {NextResponse} from "next/server";
import {LINGXIFIELD_RELEASE} from "@/lib/release/version";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
 return NextResponse.json({
  version:LINGXIFIELD_RELEASE.miniProgram,
  release:LINGXIFIELD_RELEASE.release,
  title:LINGXIFIELD_RELEASE.titleZh,
  slogan:LINGXIFIELD_RELEASE.slogan,
  highlights:LINGXIFIELD_RELEASE.highlightsZh,
  publishedAt:LINGXIFIELD_RELEASE.publishedAt
 },{headers:{"Cache-Control":"public, max-age=300, stale-while-revalidate=3600"}});
}
