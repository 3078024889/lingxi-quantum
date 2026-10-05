export type SasiStreamEvent=
 |{type:"RUN_STARTED";threadId:string;turnId:string;runId:string;at:string}
 |{type:"TEXT_DELTA";turnId:string;delta:string;at:string}
 |{type:"STATE_SNAPSHOT";threadId:string;state:Record<string,unknown>;at:string}
 |{type:"STEP_STARTED";runId:string;stepId:string;label?:string;at:string}
 |{type:"STEP_FINISHED";runId:string;stepId:string;resultRef?:string;at:string}
 |{type:"ARTIFACT_CREATED";runId:string;artifactId:string;versionId:string;kind:string;at:string}
 |{type:"APPROVAL_REQUIRED";runId:string;approvalId:string;summary:string;at:string}
 |{type:"RUN_WAITING";runId:string;reason:string;at:string}
 |{type:"RUN_RESUMED";runId:string;at:string}
 |{type:"RUN_COMPLETED";runId:string;at:string}
 |{type:"RUN_FAILED";runId:string;recoverable:boolean;at:string};

export const sasiEvent=(event:SasiStreamEvent)=>event;
