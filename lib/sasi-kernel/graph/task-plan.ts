import type{ExecutionGraph,CapabilityNode}from"./capability-graph";
export type TaskIntent="website"|"document"|"image"|"video"|"audio"|"knowledge"|"utility"|"code";
const node=(id:string,capability:string,dependsOn:string[]=[],extra:Partial<CapabilityNode>={}):CapabilityNode=>({
 id,capability,dependsOn,inputKeys:[],outputKeys:[],validate:["non-empty"],maxAttempts:2,...extra
});
export function planTask(intent:TaskIntent):ExecutionGraph{
 if(intent==="website")return{version:"sasi-capability-graph-v1",nodes:[
  node("understand","intent.parse"),
  node("spec","website.site-spec",["understand"],{outputKeys:["siteSpec"]}),
  node("sitemap","website.sitemap",["spec"],{outputKeys:["sitemap"]}),
  node("design","website.design-system",["spec"],{outputKeys:["tokens"]}),
  node("pages","website.page-compose",["sitemap","design"],{outputKeys:["pages"]}),
  node("validate","website.validate",["pages"],{validate:["html","links","responsive","no-fake-actions"]}),
  node("package","website.package",["validate"],{outputKeys:["artifact"]})
 ]};
 const cap:Record<Exclude<TaskIntent,"website">,string>={document:"document.process",image:"image.process",video:"video.process",audio:"audio.process",knowledge:"knowledge.retrieve",utility:"utility.execute",code:"code.build"};
 return{version:"sasi-capability-graph-v1",nodes:[node("understand","intent.parse"),node("execute",cap[intent],["understand"]),node("validate","artifact.validate",["execute"])]};
}
