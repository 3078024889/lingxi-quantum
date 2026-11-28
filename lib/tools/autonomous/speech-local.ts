/** Speech synthesis runs on the device; only public model assets are downloaded. */
import {awaitLocalOperation,splitTranslationText} from './translation-local';
let synthesizer:Promise<any>|undefined;
export function pcmToWav(samples:Float32Array,rate:number){
 if(!Number.isInteger(rate)||rate<=0||!samples.length)throw Error('LOCAL_VOICE_EMPTY');
 const buffer=new ArrayBuffer(44+samples.length*2),view=new DataView(buffer);
 const label=(offset:number,text:string)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i))};
 label(0,'RIFF');view.setUint32(4,36+samples.length*2,true);label(8,'WAVE');label(12,'fmt ');
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
 view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
 label(36,'data');view.setUint32(40,samples.length*2,true);
 samples.forEach((value,index)=>{const x=Math.max(-1,Math.min(1,Number.isFinite(value)?value:0));view.setInt16(44+index*2,Math.round(x*(x<0?32768:32767)),true)});
 return new Blob([buffer],{type:'audio/wav'});
}
export async function synthesizeLocal(text:string,language:string):Promise<Blob>{
 if(language!=='en')throw Error('LOCAL_VOICE_LANGUAGE_UNSUPPORTED');
 if(!text.trim()||text.length>40000)throw Error('LOCAL_VOICE_TEXT_INVALID');
 if(!synthesizer)synthesizer=(async()=>{
  const mod:any=await import('@huggingface/transformers');
  if(mod.env.backends?.onnx?.wasm)mod.env.backends.onnx.wasm.numThreads=1;
  mod.env.allowLocalModels=true;mod.env.localModelPath='/models/';mod.env.useBrowserCache=true;
  return mod.pipeline('text-to-speech','Xenova/speecht5_tts',{device:'wasm',dtype:'q8',revision:'1723781b8ce2d02f0400c8337be04ae8ee3d6d56'});
 })().catch(error=>{synthesizer=undefined;throw error});
 const pipe=await awaitLocalOperation(synthesizer,undefined,300_000),parts:Float32Array[]=[];let rate=0;
 // Bound the model context; never silently truncate a long narration.
 for(const part of splitTranslationText(text,200)){
  if(!part.trim())continue;
  const output=await awaitLocalOperation<any>(pipe(part,{speaker_embeddings:'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin'}),undefined,120_000);
  if(!output.audio?.length||!output.sampling_rate||rate&&rate!==output.sampling_rate)throw Error('LOCAL_VOICE_EMPTY');
  rate=output.sampling_rate;parts.push(new Float32Array(output.audio));
 }
 const audio=new Float32Array(parts.reduce((n,part)=>n+part.length,0));let offset=0;
 for(const part of parts){audio.set(part,offset);offset+=part.length}
 return pcmToWav(audio,rate);
}
