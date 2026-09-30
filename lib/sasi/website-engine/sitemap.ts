import type{SiteSpec}from"./site-spec";
export type SiteMapNode={path:string;title:string;linksTo:string[]};
export function buildSitemap(spec:SiteSpec):SiteMapNode[]{
 const paths=spec.pages.map(p=>p.path);
 return spec.pages.map((p,i)=>({path:p.path,title:p.title,linksTo:i===0?paths.slice(1):[paths[0]]}));
}
export function validateInternalLinks(map:SiteMapNode[]){
 const paths=new Set(map.map(x=>x.path));const broken:string[]=[];
 for(const p of map)for(const x of p.linksTo)if(!paths.has(x))broken.push(`${p.path}->${x}`);
 return{ok:broken.length===0,broken};
}
