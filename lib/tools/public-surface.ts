import {liveTools} from "@/lib/tools/registry";
import {ADVANCED_TOOLS,type AdvancedToolCategory} from "@/lib/tools/advanced-catalog";
import {GLOBAL_TOOL_CATALOG} from "@/lib/seo/global-seo";
import {toolTitle} from "@/lib/tools/card-i18n";
import {toolDisplayCategory,toolDisplayKind,type ToolDisplayCategory} from "@/lib/tools/display-taxonomy";

export type PublicToolDisplayCategory=Exclude<ToolDisplayCategory,"all">;
export type PublicToolGlyphKind="image"|"document"|"video"|"audio"|"privacy"|"utility"|"ai"|"qr";
export type PublicToolSurfaceItem={
 href:string;slug:string;titleZh:string;titleEn:string;descZh:string;descEn:string;
 kind:PublicToolGlyphKind;category:PublicToolDisplayCategory;localOnly:boolean;
 source:"registry"|"advanced"|"catalog";
};

const ADVANCED_KIND:Record<AdvancedToolCategory,PublicToolGlyphKind>={
 pdf:"document",sign:"document",image:"image",video:"video",audio:"audio",
 text:"utility",privacy:"privacy",daily:"utility",developer:"utility"
};

export function publicToolSurface():PublicToolSurfaceItem[]{
 const map=new Map<string,PublicToolSurfaceItem>();
 for(const tool of liveTools()){
  const href=`/tools/${tool.slug}`,category=toolDisplayCategory(tool.slug);
  map.set(href,{href,slug:tool.slug,titleZh:toolTitle("zh",tool.slug,tool.titleZh),titleEn:toolTitle("en",tool.slug,tool.titleEn),
   descZh:tool.oneLinerZh,descEn:tool.oneLinerEn,kind:toolDisplayKind(category),category,localOnly:Boolean(tool.localOnly),source:"registry"});
 }
 for(const tool of ADVANCED_TOOLS){
  const slug=tool.href.replace(/^\/tools\//,""),category=toolDisplayCategory(slug);
  map.set(tool.href,{href:tool.href,slug,titleZh:toolTitle("zh",slug,tool.title),titleEn:toolTitle("en",slug,""),
   descZh:tool.description,descEn:"",kind:ADVANCED_KIND[tool.category]||toolDisplayKind(category),category,
   localOnly:Boolean(tool.localOnly),source:"advanced"});
 }
 for(const tool of GLOBAL_TOOL_CATALOG){
  const href=`/tools/${tool.slug}`; if(map.has(href))continue;
  const category=toolDisplayCategory(tool.slug);
  map.set(href,{href,slug:tool.slug,titleZh:toolTitle("zh",tool.slug,tool.zh),titleEn:toolTitle("en",tool.slug,tool.en),
   descZh:"",descEn:"",kind:toolDisplayKind(category),category,localOnly:tool.mode==="local",source:"catalog"});
 }
 // The catalog provides canonical ordering, but must not hide newly shipped registry routes.
 const catalogFirst=GLOBAL_TOOL_CATALOG.map(tool=>map.get(`/tools/${tool.slug}`)).filter((tool):tool is PublicToolSurfaceItem=>Boolean(tool));
 const ordered=new Set(catalogFirst.map(item=>item.href));
 return [...catalogFirst,...Array.from(map.values()).filter(item=>!ordered.has(item.href))];
}
