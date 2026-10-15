import {openBoundedArchive,readArchiveText} from '@/lib/files/bounded-archive';
import {PDFDocument} from 'pdf-lib';
import {openPdf,renderPdfPage,canvasToBlob} from '@/lib/tools/pdf-render-client';
import type {TranslationSegment} from '@/lib/tools/document-translation-contract';

type PdfBlock={id:string;x:number;y:number;width:number;height:number;fontSize:number};
export type TranslationDocument={segments:TranslationSegment[];finish:(values:Map<string,string>,layout:'layout'|'bilingual',signal:AbortSignal)=>Promise<Blob>;dispose:()=>void;pages:number};
const checkpoint=(signal:AbortSignal)=>{if(signal.aborted)throw Error('TRANSLATION_CANCELLED')};
const needsTranslation=(text:string)=>/[\p{L}]/u.test(text);
const translatedValue=(values:Map<string,string>,id:string)=>id.split('|').map(key=>{const text=values.get(key);if(!text)throw Error('TRANSLATION_INCOMPLETE');return text}).join(' ');
export async function prepareTranslationDocument(file:File,signal:AbortSignal):Promise<TranslationDocument>{
 checkpoint(signal);if(file.size>40*1024*1024)throw Error('DOCUMENT_TOO_LARGE');
 const ext=file.name.split('.').pop()?.toLowerCase(),segments:TranslationSegment[]=[];
 const add=(text:string)=>{
  if(text.length>100000||segments.length>=4000)throw Error('DOCUMENT_TOO_LARGE');const ids:string[]=[];
  const chars=Array.from(text);for(let start=0;start<chars.length;start+=1200){const id=`s${segments.length}`;segments.push({id,text:chars.slice(start,start+1200).join('')});ids.push(id);if(segments.length>4000)throw Error('DOCUMENT_TOO_LARGE')}
  return ids.join('|');
 };
 const noDispose=()=>{};
 if(['txt','md','srt','vtt'].includes(ext||'')){
  const text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());
  const pieces=text.split(/(\r?\n)/),ids=new Map<number,string>();
  pieces.forEach((line,i)=>{if(needsTranslation(line)&&!/^WEBVTT|^\d{2}:\d{2}/.test(line))ids.set(i,add(line))});
  return {segments,pages:0,dispose:noDispose,finish:async(values,_layout,s)=>{checkpoint(s);return new Blob([pieces.map((line,i)=>ids.has(i)?translatedValue(values,ids.get(i)!):line).join('')],{type:'text/plain;charset=utf-8'})}};
 }
 if(['docx','pptx','xlsx','odt','epub'].includes(ext||'')){
  const zip=await openBoundedArchive(file);
  const entries=Object.values(zip.files);let expanded=0;
  if(entries.length>5000)throw Error('DOCUMENT_TOO_LARGE');
  for(const entry of entries){expanded+=Number((entry as unknown as {_data?:{uncompressedSize:number}})._data?.uncompressedSize||0);if(expanded>160*1024*1024)throw Error('DOCUMENT_TOO_LARGE')}
  const parts:Array<{path:string;dom:Document;nodes:Array<{node:Node;id:string;prefix:string;suffix:string}>}>=[];
  for(const entry of entries){
   checkpoint(signal);
   const path=entry.name;
   const allowed=ext==='docx'?/^word\/(document|header\d+|footer\d+|footnotes|endnotes)\.xml$/.test(path):ext==='pptx'?/^ppt\/(slides\/slide\d+|notesSlides\/notesSlide\d+)\.xml$/.test(path):ext==='xlsx'?/^xl\/(sharedStrings|worksheets\/sheet\d+)\.xml$/.test(path):ext==='odt'?path==='content.xml':/\.(xhtml|html|htm)$/i.test(path);
   if(!allowed)continue;
   const xml=(await readArchiveText(zip,path))||'';if(/<!ENTITY|<!DOCTYPE[^>]*\[/i.test(xml))throw Error('DOCUMENT_XML_UNSUPPORTED');
   const dom=new DOMParser().parseFromString(xml,'application/xml');if(dom.querySelector('parsererror'))throw Error('DOCUMENT_XML_INVALID');
   const nodes:Array<{node:Node;id:string;prefix:string;suffix:string}>=[];
   const textNames=ext==='odt'?['p','h']:ext==='epub'?['p','h1','h2','h3','h4','h5','h6','li','title','td','th','figcaption']:['t'];
   const walker=dom.createTreeWalker(dom,NodeFilter.SHOW_TEXT);
   for(let node=walker.nextNode();node;node=walker.nextNode()){
    let parent=node.parentElement,allowed=false,blocked=false;
    for(;parent;parent=parent.parentElement){if(textNames.includes(parent.localName))allowed=true;if(['script','style','math','oMath','oMathPara','code','pre'].includes(parent.localName))blocked=true}
    if(!allowed||blocked||!needsTranslation(node.textContent||''))continue;
    // Spreadsheet formulas, styles, relationships and dimensions remain untouched.
    const text=node.textContent||'';nodes.push({node,id:add(text),prefix:text.match(/^\s*/)?.[0]||'',suffix:text.match(/\s*$/)?.[0]||''});
   }
   if(nodes.length)parts.push({path,dom,nodes});
  }
  return {segments,pages:0,dispose:noDispose,finish:async(values,_layout,s)=>{
   for(const part of parts){checkpoint(s);for(const item of part.nodes){item.node.textContent=item.prefix+translatedValue(values,item.id).trim()+item.suffix;if(item.node.parentElement?.localName==='t')item.node.parentElement.setAttribute('xml:space','preserve')}zip.file(part.path,new XMLSerializer().serializeToString(part.dom))}
   return zip.generateAsync({type:'blob',mimeType:file.type||'application/octet-stream',compression:'DEFLATE'});
  }};
 }
 if(ext!=='pdf')throw Error('DOCUMENT_FORMAT_UNSUPPORTED');
 const pdf=await openPdf(file),blocks:PdfBlock[][]=[];
 const dispose=()=>{void pdf.destroy()};
 try{
  if(pdf.numPages>200)throw Error('DOCUMENT_TOO_LARGE');
  for(let n=1;n<=pdf.numPages;n++){
   checkpoint(signal);const page=await pdf.getPage(n),viewport=page.getViewport({scale:1}),content=await page.getTextContent();
   if(viewport.width*viewport.height*4>16000000||Math.max(viewport.width,viewport.height)*2>8192)throw Error('DOCUMENT_TOO_LARGE');
   const lines:Array<{text:string;x:number;y:number;width:number;height:number;fontSize:number}>=[];
   for(const item of content.items){
    if(!('str' in item)||!item.str.trim())continue;
    const [a,b,c,d,e,f]=item.transform;
    if(Math.abs(b)>.01||Math.abs(c)>.01||viewport.rotation!==0)throw Error('PDF_ROTATED_TEXT_UNSUPPORTED');
    const size=Math.max(Math.abs(a),Math.abs(d)),x=e,y=viewport.height-f-size*.9,width=item.width;
    const previous=lines.at(-1);
    if(previous&&Math.abs(previous.y-y)<size*.25&&x>=previous.x&&x-previous.x-previous.width<size*1.5){previous.text+=' '+item.str;previous.width=x+width-previous.x;previous.height=Math.max(previous.height,size*1.2)}
    else lines.push({text:item.str,x,y,width,height:size*1.2,fontSize:size});
   }
   const groups:typeof lines=[];
   for(const line of lines){
    const previous=groups.at(-1),gap=previous?line.y-previous.y-previous.height:0;
    if(previous&&Math.abs(previous.x-line.x)<line.fontSize&&gap>=-line.fontSize*.3&&gap<line.fontSize*.8&&Math.abs(previous.fontSize-line.fontSize)<1.5){previous.text+='\n'+line.text;previous.width=Math.max(previous.width,line.width);previous.height=line.y+line.height-previous.y}
    else groups.push({...line});
   }
   blocks.push(groups.filter(line=>needsTranslation(line.text)).map(line=>({id:add(line.text),x:line.x,y:line.y,width:line.width,height:line.height,fontSize:line.fontSize})));
  }
  if(!segments.length)throw Error('PDF_SCAN_NEEDS_OCR');
 }catch(e){dispose();throw e}
 return {segments,pages:pdf.numPages,dispose,finish:async(values,layout,s)=>{
  const out=await PDFDocument.create();
  const original=layout==='bilingual'?await PDFDocument.load(await file.arrayBuffer()):null;
  for(let n=1;n<=pdf.numPages;n++){
   checkpoint(s);const rendered=await renderPdfPage(pdf,n,2),canvas=rendered.canvas,ctx=canvas.getContext('2d')!;
   try{
    for(const block of blocks[n-1]){
     const x=Math.max(0,block.x*2-1),y=Math.max(0,block.y*2-1),w=Math.min(canvas.width-x,block.width*2+2),h=Math.min(canvas.height-y,block.height*2+2);
     if(w<=0||h<=0)throw Error('PDF_LAYOUT_REVIEW_REQUIRED');
     // Approximate the local background by the most frequent sampled color.
     const pixels=ctx.getImageData(Math.floor(x),Math.floor(y),Math.max(1,Math.floor(w)),Math.max(1,Math.floor(h))).data,colors=new Map<string,number>();
     for(let i=0;i<pixels.length;i+=16){const key=`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`;colors.set(key,(colors.get(key)||0)+1)}
     const dominant=[...colors].sort((a,b)=>b[1]-a[1])[0][0].split(',').map(Number);
     const translated=translatedValue(values,block.id);let size=block.fontSize*2,lines:string[]=[];
     const font=(v:number)=>`${v}px "Arial","Microsoft YaHei","PingFang SC",sans-serif`;
     const characters=Array.from(translated.replace(/\s*\n\s*/g,' '));
     const wrap=()=>{ctx.font=font(size);const maxLines=Math.floor((h-2)/(size*1.18));if(maxLines<1)return null;const result:string[]=[];let line='';for(const char of characters){if(ctx.measureText(line+char).width>w-2){if(!line)return null;result.push(line.trim());if(result.length>=maxLines||ctx.measureText(char).width>w-2)return null;line=char}else line+=char}if(line)result.push(line.trim());return result};
     for(;size>=12;size-=.5){const candidate=wrap();if(candidate){lines=candidate;break}}
     if(size<12)throw Error('PDF_LAYOUT_REVIEW_REQUIRED');
     ctx.fillStyle=`rgb(${dominant.join(',')})`;ctx.fillRect(x,y,w,h);ctx.fillStyle=dominant.reduce((a,b)=>a+b,0)>384?'#111':'#fff';ctx.font=font(size);ctx.textBaseline='top';ctx.direction=/[\u0600-\u06FF]/.test(translated)?'rtl':'ltr';ctx.textAlign=ctx.direction==='rtl'?'right':'left';
     lines.forEach((line,i)=>ctx.fillText(line,ctx.direction==='rtl'?x+w-1:x+1,y+1+i*size*1.18));
    }
    if(original){const [copy]=await out.copyPages(original,[n-1]);out.addPage(copy)}
    const image=await out.embedPng(await (await canvasToBlob(canvas,'image/png')).arrayBuffer());const page=out.addPage([canvas.width/2,canvas.height/2]);page.drawImage(image,{x:0,y:0,width:canvas.width/2,height:canvas.height/2});
   }finally{canvas.width=canvas.height=1}
  }
  const bytes=await out.save();checkpoint(s);const verified=await PDFDocument.load(bytes);if(verified.getPageCount()!==pdf.numPages*(layout==='bilingual'?2:1))throw Error('TRANSLATION_OUTPUT_INVALID');
  return new Blob([new Uint8Array(bytes)],{type:'application/pdf'});
 }};
}
