/** Client UX gate only; server RPC is authoritative. A browser-local tool
 * cannot be protected against developers modifying client JavaScript.
 * Production release requires per-execution server integration and acceptance.
 */
export type ToolPassStartResult={
 ok:boolean;
 reason:"legacy"|"free"|"pass"|"login_required"|"payment_required"|"unavailable";
};
export async function authorizeToolPassStart(toolId:string,operationId:string):Promise<ToolPassStartResult>{
 if(process.env.NEXT_PUBLIC_LINGXIFIELD_TOOL_PASS_ENABLED!=="true")
  return {ok:true,reason:"legacy"};
 if(typeof toolId!=="string"||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(toolId))
  return {ok:false,reason:"unavailable"};
 try{
  const res=await fetch("/api/tools/pass/claim",{
   method:"POST",
   headers:{"content-type":"application/json"},
   credentials:"same-origin",
   cache:"no-store",
   body:JSON.stringify({toolId,operationId})
  });
  const data=await res.json().catch(()=>({}));
  if(res.ok&&data?.ok===true&&(data.access==="free"||data.access==="pass"))
   return {ok:true,reason:data.access};
  if(res.status===401)return {ok:false,reason:"login_required"};
  if(res.status===409&&data?.error==="FREE_USED_PASS_REQUIRED")
   return {ok:false,reason:"payment_required"};
 }catch{}
 return {ok:false,reason:"unavailable"};
}
