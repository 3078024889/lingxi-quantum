export async function createFoodImageSession(files:File[]){
 const fd=new FormData();for(const f of files)fd.append("images",f);
 const r=await fetch("/api/tools/food/session",{method:"POST",body:fd});const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(String(d.error||"IMAGE_SESSION_FAILED"));
 return d as{sessionId:string;photoCount:number;expiresAt:string};
}