/** @deprecated SASI V18 compatibility facade. */
import {sasiKernelReadiness} from "@/lib/sasi-kernel/readiness";
export function sovereignGenerationReadiness(){const k=sasiKernelReadiness();return{autonomous:{image:true,video:true,providerRequired:false},enhanced:{image:{ready:false,modelConfigured:false},video:{ready:false,modelConfigured:false}},architecture:{kernel:k.kernelVersion,signedWorker:true,queueRequiredForGpu:true}};}
