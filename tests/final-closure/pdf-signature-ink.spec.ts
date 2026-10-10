import {test,expect} from "playwright/test";
import {extractHandwritingPixels} from "../../lib/tools/document/signature-ink";

function paper(width:number,height:number,draw:(pixels:Uint8ClampedArray)=>void){
 const d=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;
  // Beige paper with diffuse shadow and dim phone-camera lighting (not near white).
  const shade=Math.round(198+x/width*25+y/height*8);
  d[i]=shade;d[i+1]=shade-6;d[i+2]=shade-14;d[i+3]=255;
 }
 draw(d);return d;
}
test("handwriting extraction removes gray paper and crops actual ink",()=>{
 const w=320,h=160;
 const src=paper(w,h,d=>{
  for(let x=68;x<252;x++)for(let y=67;y<=70;y++){
   const i=(y*w+x)*4;d[i]=35;d[i+1]=45;d[i+2]=95;
  }
  for(let y=40;y<100;y++)for(let x=150;x<154;x++){
   const i=(y*w+x)*4;d[i]=38;d[i+1]=41;d[i+2]=101;
  }
 });
 const result=extractHandwritingPixels(src,w,h,60);
 expect(result.width).toBeLessThan(w);
 expect(result.height).toBeLessThan(h);
 expect(result.width).toBeGreaterThan(150);
 const transparent=Array.from(result.pixels).filter((_,i)=>i%4===3&&result.pixels[i]===0).length;
 const opaque=Array.from(result.pixels).filter((_,i)=>i%4===3&&result.pixels[i]>160).length;
 expect(transparent).toBeGreaterThan(opaque);
 expect(opaque).toBeGreaterThan(100);
 expect(result.coverage).toBeLessThan(.2);
});
test("blank gray paper never turns into an artificial black rectangle",()=>{
 const blank=paper(160,80,()=>{});
 expect(()=>extractHandwritingPixels(blank,160,80)).toThrow("SIGNATURE_INK_NOT_FOUND");
});
test("input size and alpha invariants reject bogus images",()=>{
 expect(()=>extractHandwritingPixels(new Uint8ClampedArray(0),3,3)).toThrow("SIGNATURE_IMAGE_INVALID");
 const width=60,height=60;
 const data=paper(width,height,d=>{for(let x=20;x<40;x++)for(let y=20;y<25;y++){const i=(y*width+x)*4;d[i]=5;d[i+1]=10;d[i+2]=30}});
 const result=extractHandwritingPixels(data,width,height,75);
 expect(result.pixels.length).toBe(result.width*result.height*4);
});

test("photo border shadows are discarded while central handwriting is kept",()=>{
 const w=320,h=160;
 const source=paper(w,h,d=>{
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   if(x<8||x>311){const i=(y*w+x)*4;d[i]=d[i+1]=d[i+2]=60}
  }
  for(let x=95;x<218;x++)for(let y=77;y<82;y++){const i=(y*w+x)*4;d[i]=15;d[i+1]=18;d[i+2]=42}
 });
 const result=extractHandwritingPixels(source,w,h,60);
 expect(result.width).toBeLessThan(190);
 expect(result.height).toBeLessThan(70);
 expect(Array.from(result.pixels).filter((_,i)=>i%4===3&&result.pixels[i]>160).length).toBeGreaterThan(50);
});

test("solid thick ink retains an opaque center instead of hollow outlines",()=>{
 const w=360,h=180;
 const source=paper(w,h,d=>{
  for(let y=74;y<106;y++)for(let x=85;x<275;x++){
   const k=(y*w+x)*4;d[k]=19;d[k+1]=23;d[k+2]=41;
  }
 });
 const ink=extractHandwritingPixels(source,w,h,65);
 let center=0;
 for(let y=0;y<ink.height;y++)for(let x=0;x<ink.width;x++){
  if(ink.pixels[(y*ink.width+x)*4+3]>220)center++;
 }
 expect(center).toBeGreaterThan(1500);
 expect(ink.width).toBeLessThan(w);
});
