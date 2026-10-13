"use client";
import {useRef,useState} from 'react';
import EditableNumberInput from '@/components/ui/EditableNumberInput';
import {useLingxiLang} from '@/lib/lingxi-i18n';
import {idGeneratorCopy} from '@/lib/tools/id-generator-copy';
import {createMonotonicUlid,idBatchCount} from '@/lib/tools/shared/id-generator';
import {downloadBlob} from '@/lib/tools/shared/download';

export default function IdGeneratorWorkbench(){
 const {lang}=useLingxiLang(),c=idGeneratorCopy(lang);
 const [count,setCount]=useState(10),[kind,setKind]=useState<'uuid'|'ulid'>('uuid'),[values,setValues]=useState<string[]>([]),[notice,setNotice]=useState('');
 const nextUlid=useRef<ReturnType<typeof createMonotonicUlid>|null>(null);
 function run(){
  setNotice('');
  try{const amount=idBatchCount(count);setCount(amount);nextUlid.current??=createMonotonicUlid();setValues(Array.from({length:amount},()=>kind==='uuid'?crypto.randomUUID():nextUlid.current!()));}
  catch{setValues([]);setNotice(c.failed)}
 }
 return <div className="space-y-4" dir={lang==='ar'?'rtl':'ltr'}>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm">{c.type}<select value={kind} onChange={e=>{setKind(e.target.value as 'uuid'|'ulid');setValues([]);setNotice('')}} className="mt-1 w-full rounded-xl border p-2"><option value="uuid">UUID v4</option><option value="ulid">ULID</option></select></label>
   <label className="text-sm">{c.count}<EditableNumberInput type="number" min={1} max={10000} step={1} value={count} onChange={e=>setCount(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-2"/></label>
  </div>
  <button onClick={run} className="rounded-xl bg-[var(--lx-ink)] px-5 py-2.5 text-sm text-[var(--lx-bg)]">{c.generate}</button>
  {!!values.length&&<>
   <label className="block text-sm">{c.result}<textarea readOnly rows={14} value={values.join('\n')} className="mt-1 w-full rounded-xl border bg-[var(--lx-soft)] p-3 font-mono text-xs"/></label>
   <div className="flex flex-wrap gap-3"><button onClick={async()=>{try{await navigator.clipboard.writeText(values.join('\n'));setNotice(c.copied)}catch{setNotice(c.copyFailed)}}} className="rounded-xl border px-4 py-2 text-sm">{c.copy}</button><button onClick={async()=>{try{await downloadBlob(new Blob([values.join('\n')+'\n'],{type:'text/plain;charset=utf-8'}),'lingxifield-'+kind+'.txt')}catch{setNotice(c.failed)}}} className="rounded-xl border px-4 py-2 text-sm">{c.download}</button></div>
  </>}
  <p role="status" className="text-sm">{notice}</p><p className="text-xs text-[var(--lx-muted)]">{c.help}</p>
 </div>;
}
