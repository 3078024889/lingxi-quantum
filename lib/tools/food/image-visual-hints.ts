"use client";
export type VisualHint={label:string;score:number};
export async function visualFoodHints(file:File):Promise<VisualHint[]>{
 const bmp=await createImageBitmap(file);const max=160,scale=Math.min(1,max/Math.max(bmp.width,bmp.height));
 const c=document.createElement("canvas");c.width=Math.max(1,Math.round(bmp.width*scale));c.height=Math.max(1,Math.round(bmp.height*scale));
 const x=c.getContext("2d",{willReadFrequently:true});if(!x)return[];x.drawImage(bmp,0,0,c.width,c.height);bmp.close();
 const d=x.getImageData(0,0,c.width,c.height).data;let vivid=0,total=0;const bins=new Set<number>();
 for(let i=0;i<d.length;i+=16){const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),delta=mx-mn;if(mx<35||mx>248)continue;total++;const sat=delta/Math.max(1,mx);if(sat>.38){vivid++;let h=0;if(delta){if(mx===r)h=((g-b)/delta)%6;else if(mx===g)h=(b-r)/delta+2;else h=(r-g)/delta+4;h=(h*60+360)%360}bins.add(Math.floor(h/45));}}
 const vividRatio=total?vivid/total:0;
 // Food-101 has no generic fruit-platter class and can confidently mislabel colourful fruit plates.
 // A broad colour-diversity hint is therefore allowed to outrank a narrow Food-101 guess.
 if(total>80&&vividRatio>.18&&bins.size>=4)return[{label:"fruit salad",score:.92}];
 return[];
}