"use client";
import {useEffect,useRef,useState} from 'react';
import JSZip from 'jszip';
import type {ApprovedScriptPreview,ScriptPreviewFrame} from '@/lib/sasi/approved-script-preview';
import {seriesProgressText} from '@/lib/sasi/series-progress-copy';
import type {LingxiLang} from '@/lib/lingxi-i18n';

function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
function paint(canvas:HTMLCanvasElement,frame:ScriptPreviewFrame,index:number,note:string){
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('CANVAS_UNAVAILABLE');
 ctx.fillStyle='#f4f3ff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#292248';ctx.font='bold 30px sans-serif';ctx.fillText(`SASI · ${index+1} ${frame.title}`.slice(0,65),44,64);
 ctx.font='23px sans-serif';const chars=Array.from(frame.content);let line='',y=115,consumed=0;
 for(const char of chars){if(char==='\n'||ctx.measureText(line+char).width>canvas.width-88){ctx.fillText(line,44,y);y+=34;line='';if(y>canvas.height-105)break;}if(char!=='\n')line+=char;consumed++;}
 if(line&&y<=canvas.height-105)ctx.fillText(line,44,y);if(consumed<chars.length)ctx.fillText('…',44,canvas.height-80);
 ctx.font='14px sans-serif';ctx.fillStyle='#605977';ctx.fillText(note.slice(0,125),44,canvas.height-35);
}
export default function SasiScriptPreview({preview,lang}:{preview:ApprovedScriptPreview;lang:LingxiLang}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const canvas=useRef<HTMLCanvasElement>(null),stop=useRef<()=>void>(()=>{});
 const text=(key:Parameters<typeof seriesProgressText>[1])=>seriesProgressText(lang,key);
 useEffect(()=>()=>stop.current(),[]);
 useEffect(()=>{if(canvas.current)paint(canvas.current,preview.frames[0],0,text('preview'));},[preview,lang]);
 async function images(){if(busy)return;setBusy(true);setError('');try{const c=document.createElement('canvas');c.width=1280;c.height=720;const zip=new JSZip();zip.file('approved-script.txt',preview.script);zip.file('README.txt',text('previewNote'));for(const [i,frame] of preview.frames.entries()){paint(c,frame,i,text('preview'));const blob=await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('PNG_FAILED')),'image/png'));zip.file(`preview-${String(i+1).padStart(2,'0')}.png`,blob);}download(await zip.generateAsync({type:'blob'}),'sasi-script-preview.zip');}catch{setError(text('previewError'));}finally{setBusy(false);}}
 async function video(){if(busy)return;if(typeof MediaRecorder==='undefined'||!canvas.current?.captureStream){setError(text('unsupported'));return;}
  const mime=['video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));if(!mime){setError(text('unsupported'));return;}
  setBusy(true);setError('');const c=document.createElement('canvas');c.width=1280;c.height=720;const stream=c.captureStream(15);let recorder:MediaRecorder|undefined,timer:ReturnType<typeof setInterval>|undefined,watchdog:ReturnType<typeof setTimeout>|undefined;
  try{const blob=await new Promise<Blob>((resolve,reject)=>{const chunks:Blob[]=[];let bytes=0,index=0;const frames=preview.frames.slice(0,3);const finish=()=>{if(recorder?.state==='recording')recorder.stop();};stop.current=()=>{reject(Error('CANCELLED'));finish();};recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:1200000});recorder.ondataavailable=e=>{bytes+=e.data.size;if(bytes>16*1024*1024){reject(Error('PREVIEW_TOO_LARGE'));finish();}else if(e.data.size)chunks.push(e.data);};recorder.onerror=()=>reject(Error('RECORD_FAILED'));recorder.onstop=()=>bytes?resolve(new Blob(chunks,{type:mime})):reject(Error('EMPTY_PREVIEW'));paint(c,frames[0],0,text('preview'));recorder.start(250);const started=performance.now();timer=setInterval(()=>{const elapsed=performance.now()-started;index=Math.floor(elapsed/4000);if(index>=frames.length){finish();return;}paint(c,frames[index],index,text('preview'));const ctx=c.getContext('2d')!;ctx.fillStyle='#7064bc';ctx.fillRect(0,c.height-6,c.width*(elapsed%4000)/4000,6);},67);watchdog=setTimeout(()=>{reject(Error('RECORD_TIMEOUT'));finish();},16000);});download(blob,`sasi-script-animatic.${mime.startsWith('video/mp4')?'mp4':'webm'}`);
  }catch{setError(text('previewError'));}finally{if(timer)clearInterval(timer);if(watchdog)clearTimeout(watchdog);if(recorder?.state==='recording')recorder.stop();stream.getTracks().forEach(track=>track.stop());c.width=0;stop.current=()=>{};setBusy(false);}
 }
 return <section data-sasi-script-preview className="mb-6 rounded-2xl border border-[var(--lx-line)] p-4"><h2 className="font-semibold">{text('preview')}</h2><p className="my-2 text-xs text-[var(--lx-muted)]">{text('previewNote')}</p><canvas ref={canvas} width={1280} height={720} className="w-full rounded-xl" aria-label={text('preview')}/><div className="mt-3 flex flex-wrap gap-3"><button disabled={busy} onClick={()=>void images()}>{text('images')}</button><button disabled={busy} onClick={()=>void video()}>{busy?text('rendering'):text('video')}</button></div>{error&&<p role="alert">{error}</p>}</section>;
}
