import type {SasiAutonomyRoute,SasiAutonomyTask} from "./types";
const ROUTES:Record<SasiAutonomyTask,SasiAutonomyRoute>={
"knowledge-answer":{task:"knowledge-answer",primary:["knowledge-retrieve","knowledge-rank","knowledge-validate"],executionClass:"deterministic",externalModelRequired:false,reasons:["owned-knowledge-retrieval","deterministic-ranking","evidence-first"]},
"document-parse":{task:"document-parse",primary:["document-parse"],executionClass:"deterministic",externalModelRequired:false,reasons:["parser-first"]},
"file-convert":{task:"file-convert",primary:["file-convert"],executionClass:"deterministic",externalModelRequired:false,reasons:["codec-or-format-conversion"]},
"ocr":{task:"ocr",primary:["ocr"],executionClass:"local-ml",externalModelRequired:false,reasons:["local-vision-model-sufficient"]},
"image-enhance":{task:"image-enhance",primary:["image-process"],executionClass:"local-ml",externalModelRequired:false,reasons:["cv-or-local-model-first"]},
"image-generate":{task:"image-generate",primary:["image-generate-native","image-generate","layout-generate"],executionClass:"semantic-generation",externalModelRequired:false,reasons:["native-generative-model-first","procedural-fallback"]},
"subtitle-transform":{task:"subtitle-transform",primary:["subtitle-process"],executionClass:"deterministic",externalModelRequired:false,reasons:["timeline-and-text-transform"]},
"video-compose":{task:"video-compose",primary:["video-compose","audio-process","subtitle-process"],executionClass:"procedural",externalModelRequired:false,reasons:["timeline-scene-graph-ffmpeg-first"]},
"video-render":{task:"video-render",primary:["video-generate-native","video-render","image-generate-native","subtitle-process"],executionClass:"semantic-generation",externalModelRequired:false,reasons:["native-video-model-first","composition-fallback"]},
"director-plan":{task:"director-plan",primary:["director-native","knowledge-retrieve","knowledge-validate"],executionClass:"semantic-generation",externalModelRequired:false,reasons:["native-reasoning-director","continuity-aware"]},
"website-layout":{task:"website-layout",primary:["layout-generate"],executionClass:"procedural",externalModelRequired:false,reasons:["rules-layout-components-first"]},
"open-ended-writing":{task:"open-ended-writing",primary:["semantic-reason-native","semantic-write"],executionClass:"semantic-generation",externalModelRequired:false,reasons:["native-open-weight-reasoning-first"]},
"complex-reasoning":{task:"complex-reasoning",primary:["knowledge-retrieve","knowledge-validate","semantic-reason-native","semantic-reason"],executionClass:"semantic-generation",externalModelRequired:false,reasons:["ground-first","native-reasoning"]},
"multimodal-generation":{task:"multimodal-generation",primary:["semantic-reason-native","image-generate-native","video-generate-native","multimodal-generate"],executionClass:"semantic-generation",externalModelRequired:false,reasons:["native-multimodal-capability-graph","external-only-optional"]},
};
export function routeSasiTask(task:SasiAutonomyTask){return ROUTES[task]}
export function routeRequiresExternalModel(task:SasiAutonomyTask){return routeSasiTask(task).externalModelRequired}
export function autonomousBaselineAvailable(task:SasiAutonomyTask){return routeSasiTask(task).primary.length>0}
