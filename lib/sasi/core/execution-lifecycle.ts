export const SASI_EXECUTION_PHASES=["idle","preparing","quoted","running","succeeded","failed","uncertain"] as const;
export type SasiExecutionPhase=typeof SASI_EXECUTION_PHASES[number];

export type SasiPersistedTaskState="created"|"planning"|"queued"|"running"|"validating"|"retrying"|"succeeded"|"failed"|"cancelled";

export function phaseFromTaskState(state:SasiPersistedTaskState):SasiExecutionPhase{
 if(state==="created"||state==="planning"||state==="queued")return"preparing";
 if(state==="running"||state==="validating"||state==="retrying")return"running";
 if(state==="succeeded")return"succeeded";
 return"failed";
}

export function deriveExecutionPhase(input:{busy:boolean;quoteReady?:boolean;hasResult?:boolean;uncertain?:boolean;failed?:boolean}):SasiExecutionPhase{
 if(input.uncertain)return"uncertain";
 if(input.failed)return"failed";
 if(input.busy)return"running";
 if(input.hasResult)return"succeeded";
 if(input.quoteReady)return"quoted";
 return"idle";
}

export function isTerminalExecutionPhase(phase:SasiExecutionPhase){return phase==="succeeded"||phase==="failed"}
export function isBusyExecutionPhase(phase:SasiExecutionPhase){return phase==="preparing"||phase==="running"}
