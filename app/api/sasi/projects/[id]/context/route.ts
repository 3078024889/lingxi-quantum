import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
const MAX_ASSETS=20;
const TOTAL_CONTEXT_CHARS=24_000;
const PER_DOCUMENT_MAX=8_000;

function balancedExcerpts(rows:Array<{id:string;original_name:string;extracted_text:string|null}>){
  const usable=rows.map(row=>({...row,text:String(row.extracted_text??"").trim()})).filter(row=>row.text);
  if(!usable.length)return[];
  const fair=Math.max(800,Math.min(PER_DOCUMENT_MAX,Math.floor(TOTAL_CONTEXT_CHARS/usable.length)));
  let used=0;
  const docs=[];
  for(const row of usable){
    const budget=Math.min(PER_DOCUMENT_MAX,fair,TOTAL_CONTEXT_CHARS-used);
    if(budget<=0)break;
    const text=row.text.slice(0,budget);
    used+=text.length;
    docs.push({id:row.id,name:row.original_name,text,truncated:text.length<row.text.length});
  }
  // Redistribute unused capacity to documents that were longer than their fair share.
  if(used<TOTAL_CONTEXT_CHARS){
    for(const doc of docs){
      if(used>=TOTAL_CONTEXT_CHARS)break;
      const source=usable.find(x=>x.id===doc.id);
      if(!source||!doc.truncated)continue;
      const room=Math.min(PER_DOCUMENT_MAX-doc.text.length,TOTAL_CONTEXT_CHARS-used);
      if(room<=0)continue;
      doc.text=source.text.slice(0,doc.text.length+room);
      used+=room;
      doc.truncated=doc.text.length<source.text.length;
    }
  }
  return docs;
}

export async function GET(request:NextRequest, props:{params: Promise<{id:string}>}) {
  const params = await props.params;
  const db=createClient();
  const {data:{user}}=await db.auth.getUser();
  const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
  if(!user)return reply({error:"AUTH_REQUIRED"},401);
  if(!/^[0-9a-f-]{36}$/i.test(params.id))return reply({error:"INVALID_PROJECT"},400);
  const {data:project,error:projectError}=await db.from("sasi_projects").select("id").eq("id",params.id).eq("user_id",user.id).maybeSingle();
  if(projectError||!project)return reply({error:"PROJECT_NOT_FOUND"},404);
  const ids=request.nextUrl.searchParams.getAll("assetId");
  if(ids.length>MAX_ASSETS||ids.some(id=>!/^[0-9a-f-]{36}$/i.test(id)))return reply({error:"INVALID_ASSETS"},400);
  let query=db.from("sasi_assets")
    .select("id,original_name,extracted_text")
    .eq("user_id",user.id).eq("project_id",params.id).eq("status","ready")
    .order("created_at").limit(MAX_ASSETS);
  if(ids.length)query=query.in("id",ids);
  const {data,error}=await query;
  if(error)return reply({error:"CONTEXT_UNAVAILABLE"},503);
  const documents=balancedExcerpts(data??[]);
  return reply({documents,contextCharacters:documents.reduce((n,x)=>n+x.text.length,0),maxContextCharacters:TOTAL_CONTEXT_CHARS});
}
