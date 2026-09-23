"use client";

import type { LingxiLang } from "@/lib/lingxi-i18n";

async function translateOnce(reportKey:string,targetLang:LingxiLang,items:string[]){
  const response=await fetch("/api/i18n/report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reportKey,targetLang,items})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!Array.isArray(data.items)||data.items.length!==items.length)throw new Error(String(data.error||"REPORT_TRANSLATION_FAILED"));
  return data.items as string[];
}

export async function localizeReportItems({
  reportKey,targetLang,items,translateEnglish=false,
}:{reportKey:string;targetLang:LingxiLang;items:string[];translateEnglish?:boolean}):Promise<{items:string[];translated:boolean}>{
  if(targetLang==="zh"||(!translateEnglish&&targetLang==="en")||items.length===0)return{items,translated:false};
  try{return{items:await translateOnce(reportKey,targetLang,items),translated:true};}
  catch{return{items,translated:false};}
}

export async function localizeReportItemsChunked({
  reportKey,targetLang,items,translateEnglish=false,chunkSize=32,
}:{reportKey:string;targetLang:LingxiLang;items:string[];translateEnglish?:boolean;chunkSize?:number}):Promise<{items:string[];translated:boolean}>{
  if(targetLang==="zh"||(!translateEnglish&&targetLang==="en")||items.length===0)return{items,translated:false};
  try{
    const out:string[]=[];
    for(let i=0;i<items.length;i+=chunkSize){
      const chunk=items.slice(i,i+chunkSize);
      out.push(...await translateOnce(`${reportKey}:c${Math.floor(i/chunkSize)}`,targetLang,chunk));
    }
    return{items:out,translated:true};
  }catch{return{items,translated:false};}
}
