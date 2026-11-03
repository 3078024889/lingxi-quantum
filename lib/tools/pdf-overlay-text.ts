/** Draw PDF overlay text at the requested font size even after canvas resize resets context state. */
export async function renderPdfTextImage(text:string,size=28):Promise<Uint8Array>{
 const canvas=document.createElement("canvas");
 const context=canvas.getContext("2d");
 if(!context)throw new Error("CANVAS_UNAVAILABLE");
 const safeSize=Math.max(6,Math.min(192,Number.isFinite(size)?size:28));
 const font=`${safeSize}px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif`;
 context.font=font;
 const measured=context.measureText(text);
 canvas.width=Math.max(32,Math.ceil(measured.width+20));
 canvas.height=Math.max(40,Math.ceil(safeSize*1.7));
 const draw=canvas.getContext("2d");
 if(!draw)throw new Error("CANVAS_UNAVAILABLE");
 // Changing canvas width or height resets text styles to the browser default.
 draw.font=font;
 draw.fillStyle="#142033";
 draw.textBaseline="middle";
 draw.fillText(text,10,canvas.height/2);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("TEXT_RENDER_FAILED")),"image/png"));
 return new Uint8Array(await blob.arrayBuffer());
}
