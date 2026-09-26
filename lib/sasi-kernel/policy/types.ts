export type SasiExecutionClass="deterministic"|"local-ml"|"procedural"|"semantic-generation";
export type SasiAutonomousCapabilityId=
 |"document-parse"|"file-convert"|"knowledge-retrieve"|"knowledge-rank"|"knowledge-validate"
 |"image-process"|"image-generate"|"image-generate-native"|"ocr"|"subtitle-process"
 |"video-compose"|"video-render"|"video-generate-native"|"audio-process"|"layout-generate"
 |"semantic-write"|"semantic-reason"|"semantic-reason-native"|"director-native"|"multimodal-generate";
export type SasiAutonomousCapability={
 id:SasiAutonomousCapabilityId;
 executionClass:SasiExecutionClass;
 localFirst:boolean;
 browserEligible:boolean;
 deterministic:boolean;
 fallbackIds:SasiAutonomousCapabilityId[];
};
export type SasiAutonomyTask=
 |"knowledge-answer"|"document-parse"|"file-convert"|"ocr"|"image-enhance"|"image-generate"
 |"subtitle-transform"|"video-compose"|"video-render"|"website-layout"|"open-ended-writing"
 |"complex-reasoning"|"multimodal-generation"|"director-plan";
export type SasiAutonomyRoute={
 task:SasiAutonomyTask;
 primary:SasiAutonomousCapabilityId[];
 executionClass:SasiExecutionClass;
 externalModelRequired:boolean;
 reasons:string[];
};
