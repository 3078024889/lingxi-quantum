import type {AITool} from "./catalog";
export function selectTerminalRows(tools:readonly AITool[],query:string,category:string,sort:string){
 const q=query.trim().toLowerCase().slice(0,100);
 return tools.filter(t=>(!category||t.category===category)&&(!q||[t.name,t.provider,t.category,t.description,...t.tags].join(" ").toLowerCase().includes(q)))
 .sort((a,b)=>(sort==="vendor"?a.provider.localeCompare(b.provider):sort==="category"?a.category.localeCompare(b.category):a.name.localeCompare(b.name))||a.slug.localeCompare(b.slug));
}
export function selectedProductIds(raw:unknown,known:readonly string[],limit=5):string[]{
 if(!Array.isArray(raw))return [];
 return [...new Set(raw.filter((s):s is string=>typeof s==="string"&&known.includes(s)))].slice(0,limit);
}
export function compareProductHref(ids:readonly string[],known:readonly string[]){return "/ai/compare?"+new URLSearchParams({products:selectedProductIds(ids,known).join(",")}).toString();}
