import {NextResponse} from "next/server";
import {sasiKernelReadiness} from "@/lib/sasi-kernel/readiness";
import {workerHealth,workerCapabilities} from "@/lib/sasi-kernel/worker/client";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){let worker:{status:string;health?:unknown;capabilities?:unknown;error?:string}={status:"not-configured"};try{const[health,capabilities]=await Promise.all([workerHealth(),workerCapabilities()]);worker={status:"reachable",health,capabilities};}catch(error){worker={status:"unavailable",error:error instanceof Error?error.message:"WORKER_UNAVAILABLE"};}return NextResponse.json({kernel:sasiKernelReadiness(),worker},{headers:{"Cache-Control":"no-store"}});}
