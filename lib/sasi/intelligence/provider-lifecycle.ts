// Official lifecycle notice: https://developers.openai.com/api/docs/deprecations
export function officialOpenAiVideoRetired(provider:string,baseUrl?:string|null){
 if(provider!=='openai')return false;
 try{const host=new URL(baseUrl?.trim()||'https://api.openai.com/v1').hostname.toLowerCase();return host==='openai.com'||host.endsWith('.openai.com')}catch{return true}
}
