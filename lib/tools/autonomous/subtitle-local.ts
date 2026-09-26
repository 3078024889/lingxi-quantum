
type TranslatorInstance={translate:(text:string)=>Promise<string>;destroy?:()=>void};
function splitCueText(block:string){
 const lines=block.split(/\r?\n/);let i=0;
 if(/^\d+$/.test(lines[0]?.trim()||""))i=1;
 if(lines[i]?.includes("-->"))i++;
 return{prefix:lines.slice(0,i),text:lines.slice(i).join("\n")};
}
async function getTranslator(sourceLanguage:string,targetLanguage:string):Promise<TranslatorInstance>{
 const T=(globalThis as unknown as {Translator?:{availability?:(o:any)=>Promise<string>;create:(o:any)=>Promise<TranslatorInstance>}}).Translator;
 if(!T?.create)throw new Error("LOCAL_TRANSLATOR_UNAVAILABLE");
 const opts={sourceLanguage,targetLanguage};
 if(T.availability){const a=await T.availability(opts);if(a==="unavailable")throw new Error("LOCAL_LANGUAGE_PAIR_UNAVAILABLE")}
 return await T.create(opts);
}
export async function translateSubtitleLocal(text:string,targetLanguage:string,sourceLanguage="auto"){
 const blocks=text.replace(/\r/g,"").split(/\n{2,}/).filter(Boolean);
 const translator=await getTranslator(sourceLanguage,targetLanguage);
 try{
  const out:string[]=[];
  for(const block of blocks){
   const cue=splitCueText(block);
   if(!cue.text.trim()){out.push(block);continue}
   const translated=await translator.translate(cue.text);
   out.push([...cue.prefix,translated].join("\n"));
  }
  return out.join("\n\n");
 }finally{translator.destroy?.()}
}
