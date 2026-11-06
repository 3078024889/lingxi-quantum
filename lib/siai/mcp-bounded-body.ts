/**
 * Stream-bounded UTF-8 body reader.
 * Rejects oversized chunked requests before buffering arbitrary request data.
 * Does not persist raw subscription values or record them in logs.
 */
export class McpBodyTooLargeError extends Error {
 constructor(){super("MCP_PAYLOAD_TOO_LARGE");this.name="McpBodyTooLargeError";}
}
export async function readMcpBodyLimited(
 stream:ReadableStream<Uint8Array>|null,
 maxBytes=16384
):Promise<string>{
 if(!Number.isSafeInteger(maxBytes)||maxBytes<1)throw new TypeError("invalid maxBytes");
 if(!stream)throw new TypeError("missing request body");
 const reader=stream.getReader();
 const chunks:Uint8Array[]=[];
 let byteCount=0;
 try{
  for(;;){
   const {done,value}=await reader.read();
   if(done)break;
   if(!(value instanceof Uint8Array))throw new TypeError("invalid request stream chunk");
   byteCount+=value.byteLength;
   if(byteCount>maxBytes){
    try{await reader.cancel("max body bytes exceeded");}catch{}
    throw new McpBodyTooLargeError();
   }
   chunks.push(value);
  }
  const buffer=new Uint8Array(byteCount);
  let offset=0;
  for(const part of chunks){buffer.set(part,offset);offset+=part.byteLength;}
  return new TextDecoder("utf-8",{fatal:true}).decode(buffer);
 }finally{reader.releaseLock();}
}
