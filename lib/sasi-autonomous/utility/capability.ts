import type { Capability } from "../types";
import { uniqueTokens } from "../knowledge/tokenize";

function sentences(text:string){return text.replace(/\r/g,"").split(/(?<=[。！？!?；;\.])\s*|\n+/u).map((x)=>x.trim()).filter((x)=>x.length>=4);}
function organize(text:string){
 const rows=sentences(text);const seen=new Set<string>();const unique=rows.filter((row)=>{const key=row.replace(/\s+/g,"").slice(0,100);if(seen.has(key))return false;seen.add(key);return true;});
 const freq=new Map<string,number>();for(const token of uniqueTokens(text))freq.set(token,(freq.get(token)??0)+1);
 const keywords=[...freq.entries()].sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length).slice(0,12).map(([token])=>token);
 return{outline:unique.slice(0,20).map((row,index)=>`${index+1}. ${row}`).join("\n"),keywords,paragraphs:unique.length};
}

export const utilityOrganizeCapability:Capability={
 id:"utility.text.organize",canRun(task){return task.kind==="utility"&&task.action==="organize";},async run(task){const input=(task.input??{}) as Record<string,unknown>;const text=String(input.text??"").trim();if(!text)return{ok:false,taskId:task.id,engine:"autonomous",capability:"utility.text.organize",artifacts:[],error:{code:"EMPTY_TEXT",message:"请先输入需要整理的内容。"}};const result=organize(text);return{ok:true,taskId:task.id,engine:"autonomous",capability:"utility.text.organize",artifacts:[{type:"text",name:"outline.txt",value:result.outline},{type:"json",name:"analysis.json",value:result}]};}
};

export const utilityStatsCapability:Capability={
 id:"utility.text.stats",canRun(task){return task.kind==="utility"&&task.action==="stats";},async run(task){const text=String(((task.input??{}) as Record<string,unknown>).text??"");const value={characters:[...text].length,charactersNoSpaces:[...text.replace(/\s/g,"")].length,lines:text?text.split(/\r?\n/).length:0,words:(text.match(/[A-Za-z0-9_]+/g)??[]).length,utf8Bytes:new TextEncoder().encode(text).length};return{ok:true,taskId:task.id,engine:"autonomous",capability:"utility.text.stats",artifacts:[{type:"json",name:"stats.json",value}]};}
};
