"use client";
import ToolUiText from "@/components/tools/ToolUiText";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {claimToolStart,ToolAccessError,toolAccessMessage} from "@/lib/tools/commerce/tool-start-client";
import {useEffect,useMemo,useState} from "react";
import ResultFileActions from './ResultFileActions';
type Kind="url"|"wifi"|"vcard"|"email"|"sms"|"tel"|"geo"|"event"|"text";
function esc(v:string){return v.replace(/([\\;,:\n])/g,"\\$1")}
export default function QrProWorkbench(){
 const {lang}=useLingxiLang();
 const[kind,setKind]=useState<Kind>("url"),[a,setA]=useState("https://lingxifield.com"),[b,setB]=useState(""),[c,setC]=useState(""),[dataUrl,setDataUrl]=useState(""),[svg,setSvg]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{setHydrated(true)},[]);
 const payload=useMemo(()=>{
  if(kind==="wifi")return `WIFI:T:${c||"WPA"};S:${esc(a)};P:${esc(b)};;`;
  if(kind==="vcard")return `BEGIN:VCARD\nVERSION:3.0\nFN:${a}\nTEL:${b}\nEMAIL:${c}\nEND:VCARD`;
  if(kind==="email")return `mailto:${a}?subject=${encodeURIComponent(b)}&body=${encodeURIComponent(c)}`;
  if(kind==="sms")return `SMSTO:${a}:${b}`;
  if(kind==="tel")return `tel:${a}`;
  if(kind==="geo")return `geo:${a},${b}`;
  if(kind==="event")return `BEGIN:VEVENT\nSUMMARY:${a}\nDTSTART:${b}\nDTEND:${c}\nEND:VEVENT`;
  return a;
 },[kind,a,b,c]);
 function resetOutput(){setError("");setDataUrl("");setSvg("")}
 async function run(){
  if(busy||!a.trim())return;
  setBusy(true);resetOutput();
  try{
   await claimToolStart("qr-code-generator",1);
   const QR=(await import("qrcode")).default,options={width:1024,margin:2,errorCorrectionLevel:"M" as const};
   const [png,vector]=await Promise.all([QR.toDataURL(payload,options),QR.toString(payload,{...options,type:"svg"})]);
   setSvg(vector);setDataUrl(png);
  }catch(e){setError(e instanceof ToolAccessError?toolAccessMessage(lang,e.code):lang==="zh"?"二维码生成失败，请缩短内容后重试。":"Could not generate the QR code. Shorten the content and retry.")}
  finally{setBusy(false)}
 }
 const fields=kind==="wifi"?["Wi‑Fi 名称 SSID","密码","安全类型 WPA/WEP/nopass"]:kind==="vcard"?["姓名","电话","邮箱"]:kind==="email"?["邮箱","主题","正文"]:kind==="sms"?["手机号","短信内容",""]:kind==="tel"?["电话号码","",""]:kind==="geo"?["纬度","经度",""]:kind==="event"?["事件标题","开始时间 20261004T090000","结束时间 20261004T100000"]:[kind==="url"?"网址":"文本","",""];
 const setters=[setA,setB,setC],vals=[a,b,c];
 const pngFile=useMemo(()=>{if(!dataUrl)return null;const bytes=Uint8Array.from(atob(dataUrl.split(',')[1]),c=>c.charCodeAt(0));return new Blob([bytes],{type:'image/png'})},[dataUrl]);
 const svgFile=useMemo(()=>new Blob([svg],{type:'image/svg+xml'}),[svg]);
 return <div className="space-y-4">
  <div className="flex flex-wrap gap-2">{(["url","wifi","vcard","email","sms","tel","geo","event","text"] as Kind[]).map(x=><button key={x} type="button" aria-pressed={kind===x} disabled={!hydrated||busy} onClick={()=>{if(x===kind)return;setKind(x);setA(x==="url"?"https://lingxifield.com":"");setB("");setC("");resetOutput()}} className={`rounded-full border px-3 py-1.5 text-xs ${kind===x?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border-[var(--lx-line)]"}`}>{x}</button>)}</div>
  <div className="grid gap-3">{fields.map((label,i)=>label?<label key={i} className="text-sm"><ToolUiText text={label}/><input disabled={!hydrated||busy} value={vals[i]} onChange={e=>{setters[i](e.target.value);resetOutput()}} className="mt-1 w-full rounded-xl border p-2"/></label>:null)}</div>
  <button type="button" onClick={run} disabled={!hydrated||busy||!a.trim()} aria-busy={busy||undefined} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)]"><ToolUiText text={busy?"正在生成…":"生成二维码"} /></button>
  {dataUrl&&pngFile&&<div className="space-y-3"><img src={dataUrl} alt="QR" className="mx-auto h-64 w-64 bg-white p-2"/><ResultFileActions blob={pngFile} name="qrcode.png" saveLabel="PNG"/><ResultFileActions blob={svgFile} name="qrcode.svg" saveLabel="SVG"/></div>}
  <p className="text-xs leading-5 text-[var(--lx-muted)]"><ToolUiText text="支持静态 URL、Wi‑Fi、vCard、邮件、SMS、电话、地理位置、日历事件和纯文本。QR 本身不会过期；链接安全仍取决于编码内容。" /></p>
  {error&&<p role="alert" className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>
}
