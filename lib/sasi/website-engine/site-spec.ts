export type SitePage={id:string;path:string;title:string;purpose:string;sections:string[]};
export type SiteSpec={
 version:"lingxifield-site-spec-v1";title:string;description:string;locale:string;
 pages:SitePage[];theme:{mode:"light"|"dark"|"system";accent:string};
 requirements:{responsive:boolean;seo:boolean;forms:boolean;externalAssets:boolean};
};
const PATH=/^\/(?:[a-z0-9][a-z0-9/_-]*)?$/i;
export function validateSiteSpec(x:SiteSpec){
 if(x.version!=="lingxifield-site-spec-v1"||!x.title.trim()||!x.description.trim())throw new Error("SITE_SPEC_INVALID");
 if(!x.pages.length||x.pages.length>30)throw new Error("SITE_PAGE_COUNT_INVALID");
 const paths=new Set<string>();
 for(const p of x.pages){if(!PATH.test(p.path)||paths.has(p.path)||!p.title.trim()||!p.sections.length)throw new Error("SITE_PAGE_INVALID");paths.add(p.path)}
 return x;
}
