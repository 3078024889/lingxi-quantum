import {extractHandwritingPixels} from "./signature-ink";
export type CopyTone="bw"|"gray"|"color";
export type PreparedImage={dataUrl:string;width:number;height:number};

function loadImage(src:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("IMAGE_LOAD_FAILED"));im.src=src;});}
function fileData(file:File){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("IMAGE_READ_FAILED"));r.readAsDataURL(file);});}
const SAFE_SVG_ELEMENTS=new Set(["svg","g","path","rect","circle","ellipse","line","polyline","polygon","defs","lineargradient","radialgradient","stop","clippath","mask","pattern","title","desc","text","tspan"]);
const SAFE_SVG_ATTRIBUTES=new Set(["xmlns","viewbox","width","height","x","y","cx","cy","r","rx","ry","x1","y1","x2","y2","points","d","fill","fill-opacity","fill-rule","stroke","stroke-width","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-dasharray","stroke-dashoffset","stroke-opacity","opacity","transform","offset","stop-color","stop-opacity","gradientunits","gradienttransform","spreadmethod","clip-path","mask","id","preserveaspectratio","font-size","font-family","font-weight","font-style","text-anchor","dominant-baseline","dx","dy","rotate","vector-effect","clip-rule","patternunits","patterncontentunits","patterntransform","patternx","patterny","patternwidth","patternheight"]);
function sanitizeSvg(source:string){
 if(source.length>2_000_000)throw new Error("SVG_TOO_LARGE");
 const doc=new DOMParser().parseFromString(source,"image/svg+xml"),root=doc.documentElement;
 if(doc.querySelector("parsererror")||root.localName.toLowerCase()!=="svg")throw new Error("INVALID_SVG");
 const nodes=Array.from(root.querySelectorAll("*"));
 if(nodes.length>50000)throw new Error("SVG_TOO_COMPLEX");
 for(const node of nodes){
  if(!SAFE_SVG_ELEMENTS.has(node.localName.toLowerCase())){node.remove();continue;}
  for(const attr of Array.from(node.attributes)){
   const name=attr.name.toLowerCase(),value=attr.value.trim();
   if(!SAFE_SVG_ATTRIBUTES.has(name)||name.startsWith("on")||name==="href"||name==="xlink:href"){node.removeAttribute(attr.name);continue;}
   if(/url\\s*\\(/i.test(value)&&!/^url\\(\\s*#[\\w:.-]+\\s*\\)$/i.test(value)){node.removeAttribute(attr.name);continue;}
   if(/(?:javascript|https?|file|data):/i.test(value)){node.removeAttribute(attr.name);continue;}
   if(name==="id"&&!/^[\\w:.-]{1,128}$/.test(value))node.removeAttribute(attr.name);
  }
 }
 for(const attr of Array.from(root.attributes)){
  const name=attr.name.toLowerCase(),value=attr.value.trim();
  if(!SAFE_SVG_ATTRIBUTES.has(name)||name.startsWith("on")||name==="href"||name==="xlink:href"||/(?:javascript|https?|file|data):/i.test(value))root.removeAttribute(attr.name);
 }
 if(!root.hasAttribute("xmlns"))root.setAttribute("xmlns","http://www.w3.org/2000/svg");
 return new XMLSerializer().serializeToString(root);
}
async function loadFileImage(file:File){
 const svg=(file.type||"").toLowerCase()==="image/svg+xml"||/\\.svg$/i.test(file.name);
 if(!svg)return loadImage(await fileData(file));
 const source=await file.text(),safe=sanitizeSvg(source),url=URL.createObjectURL(new Blob([safe],{type:"image/svg+xml"}));
 try{return await loadImage(url)}finally{URL.revokeObjectURL(url)}
}

export async function prepareSignatureOrStamp(file:File,mode:"signature"|"stamp"="stamp",sensitivity=60):Promise<PreparedImage>{
 const im=await loadFileImage(file);if(!im.naturalWidth||!im.naturalHeight)throw new Error("IMAGE_DIMENSIONS_UNSAFE");const c=document.createElement("canvas");const maxDimension=mode==="signature"?2048:6000,maxPixels=mode==="signature"?4_000_000:20_000_000;const scale=Math.min(1,maxDimension/Math.max(im.naturalWidth,im.naturalHeight),Math.sqrt(maxPixels/(im.naturalWidth*im.naturalHeight)));c.width=Math.max(1,Math.round(im.naturalWidth*scale));c.height=Math.max(1,Math.round(im.naturalHeight*scale));const ctx=c.getContext("2d");if(!ctx)throw new Error("CANVAS_UNAVAILABLE");ctx.drawImage(im,0,0);
 if(mode==="signature"){
  const image=ctx.getImageData(0,0,c.width,c.height);
  // Keep the ink and its original alpha when a signature is already transparent.
  // Re-extraction against a white-paper model damages premade transparent PNGs.
  const imagePixels=image.data,total=c.width*c.height;
  let clear=0,visible=0,minX=c.width,minY=c.height,maxX=-1,maxY=-1;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
   const k=(y*c.width+x)*4,a=imagePixels[k+3];
   if(a<=12){clear++;continue}
   if(a>=24){visible++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
  }
  if(clear>total*.015&&visible>0&&visible<total*.92&&maxX>=minX){
   const pad=Math.max(3,Math.round(Math.max(maxX-minX+1,maxY-minY+1)*.05));
   const sx=Math.max(0,minX-pad),sy=Math.max(0,minY-pad),ex=Math.min(c.width,maxX+pad+1),ey=Math.min(c.height,maxY+pad+1);
   const cropped=document.createElement("canvas");cropped.width=ex-sx;cropped.height=ey-sy;
   const cropCtx=cropped.getContext("2d");if(!cropCtx)throw new Error("CANVAS_UNAVAILABLE");
   cropCtx.drawImage(c,sx,sy,cropped.width,cropped.height,0,0,cropped.width,cropped.height);
   return {dataUrl:cropped.toDataURL("image/png"),width:cropped.width,height:cropped.height};
  }
  const out=extractHandwritingPixels(image.data,c.width,c.height,sensitivity);
  const cut=document.createElement("canvas");cut.width=out.width;cut.height=out.height;
  const cutCtx=cut.getContext("2d");if(!cutCtx)throw new Error("CANVAS_UNAVAILABLE");
  const pixels=cutCtx.createImageData(out.width,out.height);pixels.data.set(out.pixels);
  cutCtx.putImageData(pixels,0,0);
  return {dataUrl:cut.toDataURL("image/png"),width:cut.width,height:cut.height};
 }
 const img=ctx.getImageData(0,0,c.width,c.height),d=img.data;
 let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4,r=d[i],g=d[i+1],b=d[i+2];const mx=Math.max(r,g,b),mn=Math.min(r,g,b),nearWhite=mx>238&&mn>225;if(nearWhite)d[i+3]=0;else if(d[i+3]>12){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}}
 ctx.putImageData(img,0,0);if(maxX<minX||maxY<minY)return{dataUrl:c.toDataURL("image/png"),width:c.width,height:c.height};
 const pad=Math.max(3,Math.round(Math.max(maxX-minX+1,maxY-minY+1)*.035));const sx=Math.max(0,minX-pad),sy=Math.max(0,minY-pad),ex=Math.min(c.width,maxX+pad+1),ey=Math.min(c.height,maxY+pad+1);const out=document.createElement("canvas");out.width=ex-sx;out.height=ey-sy;out.getContext("2d")!.drawImage(c,sx,sy,out.width,out.height,0,0,out.width,out.height);return{dataUrl:out.toDataURL("image/png"),width:out.width,height:out.height};
}

export async function renderDocumentCopyImage(file:File,tone:CopyTone):Promise<HTMLCanvasElement>{
 const im=await loadFileImage(file);const c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;const ctx=c.getContext("2d")!;ctx.drawImage(im,0,0);if(tone==="color")return c;const img=ctx.getImageData(0,0,c.width,c.height),d=img.data;
 for(let i=0;i<d.length;i+=4){const gray=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];let v=tone==="gray"?gray:(gray>210?255:gray<70?0:(gray-70)/140*255);if(tone==="gray")v=v>242?255:Math.max(0,Math.min(255,(v-18)*1.12));d[i]=d[i+1]=d[i+2]=Math.round(v);}ctx.putImageData(img,0,0);return c;
}
