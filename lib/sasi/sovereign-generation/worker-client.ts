/** @deprecated SASI V18 compatibility facade. */
import {randomUUID} from "node:crypto";
import {submitWorkerTask} from "@/lib/sasi-kernel/worker/client";
export async function submitLocalGeneration(input:{kind:"image"|"video";prompt:string;ratio:string;duration?:number;style?:string}){return submitWorkerTask({requestId:randomUUID(),taskId:randomUUID(),nodeId:"generate",capabilityId:input.kind==="image"?"image.generate.diffusion":"video.generate.model",input});}
