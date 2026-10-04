"use client";
import {useMemo,useState} from "react";
import {downloadUrl} from "@/lib/tools/shared/download";
type Kind="url"|"wifi"|"vcard"|"email"|"sms"|"tel"|"geo"|"event"|"text";
function esc(v:string){return v.replace(/([\\;,:\n])/g,"\\$1")}
export default function QrProWorkbench(){
 const[kind,setKind]=useState<Kind>("url"),[a,setA]=useState("https://lingxifield.com"),[b,setB]=useState(""),[c,setC]=useState(""),[dataUrl,setDataUrl]=useState(""),[svg,setSvg]=useState(""),[error,setError]=useState("");
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
 async function run(){setError("");try{const QR=(await import("qrcode")).default;const options={width:1024,margin:2,errorCorrectionLevel:"M" as const};setDataUrl(await QR.toDataURL(payload,options));setSvg(await QR.toString(payload,{...options,type:"svg"}))}catch(e){setError(String(e))}}
 const fields=kind==="wifi"?["Wi‑Fi 名称 SSID","密码","安全类型 WPA/WEP/nopass"]:kind==="vcard"?["姓名","电话","邮箱"]:kind==="email"?["邮箱","主题","正文"]:kind==="sms"?["手机号","短信内容",""]:kind==="tel"?["电话号码","",""]:kind==="geo"?["纬度","经度",""]:kind==="event"?["事件标题","开始时间 20261004T090000","结束时间 20261004T100000"]:[kind==="url"?"网址":"文本","",""];
 const setters=[setA,setB,setC],vals=[a,b,c];
 return <div className="space-y-4">
  <div className="flex flex-wrap gap-2">{(["url","wifi","vcard","email","sms","tel","geo","event","text"] as Kind[]).map(x=><button key={x} onClick={()=>{setKind(x);setDataUrl("");setSvg("")}} className={`rounded-full border px-3 py-1.5 text-xs ${kind===x?"bg-[var(--lx-ink)] text-[var(--lx-bg)]":"border-[var(--lx-line)]"}`}>{x}</button>)}</div>
  <div className="grid gap-3">{fields.map((label,i)=>label?<label key={i} className="text-sm">{label}<input value={vals[i]} onChange={e=>setters[i](e.target.value)} className="mt-1 w-full rounded-xl border p-2"/></label>:null)}</div>
  <button onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)]">生成二维码</button>
  {dataUrl&&<div className="space-y-3 text-center"><img src={dataUrl} alt="QR" className="mx-auto h-64 w-64 bg-white p-2"/><div className="flex justify-center gap-2"><button onClick={()=>downloadUrl(dataUrl,"qrcode.png")} className="rounded-xl border px-4 py-2 text-sm">PNG</button><button onClick={()=>{const u=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));void downloadUrl(u,"qrcode.svg");setTimeout(()=>URL.revokeObjectURL(u),1200)}} className="rounded-xl border px-4 py-2 text-sm">SVG</button></div></div>}
  <p className="text-xs leading-5 text-[var(--lx-muted)]">支持静态 URL、Wi‑Fi、vCard、邮件、SMS、电话、地理位置、日历事件和纯文本。QR 本身不会过期；链接安全仍取决于编码内容。</p>
  {error&&<p className="text-sm text-[var(--lx-danger)]">{error}</p>}
 </div>
}
