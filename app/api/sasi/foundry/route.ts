import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractDirectorKnowledge, normalizeFoundryText, resolveContinuityTimeline, sha256, trainabilityFor, type RightsScope } from "@/lib/sasi/cangxuan-foundry";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function identity() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch { return null; }
}

const RIGHTS = new Set<RightsScope>(["private_reference", "opted_in_training", "open_licensed", "research_only", "blocked"]);
const SOURCE_TYPES = new Set(["conversation_paste", "chatgpt_export", "sasi_native", "licensed_open", "teacher_synthetic"]);

export async function GET() {
  const user = await identity();
  if (!user) return NextResponse.json({ error:"AUTH_REQUIRED" }, { status:401 });
  try {
    const admin = createAdminClient();
    const [sourcesResult, itemsResult, charactersResult, eventsResult] = await Promise.all([
      admin.from("cangxuan_sources").select("id,title,source_type,rights_scope,trainability,character_count,extracted_count,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30),
      admin.from("cangxuan_knowledge_items").select("id,source_id,category,title,statement,tier,trainability,quality_score,review_status,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100),
      admin.from("cangxuan_characters").select("id,project_id,character_key,display_name,permanent_identity,identity_version,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(50),
      admin.from("cangxuan_continuity_events").select("id,character_id,episode,scene,sequence,script_event,state_patch,created_at").eq("user_id",user.id).order("episode").order("scene").order("sequence").limit(500),
    ]);
    for (const result of [sourcesResult,itemsResult,charactersResult,eventsResult]) if (result.error) throw result.error;
    const timelineByCharacter:Record<string,unknown[]> = {};
    for (const character of charactersResult.data ?? []) {
      timelineByCharacter[character.id] = resolveContinuityTimeline((eventsResult.data ?? []).filter((event)=>event.character_id===character.id));
    }
    return NextResponse.json({
      sources:sourcesResult.data ?? [], items:itemsResult.data ?? [], characters:charactersResult.data ?? [],
      timelines:timelineByCharacter,
      boundary:{ rawConversationStored:false, teacherGenerationEnabled:false, visualDatasetEnabled:false, trainingEnabled:false },
    },{headers:{"Cache-Control":"no-store"}});
  } catch(error) {
    console.error("[cangxuan foundry] read unavailable",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"FOUNDRY_FOUNDATION_UNAVAILABLE"},{status:503});
  }
}

export async function POST(request:NextRequest) {
  if(!isSameOriginMutation(request)) return NextResponse.json({error:"ORIGIN_REJECTED"},{status:403});
  const user=await identity();
  if(!user) return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  if(!body||typeof body.action!=="string") return NextResponse.json({error:"INVALID_REQUEST"},{status:400});
  const admin=createAdminClient();

  try {
    if(body.action==="import") {
      const title=typeof body.title==="string"?body.title.trim():"";
      const sourceType=typeof body.sourceType==="string"?body.sourceType:"";
      const rightsScope=typeof body.rightsScope==="string"?body.rightsScope as RightsScope:"private_reference";
      const content=normalizeFoundryText(typeof body.content==="string"?body.content:"");
      if(!title||title.length>160||!SOURCE_TYPES.has(sourceType)||!RIGHTS.has(rightsScope)||content.length<20||content.length>200000) return NextResponse.json({error:"IMPORT_INVALID"},{status:400});
      if(rightsScope==="opted_in_training"&&body.trainingOptIn!==true) return NextResponse.json({error:"TRAINING_CONSENT_REQUIRED"},{status:400});
      if(rightsScope==="open_licensed"&&(!body.licenseMetadata||typeof body.licenseMetadata!=="object")) return NextResponse.json({error:"LICENSE_METADATA_REQUIRED"},{status:400});
      const extracted=extractDirectorKnowledge(content);
      if(!extracted.length) return NextResponse.json({error:"NO_DIRECTOR_KNOWLEDGE_FOUND"},{status:422});
      const contentHash=sha256(content);
      const existing=await admin.from("cangxuan_sources").select("id,extracted_count").eq("user_id",user.id).eq("content_hash",contentHash).maybeSingle();
      if(existing.data) return NextResponse.json({ok:true,deduplicated:true,sourceId:existing.data.id,extractedCount:existing.data.extracted_count});
      const trainability=trainabilityFor(rightsScope);
      const sourceInsert=await admin.from("cangxuan_sources").insert({
        user_id:user.id,title,source_type:sourceType,rights_scope:rightsScope,trainability,
        license_metadata:body.licenseMetadata&&typeof body.licenseMetadata==="object"?body.licenseMetadata:{},
        consent_version:rightsScope==="opted_in_training"?"cangxuan-training-consent-v1":null,
        content_hash:contentHash,character_count:content.length,extracted_count:extracted.length,
      }).select("id").single();
      if(sourceInsert.error) throw sourceInsert.error;
      const itemsInsert=await admin.from("cangxuan_knowledge_items").upsert(extracted.map((item)=>({
        user_id:user.id,source_id:sourceInsert.data.id,category:item.category,title:item.title,statement:item.statement,evidence:item.evidence,
        tier:item.tier,trainability,quality_score:item.qualityScore,review_status:"draft",content_hash:item.contentHash,
      })),{onConflict:"user_id,content_hash",ignoreDuplicates:true});
      if(itemsInsert.error) {
        await admin.from("cangxuan_sources").delete().eq("id",sourceInsert.data.id).eq("user_id",user.id);
        throw itemsInsert.error;
      }
      return NextResponse.json({ok:true,sourceId:sourceInsert.data.id,extractedCount:extracted.length,trainability},{status:201});
    }

    if(body.action==="character") {
      const displayName=typeof body.displayName==="string"?body.displayName.trim():"";
      const requestedKey=(typeof body.characterKey==="string"?body.characterKey:displayName).trim().toUpperCase().replace(/[^A-Z0-9_]/g,"_").replace(/_+/g,"_").replace(/^_+|_+$/g,"").slice(0,64);
      const characterKey=requestedKey.length>=3&&requestedKey!=="CHAR"?requestedKey:`CHAR_${sha256(displayName).slice(0,12).toUpperCase()}`;
      const permanentIdentity=body.permanentIdentity&&typeof body.permanentIdentity==="object"&&!Array.isArray(body.permanentIdentity)?body.permanentIdentity:{};
      if(!displayName||displayName.length>80||characterKey.length<3||!Object.keys(permanentIdentity).length) return NextResponse.json({error:"CHARACTER_INVALID"},{status:400});
      const result=await admin.from("cangxuan_characters").upsert({user_id:user.id,character_key:characterKey,display_name:displayName,permanent_identity:permanentIdentity,identity_version:1,updated_at:new Date().toISOString()},{onConflict:"user_id,character_key,identity_version"}).select("id").single();
      if(result.error) throw result.error;
      return NextResponse.json({ok:true,characterId:result.data.id},{status:201});
    }

    if(body.action==="event") {
      const characterId=typeof body.characterId==="string"?body.characterId:"";
      const episode=Number(body.episode),scene=Number(body.scene),sequence=Number(body.sequence??1);
      const scriptEvent=typeof body.scriptEvent==="string"?body.scriptEvent.trim():"";
      const statePatch=body.statePatch&&typeof body.statePatch==="object"&&!Array.isArray(body.statePatch)?body.statePatch:{};
      if(!characterId||!Number.isInteger(episode)||episode<1||!Number.isInteger(scene)||scene<1||!Number.isInteger(sequence)||sequence<1||!scriptEvent||!Object.keys(statePatch).length) return NextResponse.json({error:"EVENT_INVALID"},{status:400});
      const owned=await admin.from("cangxuan_characters").select("id").eq("id",characterId).eq("user_id",user.id).maybeSingle();
      if(!owned.data) return NextResponse.json({error:"CHARACTER_NOT_FOUND"},{status:404});
      const result=await admin.from("cangxuan_continuity_events").upsert({user_id:user.id,character_id:characterId,episode,scene,sequence,script_event:scriptEvent,state_patch:statePatch},{onConflict:"character_id,episode,scene,sequence"}).select("id").single();
      if(result.error) throw result.error;
      return NextResponse.json({ok:true,eventId:result.data.id},{status:201});
    }
    return NextResponse.json({error:"ACTION_UNSUPPORTED"},{status:400});
  } catch(error) {
    console.error("[cangxuan foundry] write unavailable",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"FOUNDRY_WRITE_FAILED"},{status:503});
  }
}
