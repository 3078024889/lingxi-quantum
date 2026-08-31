import {PALACE_BEARING,directionLabel,sector} from "./compass";
import {sourceRule} from "./sources";
import type {AncientProviders,AncientTraceResult,QimenChart,RuleTrace,StellarAncientInput} from "./types";
function tr(id:"QM-XR-NM-001"|"QM-FQ-XR-002"|"MOD-PALACE-DEG-001",inputs:RuleTrace["inputs"],outputZh:string):RuleTrace{const r=sourceRule(id);return{ruleId:r.id,system:"qimen",sourceTitle:r.sourceTitle,sourceChapter:r.sourceChapter,sourceUrl:r.sourceUrl,sourceNoteZh:r.sourceNoteZh,confidence:r.confidence,inputs,outputZh}}
export async function runQimen(input:StellarAncientInput,provider?:AncientProviders["qimen"]):Promise<AncientTraceResult>{
 if(!provider)return{system:"qimen",status:"unsupported",coverage:0,direction:null,distance:null,motion:null,environmentZh:[],evidence:[],warningsZh:["仓库尚未接入完整奇门起局器；拒绝用姓名哈希、行星角度或用户已知方向伪造落宫。"]};
 const chart:QimenChart|null=await provider(input);if(!chart)return{system:"qimen",status:"missing-input",coverage:0,direction:null,distance:null,motion:null,environmentZh:[],evidence:[],warningsZh:["奇门起局器未形成可审计局盘。"]};
 const b=PALACE_BEARING[chart.lifePalace];if(b==null)return{system:"qimen",status:"partial",coverage:.45,direction:null,distance:null,motion:null,environmentZh:[],evidence:[tr("QM-XR-NM-001",{lifeStem:chart.lifeStem,lifeBranch:chart.lifeBranch,lifePalace:chart.lifePalace},"年命落中宫；中宫不强行归一为地平方位。")],warningsZh:["中宫不得强行映射为任意八方。"]};
 const star=chart.starByPalace?.[chart.lifePalace]??null;const distance=star==="天蓬"?{normalizedBand:"very_far" as const,ancientUnit:"千里外（原典层级）",calibratedKm:null}:star==="天芮"?{normalizedBand:"near" as const,ancientUnit:"千里内（原典层级）",calibratedKm:null}:{normalizedBand:"unknown" as const,calibratedKm:null};
 return{system:"qimen",status:"ok",coverage:.78,direction:{centerDeg:b,sector:sector(b,22.5),labelZh:directionLabel(b)},distance,motion:{state:"unknown"},environmentZh:[],evidence:[tr("QM-XR-NM-001",{lifeStem:chart.lifeStem,lifeBranch:chart.lifeBranch,lifePalace:chart.lifePalace,star,dun:chart.dun??null,ju:chart.ju??null},`年命落${chart.lifePalace}宫，原典层取得${directionLabel(b)}方位；远近仅保留原典等级。`),tr("MOD-PALACE-DEG-001",{palace:chart.lifePalace,normalizedBearing:b},`${chart.lifePalace}宫在现代归一层记为${b}°。`)],warningsZh:["未完成历史盲测校准前，不把古法远近层换算为公里。"]};
}


