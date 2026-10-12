// One transport decoder shared by conversation and document workspaces.
export async function receiveSasiStream(response:Response,onDelta:(answer:string)=>void):Promise<any>{
 if(!response.headers.get('content-type')?.includes('text/event-stream'))return response.json();
 if(!response.body)throw Error('SASI_STREAM_MISSING');
 const reader=response.body.getReader(),decoder=new TextDecoder();
 let buffer='',answer='',completed:any=null,bytes=0;
 function process(frame:string){
  const lines=frame.split('\n'),kind=lines.find(x=>x.startsWith('event:'))?.slice(6).trim();
  const source=lines.filter(x=>x.startsWith('data:')).map(x=>x.slice(5).trim()).join('\n');
  if(!source)return;
  const payload=JSON.parse(source);
  if(kind==='reset'){answer='';onDelta('');return}
  if(kind==='delta'&&typeof payload.text==='string'){answer+=payload.text;onDelta(answer)}
  if(kind==='done')completed=payload;
 }
 try{
  while(true){
   const next=await reader.read();if(next.done)break;
   bytes+=next.value.byteLength;if(bytes>2*1024*1024)throw Error('SASI_STREAM_BUFFER_LIMIT');
   buffer+=decoder.decode(next.value,{stream:true});
   buffer=buffer.replace(/\r\n/g,'\n');
   let pos;while((pos=buffer.indexOf('\n\n'))>=0){process(buffer.slice(0,pos));buffer=buffer.slice(pos+2)}
  }
  buffer+=decoder.decode();if(buffer.trim())process(buffer);
  if(!completed||typeof completed!=='object')throw Error('SASI_STREAM_INTERRUPTED');
  if(completed.error)throw Error('SASI_RESPONSE_FAILED');
  return completed;
 }catch(error){await reader.cancel().catch(()=>{});throw error}
 finally{reader.releaseLock()}
}
