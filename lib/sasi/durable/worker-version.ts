import "server-only";

export const SASI_WORKFLOW_COMPATIBILITY={
 "knowledge.generate":["knowledge.v1"],
}as const;

export type SasiJobKind=keyof typeof SASI_WORKFLOW_COMPATIBILITY;

export function workerSupports(jobKind:string,workflowVersion:string){
 const versions=(SASI_WORKFLOW_COMPATIBILITY as Record<string,readonly string[]>)[jobKind];
 return Boolean(versions?.includes(workflowVersion));
}

export function currentWorkerBuild(){
 return String(process.env.SASI_WORKER_BUILD||process.env.VERCEL_GIT_COMMIT_SHA||"r15-local").slice(0,120);
}
