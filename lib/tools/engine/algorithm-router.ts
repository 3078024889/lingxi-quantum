import "server-only";
export type EngineKind="deterministic"|"local-model"|"server-local"|"external-semantic"|"disabled";
export type QualityTier="fast"|"balanced"|"quality";
export type CapabilityRoute={engine:EngineKind;quality:QualityTier;fallback?:EngineKind;validate:boolean;charge:"free"|"hybrid"|"paid"|"disabled"};
const ROUTES:Record<string,CapabilityRoute>={
 "pdf-edit":{engine:"deterministic",quality:"quality",validate:true,charge:"free"},
 "pdf-merge-split":{engine:"deterministic",quality:"quality",validate:true,charge:"free"},
 "pdf-compress":{engine:"deterministic",quality:"balanced",fallback:"server-local",validate:true,charge:"free"},
 "pdf-ocr":{engine:"local-model",quality:"balanced",fallback:"server-local",validate:true,charge:"free"},
 "ocr":{engine:"local-model",quality:"balanced",fallback:"server-local",validate:true,charge:"free"},
 "image-convert":{engine:"deterministic",quality:"quality",validate:true,charge:"free"},
 "image-watermark-remover":{engine:"local-model",quality:"balanced",fallback:"server-local",validate:true,charge:"free"},
 "id-photo-ai":{engine:"local-model",quality:"quality",fallback:"server-local",validate:true,charge:"free"},
 "audio-transcription":{engine:"local-model",quality:"balanced",fallback:"server-local",validate:true,charge:"free"},
 "video-transcription":{engine:"local-model",quality:"balanced",fallback:"server-local",validate:true,charge:"free"},
 "video-toolkit":{engine:"deterministic",quality:"quality",validate:true,charge:"free"},
 "video-watermark-remover":{engine:"deterministic",quality:"balanced",fallback:"server-local",validate:true,charge:"free"},
 "subtitle-translate":{engine:"external-semantic",quality:"quality",validate:true,charge:"paid"},
 "food-calorie":{engine:"local-model",quality:"quality",fallback:"server-local",validate:true,charge:"hybrid"},
 "video-dubbing":{engine:"disabled",quality:"quality",validate:true,charge:"disabled"},
 "website-builder":{engine:"external-semantic",quality:"quality",validate:true,charge:"paid"},
};
export function routeCapability(id:string){return ROUTES[id]??null}
export const ENGINE_ROUTES=Object.freeze(ROUTES);
