"use client";
import {useEffect,useRef,useState} from 'react';

export default function MediaTrimPreview({file,start,duration,disabled,onChange,lang}:{
 file:File;start:number;duration:number;disabled:boolean;lang:string;
 onChange:(start:number,duration:number)=>void;
}){
 const [url,setUrl]=useState(''),[total,setTotal]=useState(0),[failed,setFailed]=useState(false);
 const media=useRef<HTMLVideoElement>(null);
 const zh=lang==='zh',end=Math.min(total,start+duration),gap=Math.min(.1,total);
 useEffect(()=>{
  const next=URL.createObjectURL(file);setUrl(next);setTotal(0);setFailed(false);
  return()=>URL.revokeObjectURL(next);
 },[file]);
 function select(from:number,to:number){
  if(disabled||!total)return;
  const first=Math.max(0,Math.min(total-gap,from)),last=Math.max(first+gap,Math.min(total,to));
  onChange(first,last-first);
  if(media.current){media.current.pause();media.current.currentTime=first}
 }
 return <section className="space-y-3 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] p-4">
  <p className="font-medium">{zh?'拖动两条滑块，留下想要的片段':'Drag the sliders to keep the part you want'}</p>
  {url&&<video ref={media} src={url} controls playsInline preload="metadata" className="max-h-72 w-full rounded-xl bg-black"
   onLoadedMetadata={event=>{const value=event.currentTarget.duration;if(Number.isFinite(value)&&value>0){setTotal(value);onChange(0,value)}else setFailed(true)}}
   onError={()=>setFailed(true)}
   onPlay={()=>{if(media.current&&(media.current.currentTime<start||media.current.currentTime>=end))media.current.currentTime=start}}
   onTimeUpdate={()=>{if(media.current&&total&&media.current.currentTime>=end)media.current.pause()}}/>}
  {total>0&&<>
   <p role="status" className="text-sm">{start.toFixed(1)} – {end.toFixed(1)} {zh?'秒':'s'} · {zh?'保留':'Keep'} {(end-start).toFixed(1)} {zh?'秒':'s'}</p>
   <label className="block text-sm">{zh?'从这里开始':'Start here'}<input type="range" min={0} max={Math.max(0,end-gap)} step={.01} value={start} disabled={disabled} onChange={e=>select(Number(e.target.value),end)} className="block min-h-11 w-full accent-violet-600"/></label>
   <label className="block text-sm">{zh?'到这里结束':'End here'}<input type="range" min={Math.min(total,start+gap)} max={total} step={.01} value={end} disabled={disabled} onChange={e=>select(start,Number(e.target.value))} className="block min-h-11 w-full accent-violet-600"/></label>
   <div className="flex flex-wrap gap-2">
    {[[zh?'整个视频':'Whole video',0,total],[zh?'前半段':'First half',0,total/2],[zh?'后半段':'Last half',total/2,total]].map(([label,from,to])=><button key={String(label)} type="button" disabled={disabled} onClick={()=>select(Number(from),Number(to))} className="min-h-11 rounded-xl border border-[var(--lx-line)] px-3 text-sm">{label}</button>)}
   </div>
  </>}
  {failed&&<p role="status" className="text-sm">{zh?'这段视频无法在浏览器预览。可换用 MP4，或展开精确时间选项。':'This video cannot be previewed here. Try MP4, or use the precise time options.'}</p>}
 </section>;
}
