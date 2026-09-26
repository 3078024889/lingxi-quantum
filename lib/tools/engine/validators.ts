import fs from "node:fs";import path from "node:path";
export type Validation={ok:boolean;check:string;reason?:string;details?:Record<string,unknown>};
type Ctx={inputPaths?:string[];outputPaths?:string[];text?:string;expected?:Record<string,unknown>};

function files(paths:string[]|undefined){return (paths||[]).filter(Boolean)}
function n(x:unknown){const v=Number(x);return Number.isFinite(v)?v:null}
function expectedPair(e:Record<string,unknown>|undefined,a:string,b:string){const x=n(e?.[a]),y=n(e?.[b]);return x!=null&&y!=null?[x,y] as const:null}
function magic(file:string){const b=fs.readFileSync(file).subarray(0,16);return b.toString("latin1")}
function srtTimes(text:string){const out:number[]=[];for(const m of text.matchAll(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/g)){const v=[...m].slice(1).map(Number);out.push((((v[0]*60+v[1])*60+v[2])*1000+v[3]),(((v[4]*60+v[5])*60+v[6])*1000+v[7]));}return out}
function monotonic(xs:number[]){for(let i=0;i<xs.length;i+=2){if(xs[i+1]<xs[i])return false;if(i>=2&&xs[i]<xs[i-1])return false}return true}
function same(a:unknown,b:unknown){return JSON.stringify(a)===JSON.stringify(b)}
const missing=(check:string,reason="VALIDATION_CONTEXT_MISSING"):Validation=>({ok:false,check,reason});

export async function validateArtifact(check:string,ctx:Ctx):Promise<Validation>{
 try{
  const out=files(ctx.outputPaths),inp=files(ctx.inputPaths),e=ctx.expected||{};
  if(check==="output-exists"){const ok=out.length>0&&out.every(p=>fs.existsSync(p)&&fs.statSync(p).isFile()&&fs.statSync(p).size>0);return{ok,check,reason:ok?undefined:"OUTPUT_MISSING_OR_EMPTY"}}
  if(check==="output-opens"){
   if(!out.length)return missing(check);
   const bad=out.find(p=>!fs.existsSync(p)||fs.statSync(p).size===0);
   if(bad)return{ok:false,check,reason:"OUTPUT_MISSING_OR_EMPTY",details:{file:bad}};
   for(const f of out){const ext=path.extname(f).toLowerCase(),m=magic(f);if(ext===".pdf"&&!m.startsWith("%PDF-"))return{ok:false,check,reason:"PDF_MAGIC_INVALID",details:{file:f}}}
   return{ok:true,check};
  }
  if(check==="nonempty-text-or-explicit-no-text"||check==="result-editable"||check==="nonempty-or-explicit-empty"){
   if(typeof ctx.text!=="string")return missing(check);
   const explicitEmpty=e.explicitEmpty===true;const ok=ctx.text.trim().length>0||explicitEmpty;return{ok,check,reason:ok?undefined:"TEXT_EMPTY_WITHOUT_EXPLICIT_EMPTY"};
  }
  if(check==="timestamps-monotonic"){
   if(typeof ctx.text!=="string")return missing(check);
   const ts=srtTimes(ctx.text);if(!ts.length&&e.explicitSilence===true)return{ok:true,check};const ok=ts.length>0&&monotonic(ts);return{ok,check,reason:ok?undefined:"TIMESTAMPS_INVALID"};
  }
  if(check==="timestamps-identical"){
   if(!Array.isArray(e.beforeTimestamps)||!Array.isArray(e.afterTimestamps))return missing(check);
   const ok=same(e.beforeTimestamps,e.afterTimestamps);return{ok,check,reason:ok?undefined:"TIMESTAMPS_CHANGED"};
  }
  if(check==="cue-count-preserved"){
   const p=expectedPair(e,"beforeCueCount","afterCueCount");if(!p)return missing(check);
   return{ok:p[0]===p[1],check,reason:p[0]===p[1]?undefined:"CUE_COUNT_CHANGED",details:{before:p[0],after:p[1]}};
  }
  if(check==="dimensions-preserved"||check==="dimensions-exact"||check==="requested-size-exact"){
   const iw=n(e.inputWidth),ih=n(e.inputHeight),ow=n(e.outputWidth),oh=n(e.outputHeight);
   if(ow==null||oh==null)return missing(check);
   if(check==="dimensions-preserved"){if(iw==null||ih==null)return missing(check);const ok=iw===ow&&ih===oh;return{ok,check,reason:ok?undefined:"DIMENSIONS_CHANGED"}}
   const rw=n(e.requestedWidth),rh=n(e.requestedHeight);if(rw==null||rh==null)return missing(check);const ok=rw===ow&&rh===oh;return{ok,check,reason:ok?undefined:"DIMENSIONS_NOT_EXACT"};
  }
  if(["page-count-preserved","page-count-sum","all-pages-accounted-for","image-count-preserved","image-count-preserved","sheet-count-accounted-for","row-count-preserved","all-inputs-accounted-for"].includes(check)){
   const before=n(e.beforeCount??e.inputCount),after=n(e.afterCount??e.outputCount);
   if(before==null||after==null)return missing(check);const ok=before===after;return{ok,check,reason:ok?undefined:"COUNT_MISMATCH",details:{before,after}};
  }
  if(check==="target-reported"||check==="size-reported"){
   const bytes=n(e.outputBytes??(out[0]&&fs.existsSync(out[0])?fs.statSync(out[0]).size:null));
   if(bytes==null)return missing(check);const target=n(e.targetBytes);const ok=target==null?bytes>0:bytes<=target;return{ok,check,reason:ok?undefined:"TARGET_NOT_MET",details:{bytes,target}};
  }
  if(check==="duration-within-tolerance"){
   const before=n(e.inputDuration),after=n(e.outputDuration),tol=n(e.toleranceSeconds)??1;
   if(before==null||after==null)return missing(check);const ok=Math.abs(before-after)<=tol;return{ok,check,reason:ok?undefined:"DURATION_OUT_OF_TOLERANCE",details:{before,after,tolerance:tol}};
  }
  if(check==="audio-preserved"||check==="audio-track-present"){
   if(typeof e.outputHasAudio!=="boolean")return missing(check);const ok=e.outputHasAudio===true;return{ok,check,reason:ok?undefined:"AUDIO_TRACK_MISSING"};
  }
  if(check==="privacy-metadata-removed"){
   if(!Array.isArray(e.remainingSensitiveMetadata))return missing(check);const ok=e.remainingSensitiveMetadata.length===0;return{ok,check,reason:ok?undefined:"SENSITIVE_METADATA_REMAINS",details:{remaining:e.remainingSensitiveMetadata}};
  }
  if(check==="redacted-text-not-recoverable"){
   if(typeof e.redactedTextRecoverable!=="boolean")return missing(check);const ok=e.redactedTextRecoverable===false;return{ok,check,reason:ok?undefined:"REDACTED_TEXT_RECOVERABLE"};
  }
  if(check==="source-present"){
   const ok=typeof e.source==="string"&&e.source.trim().length>0;return{ok,check,reason:ok?undefined:"SOURCE_MISSING"};
  }
  if(check==="no-fabricated-zero"||check==="missing-is-null-not-zero"){
   if(!Array.isArray(e.missingValues))return missing(check);const ok=e.missingValues.every(v=>v===null||v===undefined);return{ok,check,reason:ok?undefined:"MISSING_VALUE_FABRICATED"};
  }
  if(check==="totals-reconcile"){
   const expected=n(e.expectedTotal),actual=n(e.actualTotal),tol=n(e.tolerance)??0.01;if(expected==null||actual==null)return missing(check);
   const ok=Math.abs(expected-actual)<=tol;return{ok,check,reason:ok?undefined:"TOTAL_MISMATCH"};
  }
  if(check==="canonical-document-valid"){const ok=typeof e.title==="string"&&Array.isArray(e.sections);return{ok,check,reason:ok?undefined:"CANONICAL_DOCUMENT_INVALID"}}
  if(check==="markdown-nonempty"){const v=typeof e.markdown==="string"?e.markdown:ctx.text;if(typeof v!=="string")return missing(check);const ok=v.trim().length>0;return{ok,check,reason:ok?undefined:"MARKDOWN_EMPTY"}}
  if(check==="payload-visible-before-navigation"||check==="payload-present"){const ok=typeof e.payload==="string"&&e.payload.length>0;return{ok,check,reason:ok?undefined:"PAYLOAD_MISSING"}}
  if(check==="image-generated"){const ok=out.length>0&&out.every(x=>fs.existsSync(x)&&fs.statSync(x).size>0);return{ok,check,reason:ok?undefined:"IMAGE_NOT_GENERATED"}}
  if(check==="orientation-correct"){if(typeof e.orientationCorrect!=="boolean")return missing(check);return{ok:e.orientationCorrect,check,reason:e.orientationCorrect?undefined:"ORIENTATION_INCORRECT"}}
  if(check==="estimated-values-labeled"){if(typeof e.estimatedValuesLabeled!=="boolean")return missing(check);return{ok:e.estimatedValuesLabeled,check,reason:e.estimatedValuesLabeled?undefined:"ESTIMATES_NOT_LABELED"}}
  if(check==="bounded-result-count"){const count=n(e.resultCount),limit=n(e.limit);if(count==null||limit==null)return missing(check);const ok=count<=limit;return{ok,check,reason:ok?undefined:"RESULT_LIMIT_EXCEEDED"}}
  if(check==="face-position-valid"){if(typeof e.facePositionValid!=="boolean")return missing(check);return{ok:e.facePositionValid,check,reason:e.facePositionValid?undefined:"FACE_POSITION_INVALID"}}
  return{ok:false,check,reason:"UNKNOWN_VALIDATOR"};
 }catch(err){return{ok:false,check,reason:err instanceof Error?err.message:String(err)}}
}
