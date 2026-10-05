import {liveTools} from "@/lib/tools/registry";
import {ADVANCED_TOOLS,type AdvancedToolCategory} from "@/lib/tools/advanced-catalog";
import {toolTitle} from "@/lib/tools/card-i18n";

export type PublicToolDisplayCategory =
  | "pdf" | "image" | "media" | "subtitle" | "table" | "privacy" | "recognition" | "file";
export type PublicToolGlyphKind =
  | "image" | "document" | "video" | "audio" | "privacy" | "utility" | "ai" | "qr";
export type PublicToolSurfaceItem={
  href:string;slug:string;titleZh:string;titleEn:string;descZh:string;descEn:string;
  kind:PublicToolGlyphKind;category:PublicToolDisplayCategory;localOnly:boolean;source:"registry"|"advanced";
};

const ADVANCED_KIND:Record<AdvancedToolCategory,PublicToolGlyphKind>={
  pdf:"document",sign:"document",image:"image",video:"video",audio:"audio",
  text:"utility",privacy:"privacy",daily:"utility",developer:"utility"
};
const RECOGNITION=new Set(["ocr","pdf-ocr","handwriting-ocr","food-calorie","qr-safe-reader","qr-code-reader","qr-code-generator","id-photo-ai"]);
const SUBTITLE=new Set(["subtitle-tools","subtitle-translate"]);
const TABLE=new Set(["xlsx-to-csv","csv-to-xlsx","csv-json","ics-to-csv","vcf-to-csv"]);

function advancedCategory(slug:string,category:AdvancedToolCategory):PublicToolDisplayCategory{
  if(RECOGNITION.has(slug))return"recognition";
  if(SUBTITLE.has(slug))return"subtitle";
  if(TABLE.has(slug))return"table";
  if(category==="pdf"||category==="sign")return"pdf";
  if(category==="image")return"image";
  if(category==="video"||category==="audio")return"media";
  if(category==="privacy")return"privacy";
  return"file";
}
function registryCategory(category:string,slug:string):PublicToolDisplayCategory{
  if(RECOGNITION.has(slug))return"recognition";
  if(SUBTITLE.has(slug))return"subtitle";
  if(TABLE.has(slug))return"table";
  if(category==="pdf")return"pdf";
  if(category==="image")return"image";
  if(category==="spreadsheet")return"table";
  if(category==="qr")return"recognition";
  return"file";
}
function registryKind(category:string):PublicToolGlyphKind{
  if(category==="pdf")return"document";
  if(category==="image")return"image";
  if(category==="qr")return"qr";
  return"utility";
}
export function publicToolSurface():PublicToolSurfaceItem[]{
  const map=new Map<string,PublicToolSurfaceItem>();
  for(const tool of liveTools()){
    const href=`/tools/${tool.slug}`;
    map.set(href,{
      href,slug:tool.slug,
      titleZh:toolTitle("zh",tool.slug,tool.titleZh),
      titleEn:toolTitle("en",tool.slug,tool.titleEn),
      descZh:tool.oneLinerZh,descEn:tool.oneLinerEn,
      kind:registryKind(tool.category),category:registryCategory(tool.category,tool.slug),
      localOnly:Boolean(tool.localOnly),source:"registry"
    });
  }
  for(const tool of ADVANCED_TOOLS){
    const slug=tool.href.replace(/^\/tools\//,"");
    map.set(tool.href,{
      href:tool.href,slug,
      titleZh:toolTitle("zh",slug,tool.title),
      titleEn:toolTitle("en",slug,""),
      descZh:tool.description,
      // Never pass Chinese as a non-Chinese fallback. toolCardLine has 9-language generic copy.
      descEn:"",
      kind:ADVANCED_KIND[tool.category],category:advancedCategory(slug,tool.category),
      localOnly:Boolean(tool.localOnly),source:"advanced"
    });
  }
  return [...map.values()];
}
