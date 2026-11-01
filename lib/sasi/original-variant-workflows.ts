/**
 * LINGXIFIELD original, deterministic storyboard variant model.
 * No Hypit code, no model calls and no assumption of commercial clearance.
 * A storyboard is NOT a rendered video. Actual speech alignment requires TTS evidence.
 */
export type StoryboardScene={id:string;seconds:number;voice:string;visual:string};
export type WordCue={token:string;approxStartSeconds:number};
export type VariantScene=StoryboardScene&{startSeconds:number;wordCues:WordCue[]};
export type StoryboardVariant={id:string;locale:string;hook:string;scenes:VariantScene[];totalSeconds:number};
export type VariantInput={scenes:StoryboardScene[];hooks:string[];product:string;cta:string;locale:string;count:number};

function clean(s:unknown,max:number,name:string):string{
 if(typeof s!=="string"||!s.trim()||s.length>max)throw new Error("INVALID_"+name);
 return s.trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,"");
}
function limitedNumber(x:unknown,min:number,max:number,name:string):number{
 if(!Number.isInteger(x)||Number(x)<min||Number(x)>max)throw new Error("INVALID_"+name);
 return Number(x);
}
/** A deliberately estimated word-position map, not real forced alignment. */
export function estimatedWordCues(voice:string,seconds:number):WordCue[]{
 const matches=voice.match(/\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|[\p{L}\p{M}\p{N}]+/gu)||[];
 const terms=matches.slice(0,500);
 return terms.map((token,i)=>({token,approxStartSeconds:Number((seconds*i/Math.max(terms.length,1)).toFixed(3))}));
}
export function parseStoryboardLines(text:string):StoryboardScene[]{
 if(typeof text!=="string"||text.length>12000)throw new Error("STORYBOARD_TOO_LARGE");
 const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 if(!lines.length||lines.length>24)throw new Error("STORYBOARD_REQUIRES_1_TO_24_SCENES");
 const scenes=lines.map((line,i)=>{
  const parts=line.split("|");
  if(parts.length<3)throw new Error("SCENE_FORMAT_SECONDS_VOICE_VISUAL");
  const seconds=Number(parts[0].trim());
  return {id:"shot-"+String(i+1).padStart(2,"0"),seconds:limitedNumber(seconds,2,30,"SCENE_DURATION"),voice:clean(parts[1],450,"VOICE"),visual:clean(parts.slice(2).join("|"),500,"VISUAL")};
 });
 if(scenes.reduce((sum,s)=>sum+s.seconds,0)>300)throw new Error("STORYBOARD_MAX_300_SECONDS");
 return scenes;
}
export function compileStoryboardVariants(input:VariantInput):StoryboardVariant[]{
 const count=limitedNumber(input.count,1,100,"VARIANT_COUNT");
 const product=clean(input.product,160,"PRODUCT"),cta=clean(input.cta,160,"CTA");
 const locale=clean(input.locale,12,"LOCALE");
 if(!/^(zh|en|ja|ko|fr|de|es|pt|ar)$/.test(locale))throw new Error("UNSUPPORTED_LOCALE");
 if(!Array.isArray(input.hooks)||input.hooks.length<1||input.hooks.length>25)throw new Error("INVALID_HOOKS");
 const hooks=input.hooks.map(x=>clean(x,180,"HOOK"));
 if(!Array.isArray(input.scenes)||input.scenes.length<1||input.scenes.length>24)throw new Error("INVALID_SCENES");
 const scenes=input.scenes.map((scene,i)=>{
  if(!scene||typeof scene!=="object")throw new Error("INVALID_SCENE");
  return {id:"shot-"+String(i+1).padStart(2,"0"),seconds:limitedNumber(scene.seconds,2,30,"SCENE_DURATION"),voice:clean(scene.voice,450,"VOICE"),visual:clean(scene.visual,500,"VISUAL")};
 });
 if(scenes.reduce((sum,s)=>sum+s.seconds,0)>300)throw new Error("STORYBOARD_MAX_300_SECONDS");
 const apply=(text:string,hook:string)=>text.replace(/\{\{\s*(hook|product|cta|locale)\s*\}\}/gi,(_,key:string)=>({hook,product,cta,locale}[key.toLowerCase() as "hook"|"product"|"cta"|"locale"]));
 return Array.from({length:count},(_,i)=>{
  const hook=hooks[i%hooks.length],baseSeconds=scenes.reduce((sum,x)=>sum+x.seconds,0);
  let elapsed=0;
  const compiled=scenes.map(x=>{
   const voice=apply(x.voice,hook),visual=apply(x.visual,hook);
   const result:VariantScene={...x,voice,visual,startSeconds:elapsed,wordCues:estimatedWordCues(voice,x.seconds)};
   elapsed+=x.seconds;return result;
  });
  return {id:"variant-"+String(i+1).padStart(3,"0"),locale,hook,scenes:compiled,totalSeconds:baseSeconds};
 });
}
