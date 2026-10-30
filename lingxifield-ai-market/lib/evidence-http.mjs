// Strict bounded HTTP evidence handling; no bypass of access controls.
export const MAX_EVIDENCE_BYTES = 1_200_000;
export function classifyRedirect(source, location) {
  if (!location) return {status:'REDIRECT_REVIEW',reason:'MISSING_LOCATION'};
  try {
    const from=new URL(source),to=new URL(location,from);
    if(to.protocol!=='https:'||to.username||to.password) return {status:'REDIRECT_REVIEW',reason:'UNSAFE_TARGET'};
    return {status:'REDIRECT_REVIEW',reason:to.hostname===from.hostname?'SAME_HOST_REVIEW':'CROSS_HOST_REVIEW',target:to.href};
  } catch {return {status:'REDIRECT_REVIEW',reason:'INVALID_LOCATION'}}
}
export async function readBoundedResponse(response, maxBytes=MAX_EVIDENCE_BYTES) {
  const declared=Number(response.headers.get('content-length'));
  if(Number.isFinite(declared)&&declared>maxBytes)return {status:'TOO_LARGE'};
  if(!response.body)return {status:'EMPTY_BODY'};
  const reader=response.body.getReader();let size=0;const chunks=[];
  try {
    while(true){const {done,value}=await reader.read();if(done)break;
      size+=value.byteLength;
      if(size>maxBytes)return {status:'TOO_LARGE'};
      chunks.push(value);
    }
  } finally {await reader.cancel().catch(()=>{});reader.releaseLock()}
  const bytes=new Uint8Array(size);let index=0;
  for(const chunk of chunks){bytes.set(chunk,index);index+=chunk.byteLength}
  return {status:'OK',raw:new TextDecoder('utf-8',{fatal:false}).decode(bytes),byteLength:size};
}
export function unmodifiedState(previous){return previous?.hash?'UNCHANGED':'NOT_MODIFIED_WITHOUT_BASELINE'}
