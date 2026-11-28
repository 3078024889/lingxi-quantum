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
  // Uploaded documents cannot opt into dynamic font-code evaluation or XFA.
  return pdfjs.getDocument({data,isEvalSupported:false,enableXfa:false}).promise;
}

export async function renderPdfPage(pdf:any,pageNumber:number,scale=1.5):Promise<RenderedPdfPage>{
  const page=await pdf.getPage(pageNumber);
  const viewport=page.getViewport({scale});
  // Reject oversized raster output explicitly; never silently omit PDF images.
  const width=Math.ceil(viewport.width),height=Math.ceil(viewport.height);
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||width*height>40_000_000)
    throw new Error("PDF_PAGE_TOO_LARGE");
  const canvas=document.createElement("canvas");
  canvas.width=width;
  canvas.height=height;
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

export {downloadBlob} from "@/lib/tools/shared/download";
