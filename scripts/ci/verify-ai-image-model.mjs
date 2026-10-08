import assert from "node:assert/strict";
import {pipeline, RawImage} from "@huggingface/transformers";

// Network-backed smoke test: this MUST download actual model weights and execute WASM.
// It verifies runtime wiring, not accuracy or suitability as forensic evidence.
const id="onnx-community/ai-image-detection-ONNX";
const start=Date.now();
const detector=await pipeline("image-classification",id,{device:"wasm",dtype:"q8"});
const pixels=new Uint8Array(224*224*3);
for(let i=0;i<pixels.length;i+=3){pixels[i]=96;pixels[i+1]=144;pixels[i+2]=176;}
const result=await detector(new RawImage(pixels,224,224,3));
const items=Array.isArray(result)?result:[result];
assert(items.length>0,"Model returned no classes");
for(const item of items){assert(typeof item.label==="string");assert(Number.isFinite(item.score));assert(item.score>=0&&item.score<=1);}
assert(items.some(({label})=>["Real","Fake"].includes(label)),"Unexpected model classes");
console.log("AI_IMAGE_MODEL_RUNTIME=PASS",JSON.stringify({model:id,dtype:"q8",labels:items,elapsedMs:Date.now()-start}));
