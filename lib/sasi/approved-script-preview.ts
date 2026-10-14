import type {SeriesShot} from './series-plan';
export type ScriptPreviewFrame={episode:number|null;title:string;content:string};
export type ApprovedScriptPreview={kind:'approved-script-preview';requestedEpisodes:number;scriptedEpisodes:number[];frames:ScriptPreviewFrame[];script:string};
const digit:Record<string,number>={'零':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
function episodeNumber(value:string){if(/^\d+$/.test(value))return Number(value);const pieces=value.split('十');return pieces.length===2?(pieces[0]?digit[pieces[0]]:1)*10+(pieces[1]?digit[pieces[1]]:0):digit[value];}
/** Deterministic layout of approved material, never invented missing episodes. */
export function approvedScriptPreview(script:string,requestedEpisodes:number):ApprovedScriptPreview|null{
 if(typeof script!=='string'||script.length>32768||script.trim().length<8||!Number.isInteger(requestedEpisodes)||requestedEpisodes<1||requestedEpisodes>50)return null;
 const source=script.trim();const headers=[...source.matchAll(/^[ \t]*(?:#{1,6}[ \t]*)?(?:\*\*)?(?:第[ \t]*([\d一二三四五六七八九十]{1,3})[ \t]*集|集数[ \t]*[:：]?[ \t]*(\d{1,2})|episodes?[ \t]*[:#]?[ \t]*(\d{1,2}))[ \t]*[:：.、-]?[ \t]*([^\n]*)/gim)];
 const frames:ScriptPreviewFrame[]=[],episodes=new Set<number>();
 for(let i=0;i<headers.length;i++){
  const h=headers[i],episode=episodeNumber(h[1]||h[2]||h[3]);if(!Number.isInteger(episode)||episode<1||episode>requestedEpisodes)continue;
  const content=source.slice(h.index!+h[0].length,headers[i+1]?.index??source.length).trim();if(content.length<8)continue;
  if(episodes.has(episode))continue;episodes.add(episode);frames.push({episode,title:h[4].replace(/\*\*$/,'').trim().slice(0,120),content});
 }
 if(!frames.length){
  // A whole-story outline is a reference, not proof all requested episodes exist.
  const paragraphs=source.split(/\n\s*\n/).filter(p=>p.trim().length>=8);
  for(const content of (paragraphs.length?paragraphs:[source]).slice(0,12))frames.push({episode:null,title:'',content:content.trim().slice(0,2400)});
 }
 return {kind:'approved-script-preview',requestedEpisodes,scriptedEpisodes:[...episodes].sort((a,b)=>a-b),frames,script:source};
}
export function approvedEpisodeShots(script:string,episode:number,totalEpisodes:number,seconds:number):SeriesShot[]|null{
 if(!Number.isInteger(seconds)||seconds<4||seconds>120||seconds%4)return null;
 const frame=approvedScriptPreview(script,totalEpisodes)?.frames.find(frame=>frame.episode===episode);if(!frame)return null;
 const durations:number[]=[];for(let remaining=seconds;remaining>0;){const d=Math.min(12,remaining);durations.push(d);remaining-=d;}
 const lines=frame.content.split(/\n+/).map(line=>line.trim()).filter(line=>line.length>=4);
 // A short outline is insufficient for a full episode; never repeat or invent it.
 if(lines.length<durations.length)return null;
 const shots=durations.map((duration,i)=>({episode,duration,assetIds:[],prompt:`Episode ${episode}: ${frame.title}\n`+lines.slice(Math.floor(i*lines.length/durations.length),Math.floor((i+1)*lines.length/durations.length)).join('\n')}));
 return shots.some(shot=>shot.prompt.length<8||shot.prompt.length>3000)?null:shots;
}
