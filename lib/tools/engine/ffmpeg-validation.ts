export type MediaProbe={bytes:number;duration:number;hasVideo?:boolean;hasAudio?:boolean;width?:number;height?:number};
export function validateMediaOutput(x:MediaProbe,need:{video?:boolean;audio?:boolean}={}){
 if(x.bytes<=0)return{ok:false,code:"EMPTY_OUTPUT"};
 if(!Number.isFinite(x.duration)||x.duration<=0)return{ok:false,code:"INVALID_DURATION"};
 if(need.video&&!x.hasVideo)return{ok:false,code:"VIDEO_STREAM_MISSING"};
 if(need.audio&&!x.hasAudio)return{ok:false,code:"AUDIO_STREAM_MISSING"};
 if(x.hasVideo&&((x.width??0)<=0||(x.height??0)<=0))return{ok:false,code:"VIDEO_DIMENSIONS_INVALID"};
 return{ok:true,code:"OK"};
}
export function durationDrift(before:number,after:number,tolerance=.035){
 if(before<=0||after<=0)return{ok:false,code:"INVALID_DURATION"};
 const drift=Math.abs(after-before)/before;
 return{ok:drift<=tolerance,code:drift<=tolerance?"OK":"DURATION_DRIFT",drift};
}
