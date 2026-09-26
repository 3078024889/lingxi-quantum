import type { SasiCapability } from "../../types";
import { imageArtifacts } from "./procedural-svg";

export const imageRenderCapability: SasiCapability = {
  manifest: { id:"image.render",version:"1.0.0",executionClass:"procedural",runtimeTargets:["server","browser"],localFirst:true,deterministic:true,browserEligible:true,externalOptional:false,fallbackIds:[],resources:{cpu:"light",memoryMb:128,gpu:"none"} },
  canRun(task){ return task.kind === "image" && task.action === "render"; },
  async execute(task,ctx){
    ctx.log("image.render.start",{taskId:task.id});
    const artifacts=imageArtifacts(task);
    return {ok:true,taskId:task.id,engine:"sasi-kernel",capability:"image.render",artifacts,history:[{at:ctx.now().toISOString(),event:"image.rendered",node:"procedural-svg"}]};
  },
};
