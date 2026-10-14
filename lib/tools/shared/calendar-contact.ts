/** Text-field export following RFC 5545 / RFC 6350. This does not expand
 * recurrence rules or convert time zones; date strings remain source values.
 */
type Property={name:string;value:string;header:string};
const MAX_BYTES=10*1024*1024;
export function decodeCardText(value:string){return value.replace(/\\([nN,;\\])/g,(_all,escaped:string)=>escaped.toLowerCase()==='n'?'\n':escaped);}
function splitStructured(value:string){const parts:string[]=[];let start=0;for(let i=0;i<value.length;i++){if(value[i]==='\\'){i++;continue}if(value[i]===';'){parts.push(decodeCardText(value.slice(start,i)));start=i+1}}parts.push(decodeCardText(value.slice(start)));return parts;}
function property(line:string):Property{
 let quoted=false,colon=-1;
 for(let i=0;i<line.length;i++){if(line[i]==='"')quoted=!quoted;if(line[i]===':'&&!quoted){colon=i;break}}
 if(colon<1)throw new Error('INVALID_CONTENT_LINE');
 const header=line.slice(0,colon),name=header.split(';')[0].split('.').pop()!.toUpperCase();
 let value=line.slice(colon+1);
 // Legacy vCard 2.1 transfer encodings are common in exported address books.
 if(['FN','N','ORG','TITLE','TEL','EMAIL'].includes(name)){
  const encoding=header.match(/;ENCODING=([^;]+)/i)?.[1]?.toUpperCase();
  const charset=(header.match(/;CHARSET=([^;]+)/i)?.[1]||'utf-8').replace(/^"|"$/g,'');
  if(encoding==='QUOTED-PRINTABLE'){
   const bytes:number[]=[];for(let i=0;i<value.length;i++){if(value[i]==='='){if(!/^[a-f0-9]{2}$/i.test(value.slice(i+1,i+3)))throw new Error('INVALID_QUOTED_PRINTABLE');bytes.push(parseInt(value.slice(i+1,i+3),16));i+=2;}else{const char=value.codePointAt(i)!;bytes.push(...new TextEncoder().encode(String.fromCodePoint(char)));if(char>0xffff)i++;}}
   value=new TextDecoder(charset,{fatal:true}).decode(new Uint8Array(bytes));
  }else if(encoding==='B'||encoding==='BASE64'){
   if(!/^(?:[a-z0-9+/]{4})*(?:[a-z0-9+/]{2}==|[a-z0-9+/]{3}=)?$/i.test(value))throw new Error('INVALID_BASE64_TEXT');
   value=new TextDecoder(charset,{fatal:true}).decode(Uint8Array.from(atob(value),char=>char.charCodeAt(0)));
  }
 }
 return {name,value,header};
}
function records(raw:string,target:'VEVENT'|'VCARD'){
 if(raw.length>MAX_BYTES||new TextEncoder().encode(raw).byteLength>MAX_BYTES)throw new Error('CALENDAR_CONTACT_TOO_LARGE');
 const physical=raw.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n'),lines:string[]=[];
 for(let i=0;i<physical.length;i++){
  let line=physical[i];if(/;ENCODING=QUOTED-PRINTABLE(?:;|:)/i.test(line))while(line.endsWith('=')&&i+1<physical.length)line=line.slice(0,-1)+physical[++i].replace(/^[ \t]/,'');
  if(/^[ \t]/.test(line)&&lines.length)lines[lines.length-1]+=line.slice(1);else lines.push(line);
 }
 const stack:string[]=[],rows:Property[][]=[];let active:Property[]|null=null;
 for(const line of lines){if(!line)continue;const p=property(line);
  if(p.name==='BEGIN'){const name=p.value.toUpperCase();if(stack.length>=16)throw new Error('CONTENT_NESTING_TOO_DEEP');if(name===target){if(active)throw new Error('NESTED_CONTENT_RECORD');active=[]}stack.push(name);continue;}
  if(p.name==='END'){const name=p.value.toUpperCase();if(stack.pop()!==name)throw new Error('UNBALANCED_CONTENT_RECORD');if(name===target){rows.push(active!);active=null;if(rows.length>10000)throw new Error('TOO_MANY_CONTENT_RECORDS')}continue;}
  // A nested VALARM has its own SUMMARY/DESCRIPTION: never overwrite the event.
  if(active&&stack.at(-1)===target)active.push(p);
 }
 if(stack.length||active||!rows.length)throw new Error('NO_COMPLETE_CONTENT_RECORDS');return rows;
}
function csv(rows:string[][]){return rows.map(row=>row.map(value=>'"'+value.replace(/"/g,'""')+'"').join(',')).join('\r\n');}
const values=(row:Property[],key:string)=>row.filter(p=>p.name===key).map(p=>p.value);
export function calendarToCsv(raw:string){
 const rows=[['summary','start','end','location','description','uid','start_timezone','end_timezone','recurrence_rule','recurrence_id']];
 for(const row of records(raw,'VEVENT')){
  const fields=['SUMMARY','DTSTART','DTEND','LOCATION','DESCRIPTION','UID'].map(key=>{const value=values(row,key)[0]??'';return ['SUMMARY','LOCATION','DESCRIPTION'].includes(key)?decodeCardText(value):value});
  const zone=(key:string)=>row.find(p=>p.name===key)?.header.match(/;TZID=(?:"([^"]+)"|([^;]+))/i)?.slice(1).find(Boolean)??'';
  rows.push([...fields,zone('DTSTART'),zone('DTEND'),values(row,'RRULE')[0]??'',values(row,'RECURRENCE-ID')[0]??'']);
 }
 return csv(rows);
}
export function contactsToCsv(raw:string){
 const rows=[['name','organization','title','phones','emails']];
 for(const row of records(raw,'VCARD')){
  const names=values(row,'N')[0],structured=names?splitStructured(names):[];
  const name=values(row,'FN')[0];const fallback=[structured[3],structured[1],structured[2],structured[0],structured[4]].filter(Boolean).join(' ');
  rows.push([name!==undefined?decodeCardText(name):fallback,splitStructured(values(row,'ORG')[0]??'').join(' / '),decodeCardText(values(row,'TITLE')[0]??''),values(row,'TEL').map(decodeCardText).join(' | '),values(row,'EMAIL').map(decodeCardText).join(' | ')]);
 }return csv(rows);
}
