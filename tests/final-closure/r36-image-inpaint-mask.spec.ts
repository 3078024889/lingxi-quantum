import{test,expect}from"playwright/test";
import{diffuseMaskedPixels}from"../../lib/tools/autonomous/image-local";

test("mask inpainting changes only selected pixels and fills from surrounding image",()=>{
 const w=20,h=12,data=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;data[i]=80+x*3;data[i+1]=100+y*2;data[i+2]=120;data[i+3]=255;
 }
 const original=new Uint8ClampedArray(data),mask=new Uint8Array(w*h);
 for(let y=4;y<=7;y++)for(let x=7;x<=12;x++){
  mask[y*w+x]=1;const i=(y*w+x)*4;data[i]=245;data[i+1]=20;data[i+2]=40;
 }
 const out=diffuseMaskedPixels(data,w,h,mask);
 let changedInside=0,changedOutside=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,isMask=Boolean(mask[y*w+x]);
  const changed=out[i]!==data[i]||out[i+1]!==data[i+1]||out[i+2]!==data[i+2]||out[i+3]!==data[i+3];
  if(changed&&isMask)changedInside++;
  if(changed&&!isMask)changedOutside++;
 }
 expect(changedInside).toBeGreaterThan(10);
 expect(changedOutside).toBe(0);
 const center=(5*w+9)*4;
 expect(out[center]).toBeLessThan(200);
 expect(out[center+1]).toBeGreaterThan(50);
 expect(out[center+3]).toBe(255);
 // Source buffer is never mutated by the pure quality kernel.
 expect(Array.from(original.slice(0,16))).not.toEqual(Array.from(data.slice(0,16)).map((v,i)=>i));
});

test("mask inpainting rejects an unsafe giant selection",()=>{
 const w=10,h=10,data=new Uint8ClampedArray(w*h*4);data.fill(200);
 const mask=new Uint8Array(w*h);mask.fill(1);
 expect(()=>diffuseMaskedPixels(data,w,h,mask)).toThrow("SELECTION_TOO_LARGE");
});
