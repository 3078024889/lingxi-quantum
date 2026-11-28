import {workspaceImageSize,type ImageBox} from './image-workspace-geometry';
export type ImageWorkspaceEdits={crop:ImageBox;scale:number;mime:string;text:string;textBox:ImageBox;font:number;color:string;opacity:number;signature?:Blob;signatureBox:ImageBox};
/** Shared by the visible canvas editor and real raster-output acceptance tests. */
export async function renderWorkspaceImage(source:Blob,edits:ImageWorkspaceEdits){
 if(!['image/png','image/jpeg','image/webp'].includes(edits.mime)||!Number.isFinite(edits.font)||edits.font<=0||!Number.isFinite(edits.opacity)||edits.opacity<0||edits.opacity>1)throw Error('IMAGE_EDITS_INVALID');
 const bitmap=await createImageBitmap(source);
 try{
  const size=workspaceImageSize(bitmap.width,bitmap.height,edits.crop,edits.scale);
  const canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('IMAGE_CANVAS_UNAVAILABLE');
  if(edits.mime==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height)}
  ctx.scale(canvas.width/(size.crop.w*bitmap.width),canvas.height/(size.crop.h*bitmap.height));
  ctx.translate(-size.crop.x*bitmap.width,-size.crop.y*bitmap.height);ctx.drawImage(bitmap,0,0);
  ctx.globalAlpha=edits.opacity;ctx.font=`${edits.font*bitmap.width}px system-ui,sans-serif`;ctx.fillStyle=edits.color;ctx.textBaseline='top';
  if(edits.text)ctx.fillText(edits.text,edits.textBox.x*bitmap.width,edits.textBox.y*bitmap.height);
  if(edits.signature){
   const stamp=await createImageBitmap(edits.signature);
   try{ctx.drawImage(stamp,edits.signatureBox.x*bitmap.width,edits.signatureBox.y*bitmap.height,edits.signatureBox.w*bitmap.width,edits.signatureBox.h*bitmap.height)}finally{stamp.close?.()}
  }
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('IMAGE_EXPORT_FAILED')),edits.mime,.94));
  return{blob,width:size.width,height:size.height};
 }finally{bitmap.close?.()}
}
