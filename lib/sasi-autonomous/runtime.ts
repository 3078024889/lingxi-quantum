import { runAutonomousTask } from "./router";
import type { SasiTask } from "./types";
export async function executeSasi(input:Omit<SasiTask,"id">&{id?:string}){const task:SasiTask={...input,id:input.id??(globalThis.crypto?.randomUUID?.()??`sasi-${Date.now()}-${Math.random().toString(36).slice(2)}`)};return runAutonomousTask(task);}
