import type {Capability} from "../types";
import {imageArtifacts} from "./procedural-svg";
export const imageRenderCapability:Capability={
 id:"image.render",
 canRun(task){return task.kind==="image"&&task.action==="render";},
 async run(task,ctx){
  ctx.log("image.render.start",{taskId:task.id});
  const artifacts=imageArtifacts(task);
  return{ok:true,taskId:task.id,engine:"autonomous",capability:"image.render",artifacts,history:[{at:ctx.now().toISOString(),event:"image.rendered",node:"procedural-svg"}]};
 }
};
