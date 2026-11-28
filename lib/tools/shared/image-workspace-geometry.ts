export type ImageBox={x:number;y:number;w:number;h:number};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function clampImageBox(box:ImageBox):ImageBox{
 const w=clamp(box.w,.01,1),h=clamp(box.h,.01,1);
 return{x:clamp(box.x,0,1-w),y:clamp(box.y,0,1-h),w,h};
}
export function cropToRatio(width:number,height:number,ratio:number):ImageBox{
 if(!Number.isFinite(ratio)||ratio<=0||width<=0||height<=0)throw Error('IMAGE_RATIO_INVALID');
 const w=Math.min(1,height*ratio/width),h=Math.min(1,width/ratio/height);
 return{x:(1-w)/2,y:(1-h)/2,w,h};
}
export function workspaceImageSize(width:number,height:number,crop:ImageBox,scale:number){
 if(![width,height,scale,...Object.values(crop)].every(Number.isFinite)||width<=0||height<=0||scale<=0)throw Error('IMAGE_SIZE_INVALID');
 const box=clampImageBox(crop),w=Math.max(1,Math.round(width*box.w*scale)),h=Math.max(1,Math.round(height*box.h*scale));
 if(w>16384||h>16384||w*h>40_000_000)throw Error('IMAGE_SIZE_LIMIT');
 return{width:w,height:h,crop:box};
}
