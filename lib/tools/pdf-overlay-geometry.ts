/** PDF editor percent geometry: bound every resize to the visible page. */
export type PdfOverlayBounds=Readonly<{x:number;y:number;w:number;h:number;ratio?:number}>;
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const round=(n:number)=>Math.round(n*1000)/1000;
export function pdfEditorPreviewScale(width:number,height:number,dpr=1,mode:"editor"|"preview"="editor"){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return 1;
  const budget=mode==="editor"?4_000_000:2_100_000;
  const density=Math.max(mode==="editor"?1.55:1.45,clamp(Number.isFinite(dpr)?dpr:1,1,2));
  return Math.max(0.00001,Math.min(760/width*density,mode==="editor"?2.9:2.6,Math.sqrt(budget/(width*height))));
}
export function resizePdfOverlay(o:PdfOverlayBounds,dx:number,dy:number,stageW:number,stageH:number):{w:number;h:number}{
  if(![dx,dy,stageW,stageH].every(Number.isFinite)||stageW<=0||stageH<=0)return{w:o.w,h:o.h};
  const roomW=Math.max(.01,100-clamp(o.x,0,99.99)),roomH=Math.max(.01,100-clamp(o.y,0,99.99));
  const proposedW=clamp(o.w+dx*100/stageW,.5,roomW);
  if(typeof o.ratio==="number"&&Number.isFinite(o.ratio)&&o.ratio>0){
    const heightPerWidth=stageW/(stageH*o.ratio);
    const maxW=Math.max(.01,Math.min(roomW,roomH/heightPerWidth));
    const minW=Math.min(maxW,Math.max(.5,.5/heightPerWidth));
    const w=clamp(proposedW,minW,maxW);
    return{w:round(w),h:round(w*heightPerWidth)};
  }
  return{w:round(proposedW),h:round(clamp(o.h+dy*100/stageH,.5,roomH))};
}
