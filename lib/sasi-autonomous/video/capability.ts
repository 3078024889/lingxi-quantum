import type { Capability, SasiArtifact, SasiTask } from "../types";
import { executeGraph, type ExecutionGraph } from "../graph";
import { scriptToScenes, type ScriptScene } from "./script";
import { buildTimeline, toSrt, type VideoRatio } from "./timeline";

function jsonValue<T>(artifacts:ReadonlyMap<string,SasiArtifact[]>,node:string,name:string):T{
 const hit=artifacts.get(node)?.find((artifact)=>artifact.type==="json"&&artifact.name===name);if(!hit)throw new Error(`ARTIFACT_MISSING:${node}:${name}`);return hit.value as T;
}

function graphFor(task:SasiTask):ExecutionGraph{
 const input=(task.input??{}) as Record<string,unknown>;
 const script=String(input.script??"").trim();
 const ratio=(["9:16","16:9","1:1"].includes(String(input.ratio))?String(input.ratio):"9:16") as VideoRatio;
 return{id:"video-plan-v2",nodes:[
  {id:"parse",async run(){const scenes=scriptToScenes(script);if(!scenes.length)throw new Error("EMPTY_SCRIPT");return[{type:"json",name:"scenes",value:scenes}]},validate(out){return Array.isArray(out[0]?.value)&&out[0]?.value.length?null:"NO_SCENES";}},
  {id:"timeline",dependsOn:["parse"],async run(_ctx,artifacts){const scenes=jsonValue<ScriptScene[]>(artifacts,"parse","scenes");return[{type:"json",name:"timeline.json",value:buildTimeline(scenes,ratio)}]}},
  {id:"subtitles",dependsOn:["timeline"],async run(_ctx,artifacts){const timeline=jsonValue<ReturnType<typeof buildTimeline>>(artifacts,"timeline","timeline.json");return[{type:"text",name:"subtitles.srt",mime:"application/x-subrip",value:toSrt(timeline.scenes)}]}},
 ]};
}

export const videoPlanCapability:Capability={
 id:"video.plan",canRun(task){return task.kind==="video"&&task.action==="plan";},
 async run(task,ctx){return executeGraph({task,ctx,capability:"video.plan",graph:graphFor(task)});},
};
