/** Local metadata only. Unindexed MediaRecorder WebM may initially report Infinity;
 * seek to its end to let the browser determine the finite duration before checking it.
 */
export function readMediaDuration(blob:Blob,kind:'video'|'audio'=blob.type.startsWith('audio/')?'audio':'video'):Promise<number>{
 return new Promise((resolve,reject)=>{
  const media=document.createElement(kind),url=URL.createObjectURL(blob);
  let settled=false,discoveringEnd=false;
  const finish=(value?:number,error?:Error)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   media.onloadedmetadata=null;media.ondurationchange=null;media.onseeked=null;media.ontimeupdate=null;media.onerror=null;
   media.removeAttribute('src');media.load();URL.revokeObjectURL(url);
   if(error)reject(error);else resolve(value!);
  };
  const timer=setTimeout(()=>finish(undefined,new Error('MEDIA_METADATA_TIMEOUT')),20000);
  const check=()=>{
   if(Number.isFinite(media.duration)&&media.duration>0){finish(media.duration);return}
   if(media.duration===Infinity&&!discoveringEnd){discoveringEnd=true;try{media.currentTime=Number.MAX_SAFE_INTEGER}catch{finish(undefined,new Error('MEDIA_DURATION_INVALID'))}}
  };
  media.preload='metadata';media.onloadedmetadata=check;media.ondurationchange=check;media.onseeked=check;media.ontimeupdate=check;
  media.onerror=()=>finish(undefined,new Error('MEDIA_METADATA_UNREADABLE'));
  media.src=url;
 });
}
