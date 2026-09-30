import{planTask}from"@/lib/sasi-kernel/graph/task-plan";
import type{SiteSpec}from"./site-spec";
export function websiteExecutionGraph(spec:SiteSpec){
 const g=planTask("website");
 return{...g,nodes:g.nodes.map(n=>({...n,inputKeys:n.id==="spec"?["request"]:n.id==="sitemap"||n.id==="design"?["siteSpec"]:n.inputKeys,outputKeys:n.id==="package"?["websiteBundle"]:n.outputKeys}))};
}
export const WEBSITE_GRAPH_CAPABILITIES=["website.site-spec","website.sitemap","website.design-system","website.page-compose","website.validate","website.package"] as const;
