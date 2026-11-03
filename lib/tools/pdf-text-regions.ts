/** Map text coordinates from PDF.js/Tesseract to the responsive PDF editor viewport.
 * Visual editing overlays the original PDF; it is NOT a secure redaction.
 */
export type PdfTextRegion={key:string;text:string;x:number;y:number;w:number;h:number;fontPt:number;source:"pdf"|"ocr";pdfX?:number;pdfY?:number};
type Viewport={width:number;height:number;transform:number[]};
const finite=(n:unknown)=>typeof n==="number"&&Number.isFinite(n)?n:0;
const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
function region(key:string,text:string,x:number,y:number,w:number,h:number,source:"pdf"|"ocr",pageW:number,pageH:number):PdfTextRegion|null{
 if(!text.trim()||!Number.isFinite(x+y+w+h)||pageW<=0||pageH<=0||w<=0||h<=0)return null;
 const left=clamp(x/pageW*100,0,99.8),top=clamp(y/pageH*100,0,99.8);
 const right=clamp((x+w)/pageW*100,0,100),bottom=clamp((y+h)/pageH*100,0,100);
 if(right-left<.12||bottom-top<.15)return null;
 return {key,text:text.trim(),x:left,y:top,w:right-left,h:bottom-top,fontPt:h,source};
}
export function pdfNativeTextRegions(content:{items?:unknown[]}|null|undefined,viewport:Viewport):PdfTextRegion[]{
 const items=content?.items||[],v=viewport.transform;
 if(!Array.isArray(items)||!Array.isArray(v)||v.length<6)return[];
 const out:PdfTextRegion[]=[];
 for(let i=0;i<items.length&&out.length<300;i++){
  const item=items[i] as {str?:string;transform?:number[];width?:number;height?:number};
  if(!item||typeof item.str!=="string"||!item.str.trim()||!Array.isArray(item.transform)||item.transform.length<6)continue;
  const t=item.transform;
  const baseX=finite(v[0])*finite(t[4])+finite(v[2])*finite(t[5])+finite(v[4]);
  const baseY=finite(v[1])*finite(t[4])+finite(v[3])*finite(t[5])+finite(v[5]);
  const horizontalX=finite(v[0])*finite(t[0])+finite(v[2])*finite(t[1]);
  const horizontalY=finite(v[1])*finite(t[0])+finite(v[3])*finite(t[1]);
  // Vertical/rotated text needs a separate transformation and is not a safe clickable target.
  if(Math.abs(horizontalY)>Math.abs(horizontalX)*.25)continue;
  const width=Math.abs(finite(item.width))*Math.hypot(v[0],v[1]);
  const height=Math.max(2,Math.abs(finite(item.height))*Math.hypot(v[2],v[3]),Math.hypot(finite(t[2]),finite(t[3])));
  const textX=horizontalX<0?baseX-width:baseX;
  const r=region("pdf-"+i,item.str,textX,baseY-height*.87,width,height,"pdf",viewport.width,viewport.height);
  if(r){r.pdfX=t[4];r.pdfY=t[5];out.push(r)}
 }
 return out;
}
type OcrBox={x0?:number;y0?:number;x1?:number;y1?:number};
export function pdfOcrTextRegions(blocks:unknown,pageW:number,pageH:number):PdfTextRegion[]{
 if(!Array.isArray(blocks)||pageW<=0||pageH<=0)return[];
 const out:PdfTextRegion[]=[];
 for(const block of blocks){
  for(const paragraph of (block?.paragraphs||[])){
   for(const line of (paragraph?.lines||[])){
    const words=Array.isArray(line?.words)?line.words:[];
    const text=String(line?.text||words.map((w:any)=>w.text||"").join(" ")).trim();
    const boxes=words.map((w:any)=>w.bbox as OcrBox).filter((x:any)=>x&&Number.isFinite(x.x0)&&Number.isFinite(x.y0)&&Number.isFinite(x.x1)&&Number.isFinite(x.y1));
    const b:OcrBox|null=line?.bbox||(boxes.length?{x0:Math.min(...boxes.map((x:any)=>x.x0)),y0:Math.min(...boxes.map((x:any)=>x.y0)),x1:Math.max(...boxes.map((x:any)=>x.x1)),y1:Math.max(...boxes.map((x:any)=>x.y1))}:null);
    if(!b)continue;
    const x=finite(b.x0),y=finite(b.y0),w=finite(b.x1)-x,h=finite(b.y1)-y;
    const r=region("ocr-"+out.length,text,x,y,w,h,"ocr",pageW,pageH);
    if(r)out.push(r);
    if(out.length>=300)return out;
   }
  }
 }
 return out;
}
