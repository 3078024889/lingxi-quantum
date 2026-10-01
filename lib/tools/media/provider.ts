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
 const t=await r.text().catch(()=>"");
 throw new Error(`MEDIA_PROVIDER_${r.status}:${t.slice(0,500)}`);
}

export async function translateTextRemote(input:{text:string;source:string;target:string}){
 const c=mediaProviderConfig();if(!c)throw new Error("MEDIA_PROVIDER_NOT_CONFIGURED");
 const r=await checked(await fetch(`${c.baseUrl}/chat/completions`,{
  method:"POST",
  headers:{authorization:`Bearer ${c.key}`,"content-type":"application/json"},
  body:JSON.stringify({
   model:c.translateModel,
   temperature:0.1,
   messages:[
    {role:"system",content:"Translate faithfully. Return only the translated text. Preserve line breaks, numbers, names, and subtitle punctuation. Do not add commentary."},
    {role:"user",content:`Source language: ${input.source}\nTarget language: ${input.target}\n\n${input.text}`}
   ]
  })
 }));
 const d:any=await r.json();
 const text=String(d?.choices?.[0]?.message?.content||"").trim();
 if(!text)throw new Error("MEDIA_TRANSLATION_EMPTY");
 return text;
}

export async function transcribeAudioRemote(file:File){
 const c=mediaProviderConfig();if(!c)throw new Error("MEDIA_PROVIDER_NOT_CONFIGURED");
 const fd=new FormData();fd.set("model",c.transcribeModel);fd.set("file",file,file.name||"audio.mp3");fd.set("response_format","json");
 const r=await checked(await fetch(`${c.baseUrl}/audio/transcriptions`,{method:"POST",headers:{authorization:`Bearer ${c.key}`},body:fd}));
 const d:any=await r.json();
 const text=String(d?.text||"").trim();
 if(!text)throw new Error("MEDIA_TRANSCRIPT_EMPTY");
 return text;
}

export async function synthesizeRemote(text:string,language:string){
 const c=mediaProviderConfig();if(!c)throw new Error("MEDIA_PROVIDER_NOT_CONFIGURED");
 const r=await checked(await fetch(`${c.baseUrl}/audio/speech`,{
  method:"POST",
  headers:{authorization:`Bearer ${c.key}`,"content-type":"application/json"},
  body:JSON.stringify({
   model:c.ttsModel,voice:c.voice,input:text.slice(0,12000),response_format:"mp3",
   instructions:`Speak naturally in ${language}. Clear pacing, neutral professional tone.`
  })
 }));
 return Buffer.from(await r.arrayBuffer());
}
