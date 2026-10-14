import {PDFDocument,PDFPage,StandardFonts,rgb,type RGB,type Rotation,type PDFFont} from 'pdf-lib';
const fonts=new WeakMap<PDFDocument,Promise<PDFFont>>();

/** Keep encodable labels searchable; use local browser glyph rendering otherwise.
 * Only the added label is rasterized, never the original PDF page or text layer.
 */
export async function preparePdfLabel(doc:PDFDocument,text:string,size:number,color:RGB=rgb(0,0,0)){
 if(!Number.isFinite(size)||size<=0||size>120||Array.from(text).length>2000)throw new Error('PDF_LABEL_TOO_LARGE');
 let pending=fonts.get(doc);if(!pending){pending=doc.embedFont(StandardFonts.Helvetica);fonts.set(doc,pending)}const font=await pending;
 let supported=true;
 try{font.encodeText(text)}catch{supported=false}
 if(supported)return {width:font.widthOfTextAtSize(text,size),draw(page:PDFPage,options:{x:number;y:number;opacity?:number;rotate?:Rotation}){page.drawText(text,{...options,size,font,color})}};
 if(typeof document==='undefined')throw new Error('BROWSER_TEXT_RENDER_REQUIRED');
 const scale=3,padding=2;
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('CANVAS_UNAVAILABLE');
 const family='-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif';
 await document.fonts?.ready;
 const fontSpec=`${size*scale}px ${family}`;ctx.font=fontSpec;
 const m=ctx.measureText(text),ascent=Math.max(size*scale,m.actualBoundingBoxAscent),descent=Math.max(size*.3*scale,m.actualBoundingBoxDescent);
 const left=Math.max(0,m.actualBoundingBoxLeft),right=Math.max(m.width,m.actualBoundingBoxRight);
 const w=Math.ceil(left+right+padding*2*scale),h=Math.ceil(ascent+descent+padding*2*scale);
 if(w>16384||h>16384||w*h>16000000)throw new Error('PDF_LABEL_TOO_LARGE');
 canvas.width=w;canvas.height=h;
 ctx.font=fontSpec;ctx.direction='ltr';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=`rgb(${Math.round(color.red*255)},${Math.round(color.green*255)},${Math.round(color.blue*255)})`;
 ctx.fillText(text,padding*scale+left,padding*scale+ascent);
 const bytes=await new Promise<Uint8Array>((resolve,reject)=>canvas.toBlob(blob=>{
  if(!blob){reject(new Error('TEXT_RENDER_FAILED'));return}blob.arrayBuffer().then(buffer=>resolve(new Uint8Array(buffer)),reject);
 },'image/png'));
 const image=await doc.embedPng(bytes),width=m.width/scale,leftOffset=padding+left/scale,bottom=canvas.height/scale-padding-ascent/scale;
 const imageWidth=canvas.width/scale,imageHeight=canvas.height/scale;canvas.width=canvas.height=1;
 return {width,draw(page:PDFPage,options:{x:number;y:number;opacity?:number;rotate?:Rotation}){
  const rotation=options.rotate,angle=rotation?(rotation.type==='degrees'?rotation.angle*Math.PI/180:rotation.angle):0;
  page.drawImage(image,{...options,x:options.x-leftOffset*Math.cos(angle)+bottom*Math.sin(angle),y:options.y-leftOffset*Math.sin(angle)-bottom*Math.cos(angle),width:imageWidth,height:imageHeight});
 }};
}
