export type SubtitleBlock={prefix:string[];text:string|null};
const timing=/^(?:\d{2,}:)?\d{2}:\d{2}[.,]\d{3}\s+-->\s+(?:\d{2,}:)?\d{2}:\d{2}[.,]\d{3}(?:\s.*)?$/;
export function subtitleBlocks(text:string):SubtitleBlock[]{
 if(!text.trim()||text.length>300000)throw Error('SUBTITLE_INPUT_INVALID');
 let cues=0;
 const blocks=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim().split(/\n{2,}/).map(block=>{
  const lines=block.split('\n');
  if(/^(WEBVTT(?:\s|$)|NOTE(?:\s|$)|STYLE$|REGION$)/.test(lines[0]))return{prefix:lines,text:null};
  const at=timing.test(lines[0])?0:timing.test(lines[1]||'')?1:-1;
  if(at<0||!lines.slice(at+1).join('\n').trim())throw Error('SUBTITLE_FORMAT_INVALID');
  cues++;return{prefix:lines.slice(0,at+1),text:lines.slice(at+1).join('\n')};
 });
 if(!cues)throw Error('SUBTITLE_FORMAT_INVALID');
 return blocks;
}
export function rebuildSubtitles(blocks:SubtitleBlock[],translations:Map<number,string>){
 return blocks.map((block,i)=>{
  if(block.text===null)return block.prefix.join('\n');
  const text=translations.get(i)?.trim();
  if(!text||text.includes('\uFFFD')||text.split('\n').some(line=>timing.test(line)))throw Error('SUBTITLE_TRANSLATION_INCOMPLETE');
  const marks=(s:string)=>s.match(/<\/?[A-Za-z][^>]*>|\{\\[^}]+\}/g)||[];
  if(JSON.stringify(marks(text))!==JSON.stringify(marks(block.text)))throw Error('SUBTITLE_MARKUP_CHANGED');
  return [...block.prefix,text.replace(/\n{2,}/g,'\n')].join('\n');
 }).join('\n\n')+'\n';
}
