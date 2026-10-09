/**
 * Browser-only handwritten ink extraction. No remote upload or AI provider.
 * Based on background normalization and alpha masking, not a white-pixel shortcut.
 * Input pixels are RGBA, output is a cropped transparent ink layer.
 * Only for handwritten ink on lighter paper; color stamps take another path.
 */
export type SignatureExtraction={pixels:Uint8ClampedArray;width:number;height:number;coverage:number};
export function extractHandwritingPixels(source:Uint8ClampedArray,width:number,height:number,sensitivity=60):SignatureExtraction{
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||source.length!==width*height*4||width*height>6_000_000)throw Error("SIGNATURE_IMAGE_INVALID");
 const strength=Math.min(100,Math.max(0,Number.isFinite(sensitivity)?sensitivity:60));
 const n=width*height,lum=new Float32Array(n),stride=width+1,integral=new Float64Array((width+1)*(height+1));
 // Treat transparent paper as white, while respecting pre-existing transparent PNG input.
 for(let y=0;y<height;y++){
  let row=0;
  for(let x=0;x<width;x++){
   const i=y*width+x,k=i*4,alpha=source[k+3]/255;
   const v=(.299*source[k]+.587*source[k+1]+.114*source[k+2])*alpha+255*(1-alpha);
   lum[i]=v;row+=v;
   integral[(y+1)*stride+x+1]=integral[y*stride+x+1]+row;
  }
 }
 const radius=Math.max(7,Math.round(Math.min(width,height)*.035));
 // Sensitivity governs the contrast required to retain ink; never pretend this is OCR.
 const threshold=19-strength*.16;
 const feather=13;
 const mask=new Uint8ClampedArray(n);
 let counted=0,minX=width,minY=height,maxX=-1,maxY=-1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const idx=y*width+x,k=idx*4;
  if(source[k+3]<12)continue;
  const left=Math.max(0,x-radius),right=Math.min(width,x+radius+1),top=Math.max(0,y-radius),bottom=Math.min(height,y+radius+1);
  const avg=(integral[bottom*stride+right]-integral[top*stride+right]-integral[bottom*stride+left]+integral[top*stride+left])/((right-left)*(bottom-top));
  const contrast=avg-lum[idx];
  const alpha=Math.round(255*Math.max(0,Math.min(1,(contrast-threshold)/feather)))*(source[k+3]/255);
  if(alpha>=18){mask[idx]=alpha;counted++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
 }
 // Refuse ambiguous, blank or overwhelmingly dark photos, rather than exporting a dirty rectangle.
 const coverage=counted/n;
 if(counted<Math.max(4,Math.round(n*.000025))||coverage>.4||maxX<minX)throw Error("SIGNATURE_INK_NOT_FOUND");
 // Remove tiny isolated speckles without disconnecting legitimate thin strokes.
 const seen=new Uint8Array(n),queue=new Int32Array(n);
 const minComponent=Math.max(2,Math.floor(n/800000));
 for(let i=0;i<n;i++){
  if(mask[i]<18||seen[i])continue;
  let head=0,tail=1;queue[0]=i;seen[i]=1;
  let componentMinX=width,componentMinY=height,componentMaxX=-1,componentMaxY=-1;
  while(head<tail){
   const q=queue[head++],x=q%width,y=(q-x)/width;
   componentMinX=Math.min(componentMinX,x);componentMaxX=Math.max(componentMaxX,x);
   componentMinY=Math.min(componentMinY,y);componentMaxY=Math.max(componentMaxY,y);
   for(const next of [x>0?q-1:-1,x+1<width?q+1:-1,y>0?q-width:-1,y+1<height?q+width:-1]){
    if(next>=0&&!seen[next]&&mask[next]>=18){seen[next]=1;queue[tail++]=next}
   }
  }
  // Mobile photos often include a long dark strip along a paper edge.
  // Exclude components that touch an image border and are substantially elongated.
  const margin=Math.max(2,Math.round(Math.min(width,height)*.035));
  const touchesBorder=componentMinX<=margin||componentMaxX>=width-1-margin||componentMinY<=margin||componentMaxY>=height-1-margin;
  const bw=componentMaxX-componentMinX+1,bh=componentMaxY-componentMinY+1;
  const elongated=bw>=width*.33||bh>=height*.33;
  if(tail<minComponent||(touchesBorder&&elongated))for(let j=0;j<tail;j++)mask[queue[j]]=0;
 }
 minX=width;minY=height;maxX=-1;maxY=-1;counted=0;
 for(let i=0;i<n;i++)if(mask[i]){
  const y=Math.floor(i/width),x=i-y*width;
  counted++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
 }
 if(!counted||maxX<minX)throw Error("SIGNATURE_INK_NOT_FOUND");
 const pad=Math.max(5,Math.ceil(Math.max(maxX-minX+1,maxY-minY+1)*.06));
 const sx=Math.max(0,minX-pad),sy=Math.max(0,minY-pad),ex=Math.min(width,maxX+pad+1),ey=Math.min(height,maxY+pad+1);
 const outW=ex-sx,outH=ey-sy,out=new Uint8ClampedArray(outW*outH*4);
 for(let y=0;y<outH;y++)for(let x=0;x<outW;x++){
  const p=(sy+y)*width+(sx+x),k=p*4,d=(y*outW+x)*4,a=mask[p];
  if(!a)continue;
  // Retain the actual pen hue; darken faint gray handwriting for legibility.
  const low=Math.min(source[k],source[k+1],source[k+2]);
  const bias=Math.min(85,low);
  out[d]=Math.max(0,source[k]-bias);
  out[d+1]=Math.max(0,source[k+1]-bias);
  out[d+2]=Math.max(0,source[k+2]-bias);
  out[d+3]=a;
 }
 return {pixels:out,width:outW,height:outH,coverage:counted/n};
}
