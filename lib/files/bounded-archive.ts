import JSZip from 'jszip';

export const ARCHIVE_LIMITS={compressedBytes:50*1024*1024,entries:4096,expandedBytes:256*1024*1024,textEntryBytes:16*1024*1024,textTotalBytes:64*1024*1024} as const;
const readBudgets=new WeakMap<JSZip,{bytes:number}>();
type ByteStream={
 on(event:'data',listener:(chunk:Uint8Array)=>void):ByteStream;
 on(event:'error',listener:(error:unknown)=>void):ByteStream;
 on(event:'end',listener:()=>void):ByteStream;
 pause():ByteStream;
 resume():ByteStream;
};

/** Bound ZIP directory work before JSZip allocates a member object per entry. */
function validateDirectory(buffer:ArrayBuffer){
 const data=new DataView(buffer),length=buffer.byteLength;let end=-1;
 for(let offset=length-22;offset>=Math.max(0,length-65557);offset--){
  if(data.getUint32(offset,true)===0x06054b50&&offset+22+data.getUint16(offset+20,true)===length){end=offset;break}
 }
 if(end<0)throw Error('ARCHIVE_DIRECTORY_INVALID');
 const count=data.getUint16(end+10,true),size=data.getUint32(end+12,true),start=data.getUint32(end+16,true);
 if(count>ARCHIVE_LIMITS.entries)throw Error('ARCHIVE_ENTRY_LIMIT');
 // Multi-disk and ZIP64 containers are outside this bounded Office/EPUB policy.
 if(data.getUint16(end+4,true)!==0||data.getUint16(end+6,true)!==0||data.getUint16(end+8,true)!==count||start+size!==end)throw Error('ARCHIVE_DIRECTORY_INVALID');
 let offset=start,total=0;
 for(let index=0;index<count;index++){
  if(offset+46>end||data.getUint32(offset,true)!==0x02014b50)throw Error('ARCHIVE_DIRECTORY_INVALID');
  total+=data.getUint32(offset+24,true);if(total>ARCHIVE_LIMITS.expandedBytes)throw Error('ARCHIVE_EXPANDED_TOO_LARGE');
  offset+=46+data.getUint16(offset+28,true)+data.getUint16(offset+30,true)+data.getUint16(offset+32,true);
  if(offset>end)throw Error('ARCHIVE_DIRECTORY_INVALID');
 }
 if(offset!==end)throw Error('ARCHIVE_DIRECTORY_INVALID');
}

export async function openBoundedArchive(file:Blob){
 if(!Number.isFinite(file.size)||file.size<0||file.size>ARCHIVE_LIMITS.compressedBytes)throw Error('ARCHIVE_INPUT_TOO_LARGE');
 const buffer=await file.arrayBuffer();validateDirectory(buffer);
 const zip=await JSZip.loadAsync(buffer,{checkCRC32:false,createFolders:false});
 const entries=Object.values(zip.files);if(entries.length>ARCHIVE_LIMITS.entries)throw Error('ARCHIVE_ENTRY_LIMIT');
 let total=0;
 for(const entry of entries){
  if(entry.dir)continue;
  // JSZip normalizes empty members to a promise without size metadata.
  const size=(entry as unknown as {_data?:{uncompressedSize?:number}})._data?.uncompressedSize??0;
  if(!Number.isSafeInteger(size)||size<0)throw Error('ARCHIVE_SIZE_INVALID');
  total+=size;if(total>ARCHIVE_LIMITS.expandedBytes)throw Error('ARCHIVE_EXPANDED_TOO_LARGE');
 }
 readBudgets.set(zip,{bytes:0});return zip;
}

/** Count decompressed bytes as chunks arrive; never inflate a whole entry first. */
export async function readArchiveText(zip:JSZip,name:string):Promise<string|undefined>{
 const entry=zip.file(name);if(!entry)return undefined;
 const declared=(entry as unknown as {_data?:{uncompressedSize?:number}})._data?.uncompressedSize;
 if(typeof declared==='number'&&declared>ARCHIVE_LIMITS.textEntryBytes)throw Error('ARCHIVE_TEXT_TOO_LARGE');
 const budget=readBudgets.get(zip);if(!budget)throw Error('ARCHIVE_NOT_VALIDATED');
 return new Promise((resolve,reject)=>{
  // JSZip documents this runtime API but omits it from JSZipObject's typings.
  const stream=(entry as unknown as {internalStream(type:'uint8array'):ByteStream}).internalStream('uint8array'),decoder=new TextDecoder(),parts:string[]=[];let bytes=0,settled=false;
  const fail=(error:unknown)=>{if(settled)return;settled=true;stream.pause();reject(error)};
  stream.on('data',(chunk:Uint8Array)=>{
   if(settled)return;bytes+=chunk.byteLength;budget.bytes+=chunk.byteLength;
   if(bytes>ARCHIVE_LIMITS.textEntryBytes||budget.bytes>ARCHIVE_LIMITS.textTotalBytes){fail(Error('ARCHIVE_TEXT_TOO_LARGE'));return}
   parts.push(decoder.decode(chunk,{stream:true}));
  }).on('error',fail).on('end',()=>{if(settled)return;settled=true;parts.push(decoder.decode());resolve(parts.join(''))}).resume();
 });
}
