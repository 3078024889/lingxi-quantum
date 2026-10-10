import{NextRequest,NextResponse}from"next/server";
import{assertUnifiedCapabilityCatalog,findUnifiedCapabilities}from"@/lib/capabilities/unified-catalog";
import type{SasiMode}from"@/lib/sasi/skills/types";

export const runtime="nodejs";
const MODES=new Set<SasiMode>(["drama","website","book","learning","research"]);

export async function GET(req:NextRequest){
 const query=(req.nextUrl.searchParams.get("q")||"").trim().slice(0,500);
 const rawMode=req.nextUrl.searchParams.get("mode")||"";
 const mode=MODES.has(rawMode as SasiMode)?rawMode as SasiMode:undefined;
 const stats=assertUnifiedCapabilityCatalog();
 if(!query)return NextResponse.json({stats,matches:[]},{headers:{"Cache-Control":"public, max-age=60"}});
 const matches=findUnifiedCapabilities(query,{mode,limit:8}).map(item=>({
  id:item.id,kind:item.kind,title:item.title,execution:item.execution,privacyMode:item.privacyMode??null,score:item.score
 }));
 return NextResponse.json({stats,matches},{headers:{"Cache-Control":"private, no-store"}});
}
