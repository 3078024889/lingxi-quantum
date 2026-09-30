import type {LivingSiteProject} from "./living-project";
export interface DeploymentRequest{project:LivingSiteProject;target:"preview"|"production";domain?:string}
export interface DeploymentResult{ok:boolean;deploymentId?:string;url?:string;issues:string[]}
export interface DeploymentAdapter{deploy(request:DeploymentRequest):Promise<DeploymentResult>}
export async function deployValidatedSite(adapter:DeploymentAdapter,request:DeploymentRequest){if(request.project.publishedRevision!==request.project.current.revision)return {ok:false,issues:["CURRENT_REVISION_NOT_PUBLISHED"]} satisfies DeploymentResult;return adapter.deploy(request)}
