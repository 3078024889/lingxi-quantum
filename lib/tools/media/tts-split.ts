/** The upstream /audio/speech API accepts at most 4096 input characters.
 * Leave a safety margin; never truncate a long sentence or paragraph.
 */
export const TTS_SAFE_INPUT_CHARACTERS=3500;
export function splitSpeechText(input:string,maxChars=TTS_SAFE_INPUT_CHARACTERS):string[]{
 if(typeof input!=="string"||!input.trim()||input.length>250000||
    !Number.isSafeInteger(maxChars)||maxChars<200||maxChars>4000)throw Error("TTS_TEXT_INVALID");
 let remaining=input.replace(/\r\n?/g,"\n").trim();
 const parts:string[]=[];
 while(remaining.length>maxChars){
  const head=remaining.slice(0,maxChars);
  const limit=Math.floor(maxChars*.55);
  let cut=maxChars;
  for(const sep of ["\n","。","！","？",". ","! ","? ","; ",", "," "]){
   const i=head.lastIndexOf(sep);
   if(i>=limit&&i+sep.length<=maxChars){
    cut=Math.min(cut,Math.max(i+sep.length,limit));
   }
  }
  if(cut===maxChars&&/[\uD800-\uDBFF]/.test(remaining[cut-1])&&/[\uDC00-\uDFFF]/.test(remaining[cut]||""))cut--;
  if(cut<1)throw Error("TTS_SPLIT_INVALID");
  const part=remaining.slice(0,cut).trim();
  if(!part)throw Error("TTS_SPLIT_INVALID");
  parts.push(part);
  remaining=remaining.slice(cut).trimStart();
  if(parts.length>1000)throw Error("TTS_SPLIT_TOO_MANY_PARTS");
 }
 if(remaining)parts.push(remaining);
 if(!parts.length||parts.some(p=>p.length>maxChars))throw Error("TTS_SPLIT_INVALID");
 return parts;
}
