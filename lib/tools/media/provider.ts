import "server-only";

export type MediaProviderConfig={
 key:string;baseUrl:string;translateModel:string;transcribeModel:string;ttsModel:string;voice:string;
};

export function mediaProviderConfig():MediaProviderConfig|null{
 const key=(process.env.LINGXIFIELD_MEDIA_AI_KEY||process.env.OPENAI_API_KEY||"").trim();
 if(!key)return null;
 return{
  key,
  baseUrl:(process.env.LINGXIFIELD_MEDIA_AI_BASE_URL||process.env.OPENAI_BASE_URL||"https://api.openai.com/v1").replace(/\/+$/,""),
  translateModel:(process.env.LINGXIFIELD_MEDIA_TRANSLATE_MODEL||"gpt-5-mini").trim(),
  transcribeModel:(process.env.LINGXIFIELD_MEDIA_TRANSCRIBE_MODEL||"gpt-transcribe").trim(),
  ttsModel:(process.env.LINGXIFIELD_MEDIA_TTS_MODEL||"gpt-4o-mini-tts").trim(),
  voice:(process.env.LINGXIFIELD_MEDIA_TTS_VOICE||"marin").trim()
 };
}
export function mediaProviderReady(){return Boolean(mediaProviderConfig())}

async function checked(r:Response){
 if(r.ok)return r;
 // Do not echo provider response bodies (which can include private input or tokens).
 throw new Error(`MEDIA_PROVIDER_${r.status}`);
}

const PROVIDER_TIMEOUT_MS=48000;
const MAX_AUDIO_BYTES=32*1024*1024;
const MIN_AUDIO_BYTES=256;
const MAX_JSON_BYTES=1024*1024;
/** Upstream success status is not proof of a playable MP3.
 * Some compatible services return HTTP 200 with JSON error bodies.
 */
export function checkedMp3Response(bytes:Uint8Array,contentType:string|null):Uint8Array{
 if(!(bytes instanceof Uint8Array)||bytes.byteLength<MIN_AUDIO_BYTES||bytes.byteLength>MAX_AUDIO_BYTES)
  throw Error("MEDIA_TTS_INVALID_AUDIO_SIZE");
 const type=(contentType||"").split(";")[0].trim().toLowerCase();
 if(type&&!["audio/mpeg","audio/mp3","audio/x-mpeg","application/octet-stream","binary/octet-stream"].includes(type))
  throw Error("MEDIA_TTS_UNEXPECTED_CONTENT_TYPE");
 const id3=bytes[0]===0x49&&bytes[1]===0x44&&bytes[2]===0x33;
 const mpeg=bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0;
 if(!id3&&!mpeg)throw Error("MEDIA_TTS_NOT_MP3");
 return bytes;
}
async function readProviderJson(r:Response){
 const advertised=Number(r.headers.get("content-length")||0);
 if(advertised>MAX_JSON_BYTES)throw Error("MEDIA_PROVIDER_JSON_TOO_LARGE");
 let bytes=0;
 const chunks:Uint8Array[]=[];
 if(r.body){
  const reader=r.body.getReader();
  try{
   for(;;){
    const {done,value}=await reader.read();if(done)break;
    bytes+=value.byteLength;
    if(bytes>MAX_JSON_BYTES)throw Error("MEDIA_PROVIDER_JSON_TOO_LARGE");
    chunks.push(value);
   }
  }finally{await reader.cancel().catch(()=>{})}
 }else{
  const data=new Uint8Array(await r.arrayBuffer());
  if(data.byteLength>MAX_JSON_BYTES)throw Error("MEDIA_PROVIDER_JSON_TOO_LARGE");
  chunks.push(data);bytes=data.length;
 }
 const body=new Uint8Array(bytes);let off=0;
 for(const chunk of chunks){body.set(chunk,off);off+=chunk.length;}
 try{return JSON.parse(new TextDecoder().decode(body))}
 catch{throw Error("MEDIA_PROVIDER_INVALID_JSON")}
}

export async function translateTextRemote(input:{text:string;source:string;target:string}){
 const c=mediaProviderConfig();if(!c)throw new Error("MEDIA_PROVIDER_NOT_CONFIGURED");
 const r=await checked(await fetch(`${c.baseUrl}/chat/completions`,{
  method:"POST",signal:AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  headers:{authorization:`Bearer ${c.key}`,"content-type":"application/json"},
  body:JSON.stringify({
   model:c.translateModel,
   // Legacy GPT-5-mini does not accept non-default temperature; omit it.
   messages:[
    {role:"system",content:"Translate faithfully. Return only the translated text. Preserve line breaks, numbers, names, and subtitle punctuation. Do not add commentary."},
    {role:"user",content:`Source language: ${input.source}\nTarget language: ${input.target}\n\n${input.text}`}
   ]
  })
 }));
 const d:any=await readProviderJson(r);
 const text=String(d?.choices?.[0]?.message?.content||"").trim();
 if(!text)throw new Error("MEDIA_TRANSLATION_EMPTY");
 return text;
}

export async function transcribeAudioRemote(file:File){
 const c=mediaProviderConfig();if(!c)throw new Error("MEDIA_PROVIDER_NOT_CONFIGURED");
 const fd=new FormData();fd.set("model",c.transcribeModel);fd.set("file",file,file.name||"audio.mp3");fd.set("response_format","json");
 const r=await checked(await fetch(`${c.baseUrl}/audio/transcriptions`,{method:"POST",headers:{authorization:`Bearer ${c.key}`},body:fd,signal:AbortSignal.timeout(PROVIDER_TIMEOUT_MS)}));
 const d:any=await readProviderJson(r);
 const text=String(d?.text||"").trim();
 if(!text)throw new Error("MEDIA_TRANSCRIPT_EMPTY");
 return text;
}

export async function synthesizeRemote(text:string,language:string){
 if(!text.trim()||text.length>4000)throw Error("TTS_TEXT_EXCEEDS_PROVIDER_LIMIT");
 const c=mediaProviderConfig();if(!c)throw new Error("MEDIA_PROVIDER_NOT_CONFIGURED");
 const r=await checked(await fetch(`${c.baseUrl}/audio/speech`,{
  method:"POST",signal:AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  headers:{authorization:`Bearer ${c.key}`,"content-type":"application/json"},
  body:JSON.stringify({
   model:c.ttsModel,voice:c.voice,input:text,response_format:"mp3",
   instructions:`Speak naturally in ${language}. Clear pacing, neutral professional tone.`
  })
 }));
 const advertised=Number(r.headers.get("content-length")||0);
 if(advertised>MAX_AUDIO_BYTES)throw Error("MEDIA_TTS_INVALID_AUDIO_SIZE");
 const bytes=new Uint8Array(await r.arrayBuffer());
 return Buffer.from(checkedMp3Response(bytes,r.headers.get("content-type")));
}
