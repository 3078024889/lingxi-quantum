import type {SasiAutonomousCapability,SasiAutonomousCapabilityId} from "./types";
export const SASI_AUTONOMY_VERSION="2026.09.26-v2";
const GRAPH:Record<SasiAutonomousCapabilityId,SasiAutonomousCapability>={
"document-parse":{id:"document-parse",executionClass:"deterministic",localFirst:true,browserEligible:true,deterministic:true,fallbackIds:[]},
"file-convert":{id:"file-convert",executionClass:"deterministic",localFirst:true,browserEligible:true,deterministic:true,fallbackIds:[]},
"knowledge-retrieve":{id:"knowledge-retrieve",executionClass:"deterministic",localFirst:true,browserEligible:false,deterministic:true,fallbackIds:["knowledge-rank"]},
"knowledge-rank":{id:"knowledge-rank",executionClass:"deterministic",localFirst:true,browserEligible:false,deterministic:true,fallbackIds:[]},
"knowledge-validate":{id:"knowledge-validate",executionClass:"deterministic",localFirst:true,browserEligible:false,deterministic:true,fallbackIds:[]},
"image-process":{id:"image-process",executionClass:"local-ml",localFirst:true,browserEligible:true,deterministic:false,fallbackIds:[]},
"image-generate":{id:"image-generate",executionClass:"procedural",localFirst:true,browserEligible:true,deterministic:true,fallbackIds:["layout-generate"]},
"ocr":{id:"ocr",executionClass:"local-ml",localFirst:true,browserEligible:true,deterministic:false,fallbackIds:[]},
"subtitle-process":{id:"subtitle-process",executionClass:"deterministic",localFirst:true,browserEligible:true,deterministic:true,fallbackIds:[]},
"video-compose":{id:"video-compose",executionClass:"procedural",localFirst:true,browserEligible:true,deterministic:true,fallbackIds:[]},
"video-render":{id:"video-render",executionClass:"procedural",localFirst:true,browserEligible:true,deterministic:true,fallbackIds:["video-compose"]},
"audio-process":{id:"audio-process",executionClass:"local-ml",localFirst:true,browserEligible:false,deterministic:false,fallbackIds:[]},
"layout-generate":{id:"layout-generate",executionClass:"procedural",localFirst:true,browserEligible:true,deterministic:true,fallbackIds:[]},
"semantic-write":{id:"semantic-write",executionClass:"semantic-generation",localFirst:false,browserEligible:false,deterministic:false,fallbackIds:[]},
"semantic-reason":{id:"semantic-reason",executionClass:"semantic-generation",localFirst:false,browserEligible:false,deterministic:false,fallbackIds:["knowledge-retrieve","knowledge-validate"]},
"multimodal-generate":{id:"multimodal-generate",executionClass:"semantic-generation",localFirst:false,browserEligible:false,deterministic:false,fallbackIds:["image-generate","layout-generate","video-render"]},
};
export function sasiCapability(id:SasiAutonomousCapabilityId){return GRAPH[id]}
export function sasiAutonomousCapabilities(){return Object.values(GRAPH)}
export function autonomousCoreReadiness(){const c=sasiAutonomousCapabilities();return{version:SASI_AUTONOMY_VERSION,capabilityCount:c.length,localFirstCount:c.filter(x=>x.localFirst).length,deterministicCount:c.filter(x=>x.deterministic).length,algorithmRouter:true,capabilityGraph:true,proceduralImage:true,proceduralVideo:true}}
