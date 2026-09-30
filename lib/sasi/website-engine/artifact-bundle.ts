export type WebsiteFile={path:string;content:string};
const SAFE=/^(?:index\.html|[a-z0-9][a-z0-9/_-]*\.(?:html|css|js|json|txt|xml))$/i;
export function validateBundle(files:WebsiteFile[]){
 if(!files.some(f=>f.path==="index.html"))throw new Error("WEBSITE_INDEX_MISSING");
 const seen=new Set<string>();
 for(const f of files){
  if(!SAFE.test(f.path)||f.path.includes("..")||seen.has(f.path)||f.content.length>500_000)throw new Error("WEBSITE_FILE_INVALID");
  seen.add(f.path);
  if(/<form\b/i.test(f.content)&&!/data-lx-static-form/i.test(f.content))throw new Error("WEBSITE_UNBACKED_FORM_FORBIDDEN");
  if(/(?:api[_-]?key|secret)\s*[:=]/i.test(f.content))throw new Error("WEBSITE_SECRET_LIKE_CONTENT");
 }
 return files;
}
export function bundleStats(files:WebsiteFile[]){return{files:files.length,bytes:files.reduce((n,f)=>n+Buffer.byteLength(f.content),0)}}
