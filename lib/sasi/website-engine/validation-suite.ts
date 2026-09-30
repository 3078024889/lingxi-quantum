import type{SiteSpec}from"./site-spec";import{validateSiteSpec}from"./site-spec";import{buildSitemap,validateInternalLinks}from"./sitemap";import{publishGate,type PublishEvidence}from"./publish-gate";
export function validateWebsitePlan(spec:SiteSpec,evidence:PublishEvidence){
 validateSiteSpec(spec);const map=buildSitemap(spec),links=validateInternalLinks(map);
 const gate=publishGate({...evidence,linksOk:evidence.linksOk&&links.ok});
 return{ok:links.ok&&gate.ready,sitemap:map,brokenLinks:links.broken,publish:gate};
}
