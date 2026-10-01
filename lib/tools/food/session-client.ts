export async function createFoodImageSession(files:File[]){
 // Only a small, normalized image is needed to bind the request. Original files stay in the browser.
 const fd=new FormData();
 for(const f of files){
  const bitmap=await createImageBitmap(f);
  try{const scale=Math.min(1,384/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('IMAGE_SESSION_FAILED');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(x=>x?resolve(x):reject(new Error('IMAGE_SESSION_FAILED')),'image/jpeg',.65));fd.append('images',blob,'food.jpg');}finally{bitmap.close();}
 }
 const r=await fetch("/api/tools/food/session",{method:"POST",body:fd});const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(String(d.error||"IMAGE_SESSION_FAILED"));
 return d as{sessionId:string;photoCount:number;expiresAt:string};
}
