/** Shared, deterministic bound for chat context passed to external model providers.
 * It preserves user/assistant roles, favors recent turns, and never allows
 * browser-provided system/developer messages to enter the model conversation.
 */
export type DialogueMessage={role:"user"|"assistant";content:string};
export const SASI_HISTORY_MAX_MESSAGES=40;
export const SASI_HISTORY_MAX_CHARACTERS=48000;

export function boundedDialogueHistory(input:unknown,maxChars=SASI_HISTORY_MAX_CHARACTERS):DialogueMessage[]{
 if(!Array.isArray(input))return [];
 const limit=Number.isFinite(maxChars)?Math.max(0,Math.min(SASI_HISTORY_MAX_CHARACTERS,Math.floor(maxChars))):SASI_HISTORY_MAX_CHARACTERS;
 const candidates=input.slice(-SASI_HISTORY_MAX_MESSAGES).filter((item):item is DialogueMessage=>{
  if(!item||typeof item!=="object")return false;
  const row=item as Record<string,unknown>;
  return (row.role==="user"||row.role==="assistant")&&typeof row.content==="string"&&row.content.trim().length>0;
 });
 const result:DialogueMessage[]=[];let left=limit;
 for(let i=candidates.length-1;i>=0&&left>0;i--){
  const entry=candidates[i],content=entry.content.slice(0,Math.min(32768,left));
  if(!content.trim())continue;
  result.unshift({role:entry.role,content});left-=content.length;
 }
 // A clipped window should begin with a user turn, not an isolated assistant claim.
 while(result.length&&result[0].role==="assistant")result.shift();
 return result;
}
