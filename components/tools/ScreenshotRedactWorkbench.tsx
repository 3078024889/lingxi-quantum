"use client";
import NextImage from 'next/image';
import {type PointerEvent,useEffect,useRef,useState} from 'react';
import FileDropzone from '@/components/tools/FileDropzone';
import ResultPanel from '@/components/tools/ResultPanel';
import {useLingxiLang,type LingxiLang} from '@/lib/lingxi-i18n';
import type {ToolResultFile} from '@/lib/tools/types';

type Mode='blur'|'black'|'pixelate';
type Box={x:number;y:number;w:number;h:number;mode:Mode};
const copy:Record<LingxiLang,string[]>={
 zh:['滑动浏览','框选遮盖','模糊','像素化','黑块','撤销上一框','清空','生成隐私截图','正在生成…','隐私截图已生成，可以核对后下载。','点击框选，拖动一处后即可继续滑动。敏感文字请用完全不透明的黑块；模糊和像素化只适合视觉处理。'],
 en:['Scroll image','Draw redaction','Blur','Pixelate','Black','Undo last','Clear','Export redacted image','Creating…','Redacted image is ready for review.','Choose Draw redaction, drag one area, then scroll normally. Use opaque black for sensitive text; blur and pixelation are visual effects.'],
 ja:['スクロール','範囲を選択','ぼかし','モザイク','黒塗り','元に戻す','クリア','画像を書き出す','生成中…','画像を確認して保存できます。','範囲をドラッグ後はスクロールできます。機密文字には不透明な黒塗りを使ってください。'],
 ko:['스크롤','영역 선택','흐림','픽셀화','검정','실행 취소','지우기','이미지 내보내기','생성 중…','이미지를 확인하고 저장하세요.','영역을 그린 후 스크롤하세요. 민감한 텍스트에는 불투명한 검정을 사용하세요.'],
 fr:['Défiler','Tracer une zone','Flou','Pixelliser','Noir','Annuler','Effacer','Exporter l’image','Création…','Vérifiez l’image avant de l’enregistrer.','Tracez une zone puis défilez. Utilisez le noir opaque pour le texte sensible ; flou et pixellisation sont des effets visuels.'],
 de:['Scrollen','Bereich markieren','Weichzeichnen','Verpixeln','Schwarz','Rückgängig','Leeren','Bild exportieren','Erstellung…','Bild vor dem Speichern prüfen.','Bereich ziehen, danach scrollen. Für sensible Texte undurchsichtiges Schwarz verwenden; Unschärfe und Pixel sind visuelle Effekte.'],
 es:['Desplazar','Marcar zona','Desenfocar','Pixelar','Negro','Deshacer','Borrar','Exportar imagen','Creando…','Revisa la imagen antes de guardar.','Marca una zona y vuelve a desplazar. Usa negro opaco para texto sensible; desenfoque y píxeles son efectos visuales.'],
 pt:['Rolar','Marcar área','Desfocar','Pixelizar','Preto','Desfazer','Limpar','Exportar imagem','Criando…','Revise a imagem antes de salvar.','Marque uma área e volte a rolar. Use preto opaco para texto sensível; desfoque e pixels são efeitos visuais.'],
 ar:['تمرير','تحديد منطقة','تمويه','بكسلة','أسود','تراجع','مسح','تصدير الصورة','جارٍ الإنشاء…','راجع الصورة قبل الحفظ.','حدد منطقة ثم مرر. استخدم الأسود المعتم للنص الحساس؛ التمويه والبكسلة تأثيرات بصرية.']
};
export default function ScreenshotRedactWorkbench(){
 const {lang}=useLingxiLang(),t=copy[lang]||copy.en;
 const [files,setFiles]=useState<File[]>([]),[src,setSrc]=useState(''),[size,setSize]=useState({width:1,height:1}),[boxes,setBoxes]=useState<Box[]>([]),[pending,setPending]=useState<Box|null>(null),[draw,setDraw]=useState(false),[mode,setMode]=useState<Mode>('black'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<ToolResultFile[]>([]);
 const wrap=useRef<HTMLDivElement>(null),start=useRef<{x:number;y:number;pointer:number}|null>(null),file=files[0];
 useEffect(()=>()=>{if(src)URL.revokeObjectURL(src)},[src]);
 function choose(next:File[]){setFiles(next);setBoxes([]);setPending(null);setDraw(false);start.current=null;setResult([]);setError('');setSrc(next[0]?URL.createObjectURL(next[0]):'')}
 function point(e:PointerEvent){const r=wrap.current!.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
 async function exportImg(){
  if(!file||!boxes.length||busy)return;setBusy(true);setError('');setResult([]);let bmp:ImageBitmap|null=null,canvas:HTMLCanvasElement|null=null;
  try{bmp=await createImageBitmap(file);if(bmp.width*bmp.height>32_000_000)throw Error('IMAGE_PIXEL_LIMIT_32000000');canvas=document.createElement('canvas');canvas.width=bmp.width;canvas.height=bmp.height;const ctx=canvas.getContext('2d');if(!ctx)throw Error('CANVAS_UNAVAILABLE');ctx.drawImage(bmp,0,0);
   for(const b of boxes){const x=Math.floor(b.x*canvas.width),y=Math.floor(b.y*canvas.height),w=Math.max(1,Math.ceil((b.x+b.w)*canvas.width)-x),h=Math.max(1,Math.ceil((b.y+b.h)*canvas.height)-y);
    if(b.mode==='black'){ctx.fillStyle='#000';ctx.globalAlpha=1;ctx.fillRect(x,y,w,h);continue}
    const temp=document.createElement('canvas');try{if(b.mode==='pixelate'){const block=Math.max(6,Math.min(30,Math.round(Math.min(w,h)/12)));temp.width=Math.max(1,Math.ceil(w/block));temp.height=Math.max(1,Math.ceil(h/block));temp.getContext('2d')!.drawImage(canvas,x,y,w,h,0,0,temp.width,temp.height);ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(temp,0,0,temp.width,temp.height,x,y,w,h);ctx.restore()}else{const sx=Math.max(0,x-20),sy=Math.max(0,y-20),sw=Math.min(canvas.width-sx,w+40),sh=Math.min(canvas.height-sy,h+40);temp.width=sw;temp.height=sh;temp.getContext('2d')!.drawImage(canvas,sx,sy,sw,sh,0,0,sw,sh);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.filter='blur(18px)';ctx.drawImage(temp,sx,sy,sw,sh);ctx.restore()}}finally{temp.width=temp.height=1}
   }
   const blob=await new Promise<Blob>((resolve,reject)=>canvas!.toBlob(b=>b?resolve(b):reject(Error('EXPORT_FAILED')),'image/png'));setResult([{name:'redacted-'+file.name.replace(/\.[^.]+$/,'')+'.png',blob,mime:'image/png',size:blob.size}]);
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{bmp?.close();if(canvas)canvas.width=canvas.height=1;setBusy(false)}
 }
 return <div dir={lang==='ar'?'rtl':'ltr'} className="space-y-4">
  <FileDropzone accept="image/*" files={files} onChange={choose} disabled={busy} kind="image" maxSizeMB={30}/><p className="text-sm text-[var(--lx-muted)]">{t[10]}</p>
  <div className="flex flex-wrap gap-2">{[false,true].map(active=><button key={String(active)} disabled={busy||!src||boxes.length>=200} type="button" aria-pressed={draw===active} onClick={()=>{setDraw(active);setPending(null);start.current=null}} className="rounded-xl border border-[var(--lx-line)] px-4 py-3 text-sm aria-pressed:bg-[var(--lx-ink)] aria-pressed:text-[var(--lx-bg)]">{t[active?1:0]}</button>)}{(['black','blur','pixelate'] as const).map(m=><button key={m} type="button" disabled={busy} aria-pressed={mode===m} onClick={()=>setMode(m)} className="rounded-xl border border-[var(--lx-line)] px-4 py-3 text-sm aria-pressed:bg-[var(--lx-ink)] aria-pressed:text-[var(--lx-bg)]">{t[m==='black'?4:m==='blur'?2:3]}</button>)}<button type="button" disabled={!boxes.length||busy} onClick={()=>{setBoxes(old=>old.slice(0,-1));setResult([])}} className="rounded-xl border px-4 py-3 text-sm">{t[5]}</button><button type="button" disabled={!boxes.length||busy} onClick={()=>{setBoxes([]);setResult([])}} className="rounded-xl border px-4 py-3 text-sm">{t[6]}</button></div>
  {src&&<div ref={wrap} data-redaction-surface data-mode={draw?'draw':'scroll'} className="relative mx-auto w-fit max-w-full overflow-hidden border border-[var(--lx-line)]" style={{touchAction:draw?'none':'pan-y pinch-zoom',cursor:draw?'crosshair':'auto'}} onPointerDown={e=>{if(!draw||busy||!e.isPrimary||e.button!==0||start.current)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);start.current={...p,pointer:e.pointerId};setPending({...p,w:0,h:0,mode})}} onPointerMove={e=>{const s=start.current;if(!s||s.pointer!==e.pointerId)return;const p=point(e);setPending({x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y),mode})}} onPointerUp={e=>{const s=start.current;if(!s||s.pointer!==e.pointerId)return;const p=point(e),box={x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y),mode};start.current=null;setPending(null);setDraw(false);if(box.w>=.003&&box.h>=.003&&boxes.length<200){setBoxes(old=>[...old,box]);setResult([])}if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onPointerCancel={()=>{start.current=null;setPending(null);setDraw(false)}} onLostPointerCapture={()=>{start.current=null;setPending(null);setDraw(false)}}>
   <NextImage src={src} alt="" draggable={false} width={size.width} height={size.height} onLoad={e=>setSize({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} className="block max-w-full select-none" style={{width:Math.min(size.width,760),height:'auto'}} unoptimized/>
   {[...boxes,...(pending?[pending]:[])].map((b,index)=><div key={index} data-redaction-box className={`pointer-events-none absolute ${b.mode==='black'?'bg-black':b.mode==='pixelate'?'bg-black/40':'backdrop-blur-md bg-white/10'}`} style={{left:`${b.x*100}%`,top:`${b.y*100}%`,width:`${b.w*100}%`,height:`${b.h*100}%`}}/>)}
  </div>}
  <button disabled={!file||!boxes.length||busy} onClick={exportImg} className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm text-[var(--lx-bg)] disabled:opacity-40">{t[busy?8:7]}</button>{!!result.length&&<ResultPanel files={result} messageZh={t[9]} messageEn={t[9]}/>} {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>;
}
