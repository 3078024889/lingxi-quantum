/** @deprecated SASI V18 compatibility facade. */
import {executeSasiKernel} from "@/lib/sasi-kernel/runtime";
export {registeredCapabilities} from "@/lib/sasi-kernel/registry";
export async function runAutonomousTask(task:any,partial?:any){return executeSasiKernel(task,partial)}
