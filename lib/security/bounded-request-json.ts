export async function boundedRequestJson(request:Request,maxBytes:number):Promise<unknown>{
 if(Number(request.headers.get("content-length"))>maxBytes)throw new Error("REQUEST_TOO_LARGE");
 const reader=request.body?.getReader();if(!reader)throw new Error("REQUEST_INVALID");
 const parts:Uint8Array[]=[];let bytes=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>maxBytes){await reader.cancel();throw new Error("REQUEST_TOO_LARGE")}parts.push(value)}}finally{reader.releaseLock()}
 const result=new Uint8Array(bytes);let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length}
 return JSON.parse(new TextDecoder().decode(result));
}
