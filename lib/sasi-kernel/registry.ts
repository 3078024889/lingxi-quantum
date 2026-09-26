import type { SasiCapability, SasiCapabilityManifest, SasiKernelTask } from "./types";
import { knowledgeAnswerCapability, knowledgeSummaryCapability } from "./capabilities/knowledge/capability";
import { imageRenderCapability } from "./capabilities/image/capability";
import { videoPlanCapability, videoStoryboardCapability } from "./capabilities/video/capability";
import { utilityOrganizeCapability, utilityStatsCapability } from "./capabilities/utility/capability";
import {
  nativeDirectorCapability,
  nativeImageCapability,
  nativeReasonCapability,
  nativeVideoCapability,
} from "./capabilities/native/capability";

const EXECUTABLE: SasiCapability[] = [
  nativeReasonCapability,
  nativeDirectorCapability,
  nativeImageCapability,
  nativeVideoCapability,
  knowledgeAnswerCapability,
  knowledgeSummaryCapability,
  imageRenderCapability,
  videoPlanCapability,
  videoStoryboardCapability,
  utilityOrganizeCapability,
  utilityStatsCapability,
];

const DECLARATIVE: SasiCapabilityManifest[] = [
  {id:"document.parse",version:"1.0.0",executionClass:"deterministic",runtimeTargets:["server","browser"],localFirst:true,deterministic:true,browserEligible:true,externalOptional:false,fallbackIds:[],resources:{cpu:"light",memoryMb:128,gpu:"none"}},
  {id:"file.convert",version:"1.0.0",executionClass:"deterministic",runtimeTargets:["server","browser"],localFirst:true,deterministic:true,browserEligible:true,externalOptional:false,fallbackIds:[],resources:{cpu:"medium",memoryMb:256,gpu:"none"}},
  {id:"image.process",version:"1.0.0",executionClass:"local-ml",runtimeTargets:["browser","worker"],localFirst:true,deterministic:false,browserEligible:true,externalOptional:false,fallbackIds:[],resources:{cpu:"medium",memoryMb:512,gpu:"optional"}},
  {id:"ocr",version:"1.0.0",executionClass:"local-ml",runtimeTargets:["browser","worker"],localFirst:true,deterministic:false,browserEligible:true,externalOptional:false,fallbackIds:[],resources:{cpu:"medium",memoryMb:512,gpu:"optional"}},
  {id:"video.compose",version:"1.0.0",executionClass:"procedural",runtimeTargets:["browser","worker"],localFirst:true,deterministic:true,browserEligible:true,externalOptional:false,fallbackIds:[],resources:{cpu:"heavy",memoryMb:1024,gpu:"optional"}},
];

export function executableCapabilities(){ return [...EXECUTABLE]; }
export function capabilityManifests(){ return [...EXECUTABLE.map((x)=>x.manifest), ...DECLARATIVE]; }
export function registeredCapabilities(){ return capabilityManifests().map((x)=>x.id); }
export function findExecutableCapability(task:SasiKernelTask){ return EXECUTABLE.find((x)=>x.canRun(task)) ?? null; }
export function findCapabilityManifest(id:string){ return capabilityManifests().find((x)=>x.id===id) ?? null; }
