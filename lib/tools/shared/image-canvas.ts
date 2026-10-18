import { replaceExt } from "./download";

export async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  try { return await createImageBitmap(file); }
  catch (cause) {
    if(file.type!=="image/svg+xml"&&!/\.svg$/i.test(file.name))throw cause;
    // Some browsers can display an SVG image but cannot decode its Blob directly
    // into ImageBitmap. Rasterize in image context; never insert SVG into the DOM.
    const url=URL.createObjectURL(file),image=new Image();
    let canvas:HTMLCanvasElement|undefined,timer:ReturnType<typeof setTimeout>|undefined;
    try{
      await new Promise<void>((resolve,reject)=>{
        image.onload=()=>resolve();image.onerror=()=>reject(new Error("IMAGE_LOAD_FAILED"));
        timer=setTimeout(()=>reject(new Error("IMAGE_LOAD_TIMEOUT")),10000);image.src=url;
      });
      const w=image.naturalWidth,h=image.naturalHeight;
      if(!w||!h||w*h>33554432)throw new Error("IMAGE_TOO_LARGE");
      canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext("2d");if(!ctx)throw new Error("CANVAS_UNAVAILABLE");
      ctx.drawImage(image,0,0);
      return await createImageBitmap(canvas);
    }finally{
      clearTimeout(timer);image.onload=null;image.onerror=null;image.src="";
      URL.revokeObjectURL(url);if(canvas){canvas.width=0;canvas.height=0}
    }
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality,
    );
  });
}

export async function drawFileToCanvas(
  file: File,
  opts?: { maxWidth?: number; maxHeight?: number; width?: number; height?: number; background?: "white" | "transparent" },
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const bmp = await loadImageBitmap(file);
  let w = opts?.width ?? bmp.width;
  let h = opts?.height ?? bmp.height;

  if (opts?.maxWidth || opts?.maxHeight) {
    const mw = opts.maxWidth ?? w;
    const mh = opts.maxHeight ?? h;
    const scale = Math.min(1, mw / w, mh / h);
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {bmp.close?.();canvas.width=0;canvas.height=0;throw new Error("2d context unavailable");}
  // Document/JPEG callers retain white; alpha-capable outputs opt into transparency.
  if (opts?.background !== "transparent") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  try{ctx.drawImage(bmp, 0, 0, w, h)}catch(error){canvas.width=0;canvas.height=0;throw error}finally{bmp.close?.()}
  return { canvas, width: w, height: h };
}

export async function convertImage(
  file: File,
  target: "image/jpeg" | "image/png" | "image/webp",
  quality = 0.92,
): Promise<{ blob: Blob; name: string; width: number; height: number }> {
  const { canvas, width, height } = await drawFileToCanvas(file,{background:target==="image/jpeg"?"white":"transparent"});
  const blob = await canvasToBlob(canvas, target, target === "image/png" ? undefined : quality);
  const ext = target === "image/jpeg" ? "jpg" : target === "image/png" ? "png" : "webp";
  return { blob, name: replaceExt(file.name, ext), width, height };
}

export async function resizeImage(
  file: File,
  width: number,
  height: number,
  keepAspect: boolean,
  target: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.92,
): Promise<{ blob: Blob; name: string; width: number; height: number }> {
  const bmp = await loadImageBitmap(file);
  let w = width;
  let h = height;
  if (keepAspect) {
    const scale = Math.min(width / bmp.width, height / bmp.height);
    w = Math.max(1, Math.round(bmp.width * scale));
    h = Math.max(1, Math.round(bmp.height * scale));
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  if (target === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  const blob = await canvasToBlob(canvas, target, target === "image/png" ? undefined : quality);
  const ext = target === "image/jpeg" ? "jpg" : "png";
  return { blob, name: replaceExt(file.name, ext), width: w, height: h };
}

/** Search quality first, then adapt dimensions; never deliver above the requested size. */
export async function compressImageToTarget(
  file: File,
  targetBytes: number,
  opts?: { minQuality?: number; maxQuality?: number; maxDimension?: number },
): Promise<{ blob: Blob; name: string; width: number; height: number; quality: number; rounds: number }> {
  if(!Number.isFinite(targetBytes)||targetBytes<1)throw new Error("IMAGE_TARGET_INVALID");
  const minQ=opts?.minQuality??.35,maxQ=opts?.maxQuality??.95;
  if(!Number.isFinite(minQ)||!Number.isFinite(maxQ)||minQ<=0||maxQ>1||minQ>maxQ)throw new Error("IMAGE_QUALITY_INVALID");
  const maxDim=opts?.maxDimension??4096;
  let {canvas,width,height}=await drawFileToCanvas(file,{maxWidth:maxDim,maxHeight:maxDim});
  let rounds=0;
  for(let resize=0;resize<14;resize++){
    rounds++;const smallest=await canvasToBlob(canvas,"image/jpeg",minQ);
    if(smallest.size<=targetBytes){
      let best=smallest,bestQ=minQ,lo=minQ,hi=maxQ;
      rounds++;const highest=await canvasToBlob(canvas,"image/jpeg",maxQ);
      if(highest.size<=targetBytes){best=highest;bestQ=maxQ}
      else for(let n=0;n<8;n++){
        const q=(lo+hi)/2;rounds++;const encoded=await canvasToBlob(canvas,"image/jpeg",q);
        if(encoded.size<=targetBytes){best=encoded;bestQ=q;lo=q}else hi=q;
      }
      return{blob:best,name:replaceExt(file.name,"jpg"),width,height,quality:bestQ,rounds};
    }
    if(width===1&&height===1)break;
    // JPEG size roughly follows pixel count. The safety factor avoids spending
    // the whole budget on quality searches at dimensions that cannot fit.
    const scale=Math.max(.1,Math.min(.9,Math.sqrt(targetBytes/smallest.size)*.9));
    const nextWidth=Math.max(1,Math.floor(width*scale)),nextHeight=Math.max(1,Math.floor(height*scale));
    const next=document.createElement("canvas");next.width=nextWidth;next.height=nextHeight;
    const ctx=next.getContext("2d");if(!ctx)throw new Error("CANVAS_UNAVAILABLE");
    ctx.fillStyle="#ffffff";ctx.fillRect(0,0,nextWidth,nextHeight);ctx.drawImage(canvas,0,0,nextWidth,nextHeight);
    canvas.width=canvas.height=1;canvas=next;width=nextWidth;height=nextHeight;
  }
  throw new Error("IMAGE_TARGET_UNREACHABLE");
}

/** Re-encode via canvas to strip EXIF/metadata. */
export async function stripImageMetadata(file: File): Promise<{ blob: Blob; name: string }> {
  const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
  const isWebp = file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp");
  const target=isPng?"image/png":isWebp?"image/webp":"image/jpeg";
  const { canvas } = await drawFileToCanvas(file,{background:target==="image/jpeg"?"white":"transparent"});
  try{
    const blob = await canvasToBlob(canvas,target,isPng?undefined:isWebp?1:0.95);
    const ext=blob.type==="image/png"?"png":blob.type==="image/webp"?"webp":blob.type==="image/jpeg"?"jpg":null;
    if(!ext)throw new Error("IMAGE_EXPORT_FAILED");
    return { blob, name: replaceExt(file.name,ext) };
  }finally{canvas.width=canvas.height=1}
}
