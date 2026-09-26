import type { SasiAutonomyRoute, SasiAutonomyTask } from "./types";

const ROUTES: Record<SasiAutonomyTask, SasiAutonomyRoute> = {
  "knowledge-answer": {
    task:"knowledge-answer",
    primary:["knowledge-retrieve","knowledge-rank","knowledge-validate"],
    executionClass:"deterministic",
    externalModelRequired:false,
    reasons:["owned-knowledge-retrieval","deterministic-ranking","evidence-first"],
  },
  "document-parse": {
    task:"document-parse",
    primary:["document-parse"],
    executionClass:"deterministic",
    externalModelRequired:false,
    reasons:["parser-first"],
  },
  "file-convert": {
    task:"file-convert",
    primary:["file-convert"],
    executionClass:"deterministic",
    externalModelRequired:false,
    reasons:["codec-or-format-conversion"],
  },
  "ocr": {
    task:"ocr",
    primary:["ocr"],
    executionClass:"local-ml",
    externalModelRequired:false,
    reasons:["local-vision-model-sufficient"],
  },
  "image-enhance": {
    task:"image-enhance",
    primary:["image-process"],
    executionClass:"local-ml",
    externalModelRequired:false,
    reasons:["cv-or-local-model-first"],
  },
  "subtitle-transform": {
    task:"subtitle-transform",
    primary:["subtitle-process"],
    executionClass:"deterministic",
    externalModelRequired:false,
    reasons:["timeline-and-text-transform"],
  },
  "video-compose": {
    task:"video-compose",
    primary:["video-compose","audio-process","subtitle-process"],
    executionClass:"procedural",
    externalModelRequired:false,
    reasons:["timeline-scene-graph-ffmpeg-first"],
  },
  "website-layout": {
    task:"website-layout",
    primary:["layout-generate"],
    executionClass:"procedural",
    externalModelRequired:false,
    reasons:["rules-layout-components-first"],
  },
  "open-ended-writing": {
    task:"open-ended-writing",
    primary:["semantic-write"],
    executionClass:"semantic-generation",
    externalModelRequired:true,
    reasons:["open-ended-semantics"],
  },
  "complex-reasoning": {
    task:"complex-reasoning",
    primary:["knowledge-retrieve","knowledge-validate","semantic-reason"],
    executionClass:"semantic-generation",
    externalModelRequired:true,
    reasons:["ground-first","semantic-reasoning-only-when-needed"],
  },
  "multimodal-generation": {
    task:"multimodal-generation",
    primary:["layout-generate","video-compose","multimodal-generate"],
    executionClass:"semantic-generation",
    externalModelRequired:true,
    reasons:["procedural-baseline-first","generative-enhancement-optional-until-requested"],
  },
};

export function routeSasiTask(task: SasiAutonomyTask): SasiAutonomyRoute {
  return ROUTES[task];
}

export function routeRequiresExternalModel(task: SasiAutonomyTask) {
  return routeSasiTask(task).externalModelRequired;
}

export function autonomousBaselineAvailable(task: SasiAutonomyTask) {
  const route = routeSasiTask(task);
  return route.primary.some((id) =>
    !["semantic-write","semantic-reason","multimodal-generate"].includes(id),
  );
}
