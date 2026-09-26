import type {Capability,SasiArtifact,SasiTask} from "../types";
import {executeGraph,type ExecutionGraph} from "../graph";
import {scriptToScenes,type ScriptScene} from "./script";
import {buildTimeline,toSrt,type VideoRatio} from "./timeline";
import {buildImageSpec,renderImageSvg} from "../image/procedural-svg";

function jsonValue<T>(artifacts:ReadonlyMap<string,SasiArtifact[]>,node:string,name:string):T{
 const hit=artifacts.get(node)?.find((artifact)=>artifact.type==="json"&&artifact.name===name);if(!hit)throw new Error(`ARTIFACT_MISSING:${node}:${name}`);return hit.value as T;
}
function graphFor(task:SasiTask):ExecutionGraph{
 const input=(task.input??{}) as Record<string,unknown>,script=String(input.script??"").trim();
 const ratio=(["9:16","16:9","1:1"].includes(String(input.ratio))?String(input.ratio):"9:16") as VideoRatio;
 return{id:"video-plan-v3",nodes:[
  {id:"parse",async run(){const scenes=scriptToScenes(script);if(!scenes.length)throw new Error("EMPTY_SCRIPT");return[{type:"json",name:"scenes",value:scenes}]},validate(out){return Array.isArray(out[0]?.value)&&out[0]?.value.length?null:"NO_SCENES";}},
  {id:"timeline",dependsOn:["parse"],async run(_ctx,artifacts){const scenes=jsonValue<ScriptScene[]>(artifacts,"parse","scenes");return[{type:"json",name:"timeline.json",value:buildTimeline(scenes,ratio)}]}},
  {id:"subtitles",dependsOn:["timeline"],async run(_ctx,artifacts){const timeline=jsonValue<ReturnType<typeof buildTimeline>>(artifacts,"timeline","timeline.json");return[{type:"text",name:"subtitles.srt",mime:"application/x-subrip",value:toSrt(timeline.scenes)}]}},
 ]};
}
export const videoPlanCapability:Capability={id:"video.plan",canRun(task){return task.kind==="video"&&task.action==="plan";},async run(task,ctx){return executeGraph({task,ctx,capability:"video.plan",graph:graphFor(task)});}};
export const videoStoryboardCapability:Capability={
 id:"video.storyboard",canRun(task){return task.kind==="video"&&task.action==="storyboard";},
 async run(task,ctx){
  const planned=await executeGraph({task:{...task,action:"plan"},ctx,capability:"video.plan",graph:graphFor(task)});
  if(!planned.ok)return{...planned,capability:"video.storyboard"};
  const timeline=planned.artifacts.find(x=>x.name==="timeline.json")?.value as ReturnType<typeof buildTimeline>|undefined;
  if(!timeline?.scenes?.length)throw new Error("TIMELINE_MISSING");
  const cards:SasiArtifact[]=timeline.scenes.slice(0,24).map((scene,i)=>{
   const spec=buildImageSpec({prompt:`${scene.place} ${scene.text}`,title:`${i+1}. ${scene.text}`,subtitle:`${scene.place} · ${scene.framing} · ${scene.camera}`,ratio:timeline.ratio,style:"storyboard"});
   return{type:"image",name:`storyboard-${String(i+1).padStart(2,"0")}.svg`,mime:"image/svg+xml",value:renderImageSvg(spec)};
  });
  return{ok:true,taskId:task.id,engine:"autonomous",capability:"video.storyboard",artifacts:[...planned.artifacts,...cards],history:[...(planned.history||[]),{at:ctx.now().toISOString(),event:"storyboard.rendered",node:"procedural-svg",data:{count:cards.length}}]};
 }
};
