export interface SecretRef{connectionId:string;secretId:string}
export interface ServerConnection{connectionId:string;baseUrl:string;model:string;headers:Record<string,string>;secret:SecretRef}
export function publicConnection(x:ServerConnection){return {connectionId:x.connectionId,baseUrl:x.baseUrl,model:x.model}}
export function assertServerSecretEnvironment(name:string){if(name.startsWith("NEXT_PUBLIC_"))throw new Error("PUBLIC_SECRET_FORBIDDEN")}
