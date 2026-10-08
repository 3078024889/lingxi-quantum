import assert from "node:assert/strict";
import {pipeline} from "@huggingface/transformers";

// Network-backed smoke test. Executes actual model weights and a 16kHz mono speech-shaped
// waveform. Runtime test only; not an accuracy benchmark or human-voice verification.
const id="ai8shiro/deepfake-audio-wav2vec2-ONNX";
const start=Date.now();
const model=await pipeline("audio-classification",id,{dtype:"q4"});
const wave=new Float32Array(16000*2);
for(let i=0;i<wave.length;i++)wave[i]=0.12*Math.sin(2*Math.PI*220*i/16000);
const output=await model(wave);
const predictions=Array.isArray(output)?output:[output];
assert(predictions.length>0,"Model produced no output");
for(const row of predictions){assert(typeof row.label==="string");assert(Number.isFinite(row.score));assert(row.score>=0&&row.score<=1);}
assert(predictions.some(p=>["REAL","FAKE","BONAFIDE","SPOOF"].includes(p.label.toUpperCase())),"Unexpected audio class names: "+JSON.stringify(predictions));
console.log("AI_VOICE_MODEL_RUNTIME=PASS",JSON.stringify({model:id,dtype:"q8",predictions,elapsedMs:Date.now()-start}));
