import {probeEngine} from "./server/probe";import {estimateEngine} from "./estimates";import type {EngineHealth} from "./types";
export async function engineHealth(engineId:string):Promise<EngineHealth>{
 const p=await probeEngine(engineId);
 return{ok:p.available,engineId,version:p.version,checkedAt:new Date().toISOString(),reason:p.reason,details:{runtime:p.runtime,latencyMs:p.latencyMs,estimate:estimateEngine(engineId)}};
}
