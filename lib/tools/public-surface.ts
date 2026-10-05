import {liveTools} from "@/lib/tools/registry";
import {ADVANCED_TOOLS,type AdvancedToolCategory} from "@/lib/tools/advanced-catalog";

export type PublicToolDisplayCategory =
  | "pdf" | "image" | "media" | "subtitle" | "table" | "privacy" | "recognition" | "file";

export type PublicToolGlyphKind =
  | "image" | "document" | "video" | "audio" | "privacy" | "utility" | "ai" | "qr";

export type PublicToolSurfaceItem = {
  href:string;
  slug:string;
  titleZh:string;
  titleEn:string;
  descZh:string;
  descEn:string;
  kind:PublicToolGlyphKind;
  category:PublicToolDisplayCategory;
  localOnly:boolean;
  source:"registry"|"advanced";
};

const ADVANCED_DISPLAY:Record<AdvancedToolCategory,PublicToolDisplayCategory>={
  pdf:"pdf",sign:"pdf",image:"image",video:"media",audio:"media",
  text:"file",privacy:"privacy",daily:"file",developer:"file",
};
const ADVANCED_GLYPH:Record<AdvancedToolCategory,PublicToolGlyphKind>={
  pdf:"document",sign:"document",image:"image",video:"video",audio:"audio",
  text:"utility",privacy:"privacy",daily:"utility",developer:"utility",
};

function registryCategory(category:string):PublicToolDisplayCategory{
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
      titleZh:tool.titleZh,titleEn:tool.titleEn,
      descZh:tool.oneLinerZh,descEn:tool.oneLinerEn,
      kind:registryKind(tool.category),
      category:registryCategory(tool.category),
      localOnly:Boolean(tool.localOnly),
      source:"registry",
    });
  }

  for(const tool of ADVANCED_TOOLS){
    const slug=tool.href.replace(/^\/tools\//,"");
    map.set(tool.href,{
      href:tool.href,slug,
      titleZh:tool.title,
      titleEn:tool.title,
      descZh:tool.description,
      descEn:tool.description,
      kind:ADVANCED_GLYPH[tool.category],
      category:ADVANCED_DISPLAY[tool.category],
      localOnly:Boolean(tool.localOnly),
      source:"advanced",
    });
  }

  return [...map.values()];
}
