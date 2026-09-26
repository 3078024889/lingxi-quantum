export type SasiExecutionClass =
  | "deterministic"
  | "local-ml"
  | "procedural"
  | "semantic-generation";

export type SasiAutonomousCapabilityId =
  | "document-parse"
  | "file-convert"
  | "knowledge-retrieve"
  | "knowledge-rank"
  | "knowledge-validate"
  | "image-process"
  | "ocr"
  | "subtitle-process"
  | "video-compose"
  | "audio-process"
  | "layout-generate"
  | "semantic-write"
  | "semantic-reason"
  | "multimodal-generate";

export type SasiAutonomousCapability = {
  id: SasiAutonomousCapabilityId;
  executionClass: SasiExecutionClass;
  localFirst: boolean;
  browserEligible: boolean;
  deterministic: boolean;
  fallbackIds: SasiAutonomousCapabilityId[];
};

export type SasiAutonomyTask =
  | "knowledge-answer"
  | "document-parse"
  | "file-convert"
  | "ocr"
  | "image-enhance"
  | "subtitle-transform"
  | "video-compose"
  | "website-layout"
  | "open-ended-writing"
  | "complex-reasoning"
  | "multimodal-generation";

export type SasiAutonomyRoute = {
  task: SasiAutonomyTask;
  primary: SasiAutonomousCapabilityId[];
  executionClass: SasiExecutionClass;
  externalModelRequired: boolean;
  reasons: string[];
};
