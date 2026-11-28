"use client";
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {useIncomingToolFiles} from '@/lib/tools/workspace/use-incoming-tool-files';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {clampImageBox,cropToRatio,workspaceImageSize,type ImageBox} from '@/lib/tools/shared/image-workspace-geometry';
import {renderWorkspaceImage} from '@/lib/tools/shared/image-workspace-render';
import {compressImageToTarget} from '@/lib/tools/shared/image-canvas';
import {claimToolStart,toolAccessMessage,ToolAccessError} from '@/lib/tools/commerce/tool-start-client';
import type {ToolResultFile} from '@/lib/tools/types';
import FileDropzone from './FileDropzone';
import ResultPanel from './ResultPanel';

const FULL:ImageBox={x:0,y:0,w:1,h:1};
type Gesture={kind:'crop'|'newCrop'|'cropResize'|'text'|'signature'|'signatureResize';x:number;y:number;box:ImageBox};
function usePreview(blob?:Blob){const [url,setUrl]=useState('');useEffect(()=>{if(!blob){setUrl('');return}const next=URL.createObjectURL(blob);setUrl(next);return()=>URL.revokeObjectURL(next)},[blob]);return url}
function SignaturePad({onDone,zh}:{onDone:(blob:Blob)=>void;zh:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null),drawing=useRef(false),hasInk=useRef(false);
 function point(event:PointerEvent<HTMLCanvasElement>){const rect=event.currentTarget.getBoundingClientRect();return{x:(event.clientX-rect.left)/rect.width*640,y:(event.clientY-rect.top)/rect.height*200}}
 return <div className="space-y-2"><p className="text-sm text-slate-500">{zh?'在下面用手指或鼠标签名':'Draw your signature below with a finger or mouse'}</p><canvas ref={canvas} width={640} height={200} aria-label={zh?'手写签名画布':'Signature drawing area'} className="w-full touch-none rounded-xl border border-slate-200 bg-white" onPointerDown={event=>{drawing.current=true;event.currentTarget.setPointerCapture(event.pointerId);const p=point(event),ctx=event.currentTarget.getContext('2d')!;ctx.lineWidth=3;ctx.lineCap='round';ctx.strokeStyle='#172033';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.01,p.y+.01);ctx.stroke();hasInk.current=true}} onPointerMove={event=>{if(!drawing.current)return;const p=point(event),ctx=event.currentTarget.getContext('2d')!;ctx.lineTo(p.x,p.y);ctx.stroke()}} onPointerUp={()=>{drawing.current=false}} onPointerCancel={()=>{drawing.current=false}}/><div className="flex gap-2"><button type="button" className="min-h-11 rounded-xl border px-4" onClick={()=>{canvas.current?.getContext('2d')?.clearRect(0,0,640,200);hasInk.current=false}}>{zh?'重写':'Clear'}</button><button type="button" className="min-h-11 rounded-xl bg-slate-900 px-4 text-white" onClick={()=>{if(hasInk.current)canvas.current?.toBlob(blob=>{if(blob)onDone(blob)},'image/png')}}>{zh?'放到图片上':'Place on image'}</button></div></div>;
}

export default function ImageWorkspace(){
 const {lang}=useLingxiLang(),zh=lang==='zh';
 const [files,setFiles]=useState<File[]>([]),[size,setSize]=useState({width:0,height:0}),[crop,setCrop]=useState<ImageBox>(FULL),[scale,setScale]=useState(1);
 const [mode,setMode]=useState<'edit'|'crop'|'signature'>('edit'),[text,setText]=useState(''),[textBox,setTextBox]=useState<ImageBox>({x:.1,y:.1,w:.3,h:.08});
 const [font,setFont]=useState(.045),[color,setColor]=useState('#172033'),[opacity,setOpacity]=useState(.85),[signature,setSignature]=useState<Blob>(),[signatureBox,setSignatureBox]=useState<ImageBox>({x:.6,y:.75,w:.3,h:.12});
 const [mime,setMime]=useState('image/png'),[target,setTarget]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[results,setResults]=useState<ToolResultFile[]>([]),[stageWidth,setStageWidth]=useState(600);
 const stage=useRef<HTMLDivElement>(null),gesture=useRef<Gesture|null>(null),version=useRef(0),claim=useRef<string|null>(null);
 const source=files[0],url=usePreview(source),signatureUrl=usePreview(signature);
 useEffect(()=>{let live=true;if(!source){setSize({width:0,height:0});return}createImageBitmap(source).then(bitmap=>{if(live)setSize({width:bitmap.width,height:bitmap.height});bitmap.close()}).catch(()=>{if(live)setError(zh?'无法读取图片，请换一张重试。':'Cannot read this image. Try another file.')});return()=>{live=false}},[source,zh]);
 useEffect(()=>{if(!stage.current)return;const observer=new ResizeObserver(entries=>setStageWidth(entries[0].contentRect.width));observer.observe(stage.current);return()=>observer.disconnect()},[url]);
 useEffect(()=>{version.current++;setResults([])},[source,crop,scale,text,textBox,font,color,opacity,signature,signatureBox,mime,target]);
 function choose(next:File[]){setFiles(next);setCrop(FULL);setScale(1);setText('');setSignature(undefined);setResults([]);setError('');claim.current=null}
 function point(event:PointerEvent){const rect=stage.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))}}
 function start(event:PointerEvent,kind:Gesture['kind'],box:ImageBox){event.stopPropagation();event.currentTarget.setPointerCapture(event.pointerId);gesture.current={kind,...point(event),box}}
 function move(event:PointerEvent){
  const initial=gesture.current;if(!initial)return;const p=point(event),dx=p.x-initial.x,dy=p.y-initial.y;
  if(initial.kind==='newCrop')setCrop(clampImageBox({x:Math.min(p.x,initial.x),y:Math.min(p.y,initial.y),w:Math.abs(dx),h:Math.abs(dy)}));
  else if(initial.kind==='crop')setCrop(clampImageBox({...initial.box,x:initial.box.x+dx,y:initial.box.y+dy}));
  else if(initial.kind==='cropResize')setCrop(clampImageBox({...initial.box,w:Math.max(.01,Math.min(1-initial.box.x,initial.box.w+dx)),h:Math.max(.01,Math.min(1-initial.box.y,initial.box.h+dy))}));
  else if(initial.kind==='text')setTextBox(clampImageBox({...initial.box,x:initial.box.x+dx,y:initial.box.y+dy}));
  else if(initial.kind==='signature')setSignatureBox(clampImageBox({...initial.box,x:initial.box.x+dx,y:initial.box.y+dy}));
  else{const factor=Math.max(.1,Math.min(5,1+dx/initial.box.w,(1-initial.box.x)/initial.box.w,(1-initial.box.y)/initial.box.h));setSignatureBox(clampImageBox({...initial.box,w:initial.box.w*factor,h:initial.box.h*factor}))}
 }
 async function addSignature(blob:Blob){const bitmap=await createImageBitmap(blob);const ratio=bitmap.width/bitmap.height;bitmap.close();let w=.3,h=w*size.width/size.height/ratio;const fit=Math.min(1,.8/w,.8/h);w*=fit;h*=fit;setSignatureBox(clampImageBox({x:.6,y:.65,w,h}));setSignature(blob);setMode('edit')}
 useIncomingToolFiles(next=>choose(next.filter(file=>/^image\//.test(file.type))));
 async function run(){
  if(!source||busy)return;const current=version.current;setBusy(true);setError('');setResults([]);
  try{
   workspaceImageSize(size.width,size.height,crop,scale);
   claim.current??=crypto.randomUUID();await claimToolStart('image-workspace',1,claim.current);
   let {blob}=await renderWorkspaceImage(source,{crop,scale,mime:target?'image/jpeg':mime,text,textBox,font,color,opacity,signature,signatureBox});
   if(target){const compressed=await compressImageToTarget(new File([blob],'edited.jpg',{type:blob.type}),target*1024,{maxDimension:16384});blob=compressed.blob;if(blob.size>target*1024)throw Error('IMAGE_TARGET_UNREACHED')}
   if(current!==version.current)return;
   const extension=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':'jpg';
   setResults([{name:`edited-${source.name.replace(/\.[^.]+$/,'')}.${extension}`,blob,mime:blob.type,size:blob.size}]);claim.current=null;
  }catch(error){setError(error instanceof ToolAccessError?toolAccessMessage(lang,error.code):zh?'暂时无法生成。请减小输出尺寸或选择更大的文件大小后重试。原图未修改。':'Could not create this image. Reduce dimensions or choose a larger file size and retry. Your original is unchanged.')}
  finally{setBusy(false)}
 }
 const boxStyle=(box:ImageBox)=>({left:`${box.x*100}%`,top:`${box.y*100}%`,width:`${box.w*100}%`,height:`${box.h*100}%`});
 return <div className="space-y-5">
  <FileDropzone files={files} accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" maxSizeMB={40} onChange={choose} disabled={busy} kind="image" authorize={false}/>
  {url&&size.width>0&&<>
   <div className="flex flex-wrap gap-2">{(['edit','crop','signature'] as const).map(value=><button key={value} type="button" disabled={busy} aria-pressed={mode===value} onClick={()=>setMode(value)} className={`min-h-11 rounded-full border px-5 ${mode===value?'border-violet-600 bg-violet-600 text-white':'border-slate-200 bg-white'}`}>{value==='edit'?(zh?'文字与水印':'Text & watermark'):value==='crop'?(zh?'裁剪与缩放':'Crop & resize'):(zh?'手写签名':'Signature')}</button>)}</div>
   <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5"><p className="mb-3 text-sm text-slate-500">{zh?'拖动文字或签名来摆放，拖动右下角调整签名大小。':'Drag text or signature to position it. Drag the signature corner to resize.'}</p>
     <div ref={stage} className={`relative mx-auto max-w-full overflow-hidden bg-white ${busy?'pointer-events-none':''}`} onPointerDown={event=>{if(mode==='crop'&&!busy)start(event,'newCrop',crop)}} onPointerMove={move} onPointerUp={()=>{gesture.current=null}} onPointerCancel={()=>{gesture.current=null}} style={{touchAction:mode==='crop'?'none':'pan-y'}}>
      <img src={url} alt={source.name} draggable={false} className="block h-auto w-full select-none"/>
      {text&&<button type="button" aria-label={zh?'拖动文字水印':'Move text watermark'} disabled={busy} onPointerDown={event=>start(event,'text',textBox)} className="absolute touch-none whitespace-pre border border-dashed border-violet-500 text-left" style={{left:`${textBox.x*100}%`,top:`${textBox.y*100}%`,fontSize:font*stageWidth,lineHeight:1,color,opacity}}>{text}</button>}
      {signatureUrl&&<div className="absolute touch-none border border-dashed border-violet-500" style={boxStyle(signatureBox)} onPointerDown={event=>start(event,'signature',signatureBox)}><img src={signatureUrl} alt={zh?'签名':'Signature'} draggable={false} className="h-full w-full" style={{opacity}}/><button type="button" aria-label={zh?'调整签名大小':'Resize signature'} className="absolute -bottom-1 -right-1 h-7 w-7 touch-none rounded-full border-2 border-white bg-violet-600 shadow" onPointerDown={event=>start(event,'signatureResize',signatureBox)}/></div>}
      {mode==='crop'&&<div className="absolute touch-none border-2 border-violet-500 bg-violet-100/10" style={{...boxStyle(crop),boxShadow:'0 0 0 100vmax rgba(15,23,42,.28)'}} onPointerDown={event=>start(event,'crop',crop)}><button type="button" aria-label={zh?'调整裁剪范围':'Resize crop'} className="absolute -bottom-2 -right-2 h-8 w-8 touch-none rounded-full border-2 border-white bg-violet-600 shadow" onPointerDown={event=>start(event,'cropResize',crop)}/></div>}
     </div>
    </div>
    <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4">
     {mode==='crop'?<><p className="font-semibold">{zh?'选择画面比例':'Choose a crop ratio'}</p><div className="flex flex-wrap gap-2">{[0,1,4/3,16/9,9/16].map((ratio,index)=><button type="button" disabled={busy} key={ratio} className="min-h-11 rounded-xl border px-3" onClick={()=>setCrop(ratio?cropToRatio(size.width,size.height,ratio):FULL)}>{[zh?'原图':'Original','1:1','4:3','16:9','9:16'][index]}</button>)}</div><label className="block text-sm">{zh?'输出尺寸':'Output size'} · {Math.round(scale*100)}%<input disabled={busy} type="range" min={.1} max={2} step={.05} value={scale} onChange={event=>setScale(Number(event.target.value))} className="mt-3 w-full accent-violet-600"/></label><div className="flex gap-2">{[.5,1,2].map(value=><button type="button" disabled={busy} key={value} onClick={()=>setScale(value)} className="min-h-11 rounded-xl border px-3">{value===.5?'½':value===1?(zh?'原尺寸':'1×'):'2×'}</button>)}</div></>:mode==='signature'?<SignaturePad zh={zh} onDone={blob=>void addSignature(blob)}/>:<><label className="block text-sm font-medium">{zh?'水印文字':'Watermark text'}<input disabled={busy} maxLength={120} value={text} onChange={event=>setText(event.target.value)} placeholder={zh?'输入文字后直接拖动':'Enter text, then drag it'} className="mt-2 w-full rounded-xl border px-3 py-3"/></label><label className="block text-sm">{zh?'文字大小':'Text size'}<input type="range" disabled={busy} min={.015} max={.15} step={.005} value={font} onChange={event=>setFont(Number(event.target.value))} className="mt-3 w-full accent-violet-600"/></label><div className="flex gap-2">{['#172033','#ffffff','#6d28d9','#dc2626'].map(value=><button type="button" disabled={busy} key={value} aria-label={`${zh?'文字颜色':'Text color'} ${value}`} aria-pressed={color===value} onClick={()=>setColor(value)} className="h-11 w-11 rounded-full border-2 shadow-sm" style={{background:value,borderColor:color===value?'#a78bfa':'#e2e8f0'}}/>)}</div></>}
     <label className="block text-sm">{zh?'文字与签名透明度':'Text and signature opacity'}<input disabled={busy} type="range" min={.1} max={1} step={.05} value={opacity} onChange={event=>setOpacity(Number(event.target.value))} className="mt-3 w-full accent-violet-600"/></label>
     {signature&&<button type="button" disabled={busy} onClick={()=>setSignature(undefined)} className="min-h-11 rounded-xl border px-4 text-sm">{zh?'移除签名':'Remove signature'}</button>}
    </aside>
   </div>
   <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-4"><label className="text-sm">{zh?'保存格式':'Format'}<select disabled={busy} value={mime} onChange={event=>setMime(event.target.value)} className="ml-2 min-h-11 rounded-xl border px-3"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></label><fieldset><legend className="mb-2 text-sm">{zh?'文件大小（可选，压缩后保存为 JPG）':'File size (optional, saves as JPG)'}</legend><div className="flex flex-wrap gap-2">{[0,20,50,100,200].map(value=><button type="button" disabled={busy} key={value} aria-pressed={target===value} onClick={()=>setTarget(value)} className={`min-h-11 rounded-xl border px-3 text-sm ${target===value?'border-violet-500 bg-violet-50 text-violet-700':''}`}>{value?`${value}KB`:(zh?'保留清晰度':'Full quality')}</button>)}</div></fieldset><button type="button" disabled={busy} onClick={()=>void run()} className="min-h-12 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white disabled:opacity-40">{busy?(zh?'正在生成…':'Preparing…'):(zh?'生成图片':'Create image')}</button></div>
  </>}
  {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
  {!!results.length&&<ResultPanel sourceSlug="image-workspace" files={results} messageZh="图片已生成，可以预览、保存或继续处理。" messageEn="Your image is ready to preview, save or continue processing."/>}
 </div>;
}
