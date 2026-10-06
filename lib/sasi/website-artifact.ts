import {validateBundle,type WebsiteFile} from "./website-engine/artifact-bundle";
import {validateSiteSpec,type SiteSpec} from "./website-engine/site-spec";
export const WEBSITE_CONTRACT=`Generate a portable static website for the user's request, in the user's language. Return JSON only: {"title":"Website title","files":[{"path":"index.html","content":"<!doctype html>...complete HTML..."}]}. Create 1 to 3 complete HTML pages as needed, using relative links to the supplied filenames. Each page must contain a title, description, viewport, accessible headings and responsive inline CSS. No JavaScript, external resources, iframe, forms, payment/login buttons, empty links, invented contact details or pretend backend actions. Use truthful, specific copy based on the supplied brief. Do not include markdown fences. All visible buttons must have a real destination; no generic Learn more buttons.`;
export type WebsiteArtifact={title:string;html:string;files:WebsiteFile[];spec:SiteSpec;pageCount:number};
export function validateWebsiteArtifact(value:unknown):WebsiteArtifact{
 const p=value as {title?:unknown;html?:unknown;files?:unknown};
 if(!p||typeof p.title!=="string"||!p.title.trim()||p.title.length>120)throw new Error("WEBSITE_ARTIFACT_INVALID");
 const files:WebsiteFile[]=Array.isArray(p.files)?p.files:typeof p.html==="string"?[{path:"index.html",content:p.html}]:[];
 if(files.length<1||files.length>3)throw new Error("WEBSITE_PAGE_COUNT_INVALID");
 for(const f of files){
  if(!f||typeof f.path!=="string"||typeof f.content!=="string"||!f.path.endsWith(".html")||f.path.includes("/")||f.content.length>180000||!/<html[\s>]/i.test(f.content)||!/<\/html>/i.test(f.content))throw new Error("WEBSITE_ARTIFACT_INVALID");
  if(/<(?:script|iframe|object|embed|form|base|link)\b|\bon\w+\s*=|javascript:|\bsrc\s*=\s*["']?(?:https?:|\/\/)|@import|url\(\s*["']?(?:https?:|\/\/)|<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i.test(f.content))throw new Error("WEBSITE_UNSAFE_CONTENT");
  if(!/<title\b/i.test(f.content)||!/<meta\b[^>]*name\s*=\s*["']viewport["']/i.test(f.content)||!/<h1\b/i.test(f.content))throw new Error("WEBSITE_PAGE_INCOMPLETE");
 }
 validateBundle(files);
 const names=new Set(files.map(f=>f.path));
 for(const f of files)for(const m of f.content.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)){
  const href=m[2].trim();if(!href||href==="#")throw new Error("WEBSITE_EMPTY_ACTION");
  if(href.startsWith("#")){
   const escaped=href.slice(1).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
   if(!new RegExp(`\\bid\\s*=\\s*["']${escaped}["']`).test(f.content))throw new Error("WEBSITE_BROKEN_LINK");
  }else if(!/^(https:\/\/|mailto:|tel:)/i.test(href)){
   if(!names.has(href.split(/[?#]/)[0].replace(/^\.\//,"")))throw new Error("WEBSITE_BROKEN_LINK");
  }
 }
 const title=p.title;
 const spec:SiteSpec={version:"lingxifield-site-spec-v1",title,description:title,locale:"auto",pages:files.map((f,i)=>({id:`page-${i}`,path:f.path==="index.html"?"/":`/${f.path.slice(0,-5)}`,title:f.content.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]||title,purpose:"static website",sections:["content"]})),theme:{mode:"system",accent:"#2563eb"},requirements:{responsive:true,seo:true,forms:false,externalAssets:false}};
 validateSiteSpec(spec);
 return{title,html:files.find(f=>f.path==="index.html")!.content,files,spec,pageCount:files.length};
}
