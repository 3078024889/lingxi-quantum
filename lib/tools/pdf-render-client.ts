export type RenderedPdfPage = {
  pageNumber:number;
  canvas:HTMLCanvasElement;
  width:number;
  height:number;
};

let configured=false;

export async function loadPdfJs(){
  const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
  if(!configured){
    pdfjs.GlobalWorkerOptions.workerSrc="/pdfjs/pdf.worker.min.mjs";
    configured=true;
  }
  return pdfjs;
}

export async function openPdf(file:File){
  const pdfjs=await loadPdfJs();
  const data=new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({data}).promise;
}

export async function renderPdfPage(pdf:any,pageNumber:number,scale=1.5):Promise<RenderedPdfPage>{
  const page=await pdf.getPage(pageNumber);
  const viewport=page.getViewport({scale});
  const canvas=document.createElement("canvas");
  canvas.width=Math.ceil(viewport.width);
  canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext("2d",{alpha:false});
  if(!ctx)throw new Error("Canvas is not available.");
  await page.render({canvasContext:ctx,viewport}).promise;
  return {pageNumber,canvas,width:canvas.width,height:canvas.height};
}

export function canvasToBlob(canvas:HTMLCanvasElement,type="image/jpeg",quality=.9){
  return new Promise<Blob>((resolve,reject)=>{
    canvas.toBlob(b=>b?resolve(b):reject(new Error("Image export failed.")),type,quality);
  });
}

export function downloadBlob(blob:Blob,name:string){
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=name;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
