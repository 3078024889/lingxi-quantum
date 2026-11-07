/**
 * Fail-closed infrastructure readiness for the existing SASI native GPU worker.
 * This does NOT prove successful text/image/video generation or payment readiness.
 * Safe in Node and Cloudflare: no native Node imports or network requests.
 * The genuine v19 worker /health reports ok:true even when state:"degraded".
 */
export function assertNativeComputeInfrastructure(payload){
 if(!payload||typeof payload!=="object"||Array.isArray(payload))
   throw new Error("SASI_NATIVE_HEALTH_INVALID");
 if(payload.ok!==true||
    payload.service!=="lingxifield-sasi-native-compute"||
    payload.version!=="19.0")
   throw new Error("SASI_NATIVE_SERVICE_MISMATCH");
 if(payload.state!=="ready"||
    !payload.gpu||payload.gpu.available!==true||
    !Number.isInteger(payload.gpu.count)||payload.gpu.count<1||
    !Number.isFinite(payload.gpu.freeVramGb)||payload.gpu.freeVramGb<=0)
   throw new Error("SASI_NATIVE_GPU_NOT_READY");
 if(!payload.storage||payload.storage.r2!==true)
   throw new Error("SASI_NATIVE_PRIVATE_R2_NOT_READY");
 if(!payload.models||typeof payload.models!=="object"||
    !["reasoning","image","video"].every(key=>
      typeof payload.models[key]==="string"&&payload.models[key].trim().length>0))
   throw new Error("SASI_NATIVE_MODEL_CONFIG_NOT_READY");
 return payload;
}
