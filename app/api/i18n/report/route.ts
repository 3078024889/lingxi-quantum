import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runText } from "@/lib/ai/provider-router";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const TARGETS = {
  ja: "natural Japanese",
  ko: "natural Korean",
  fr: "natural French",
  de: "natural German",
  es: "natural Spanish",
  pt: "natural Portuguese",
  ar: "natural Modern Standard Arabic",
} as const;

const ALLOWED_REPORT_PREFIXES = new Set([
  "life-map","relationship","qian","tarot","mirror",
  "resilience","romance","wealth","daily-tide",
]);

type TargetLang = keyof typeof TARGETS;

function cleanJson(raw:string){
  return raw.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");
}

function chunkItems(items:string[],maxChars=9000,maxItems=4){
  const chunks:{start:number;items:string[]}[]=[];
  let current:string[]=[],chars=0,start=0;
  items.forEach((item,index)=>{
    if(current.length&&(current.length>=maxItems||chars+item.length>maxChars)){
      chunks.push({start,items:current});current=[];chars=0;start=index;
    }
    current.push(item);chars+=item.length;
  });
  if(current.length)chunks.push({start,items:current});
  return chunks;
}

async function translateBatch(items:string[],target:TargetLang){
  const prompt=[
    `Translate the JSON string array below into ${TARGETS[target]}.`,
    "Rules:",
    "- Return ONLY one valid JSON array of strings, in the same order and with exactly the same item count.",
    "- Translate faithfully; do not summarize, add claims, remove evidence, soften caveats, or rewrite conclusions.",
    "- Preserve names, numbers, dates, percentages, URLs, product names, formulae and symbols unless a normal localized form is obvious.",
    "- Preserve paragraph breaks inside each string.",
    "- Do not add markdown fences or commentary.",
    "- LINGXIFIELD is a brand name; keep it unchanged when a natural localized brand form is uncertain.",
    "",
    JSON.stringify(items),
  ].join("\n");
  const result=await runText(prompt,"simple_text","standard",6500);
  const parsed=JSON.parse(cleanJson(result.text));
  if(!Array.isArray(parsed)||parsed.length!==items.length||parsed.some(x=>typeof x!=="string")){
    throw new Error("TRANSLATION_SHAPE_MISMATCH");
  }
  return{items:parsed as string[],provider:result.provider,model:result.model};
}

export async function POST(req:Request){
  const supabase=createClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});

  // Prevent this internal report-localization endpoint from becoming a free
  // general-purpose translation API. One HTTP request may internally translate
  // several chunks, so 20 requests/hour is ample for normal report switching.
  const allowed=await checkRateLimit(`report-i18n:${user.id}`,20,3600);
  if(!allowed)return NextResponse.json({error:"RATE_LIMITED"},{status:429});

  let body:{reportKey?:string;targetLang?:string;items?:unknown[]};
  try{body=await req.json()}catch{return NextResponse.json({error:"INVALID_BODY"},{status:400})}

  const reportKey=String(body.reportKey||"").trim();
  const family=reportKey.split(":")[0];
  const targetLang=String(body.targetLang||"") as TargetLang;
  const items=Array.isArray(body.items)?body.items:[];

  if(!ALLOWED_REPORT_PREFIXES.has(family)||!/^[a-z0-9:_./-]{1,180}$/i.test(reportKey)){
    return NextResponse.json({error:"INVALID_REPORT_KEY"},{status:400});
  }
  if(!(targetLang in TARGETS))return NextResponse.json({error:"UNSUPPORTED_TARGET_LANG"},{status:400});
  if(!items.length||items.length>40||items.some(x=>typeof x!=="string")){
    return NextResponse.json({error:"INVALID_ITEMS"},{status:400});
  }
  const strings=items as string[];
  const totalChars=strings.reduce((sum,item)=>sum+item.length,0);
  if(totalChars>70000||strings.some(item=>item.length>18000)){
    return NextResponse.json({error:"REPORT_TOO_LARGE"},{status:413});
  }

  const sourceHash=createHash("sha256").update(JSON.stringify(strings)).digest("hex");
  const admin=createAdminClient();

  try{
    const{data:cached}=await admin.from("report_translations")
      .select("translated_items,provider,model")
      .eq("user_id",user.id).eq("report_key",reportKey)
      .eq("source_hash",sourceHash).eq("target_lang",targetLang).maybeSingle();
    if(cached?.translated_items&&Array.isArray(cached.translated_items)){
      return NextResponse.json({items:cached.translated_items,cached:true,provider:cached.provider??null,model:cached.model??null});
    }
  }catch(error){
    console.warn("[report-i18n] cache read skipped:",error instanceof Error?error.message:String(error));
  }

  try{
    const translated=new Array<string>(strings.length);
    let provider="",model="";
    for(const chunk of chunkItems(strings)){
      const result=await translateBatch(chunk.items,targetLang);
      provider=result.provider;model=result.model;
      result.items.forEach((item,index)=>{translated[chunk.start+index]=item});
    }
    try{
      await admin.from("report_translations").upsert({
        user_id:user.id,report_key:reportKey,source_hash:sourceHash,target_lang:targetLang,
        translated_items:translated,provider,model,
      },{onConflict:"user_id,report_key,source_hash,target_lang"});
    }catch(error){
      console.warn("[report-i18n] cache write skipped:",error instanceof Error?error.message:String(error));
    }
    return NextResponse.json({items:translated,cached:false,provider,model});
  }catch(error){
    console.error("[report-i18n] translation failed:",error);
    return NextResponse.json({error:"TRANSLATION_FAILED"},{status:502});
  }
}
