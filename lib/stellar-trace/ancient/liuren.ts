import {BRANCH_BEARING,directionLabel,sector} from "./compass";
import {sourceRule} from "./sources";
import type {AncientProviders,AncientTraceResult,LiurenChart,RuleTrace,StellarAncientInput} from "./types";
function tr(id:"LR-ZW-001"|"LR-ZZ-002"|"MOD-BRANCH-DEG-001",inputs:RuleTrace["inputs"],outputZh:string):RuleTrace{const r=sourceRule(id);return{ruleId:r.id,system:"liuren",sourceTitle:r.sourceTitle,sourceChapter:r.sourceChapter,sourceUrl:r.sourceUrl,sourceNoteZh:r.sourceNoteZh,confidence:r.confidence,inputs,outputZh}}
export async function runLiuren(input:StellarAncientInput,provider?:AncientProviders["liuren"]):Promise<AncientTraceResult>{
 if(!provider)return{system:"liuren",status:"unsupported",coverage:0,direction:null,distance:null,motion:null,environmentZh:[],evidence:[],warningsZh:["仓库尚未接入完整大六壬起课器；拒绝用出生日期哈希或天文角度代替月将、天地盘、四课三传与玄武位置。"]};
 const c:LiurenChart|null=await provider(input);if(!c)return{system:"liuren",status:"missing-input",coverage:0,direction:null,distance:null,motion:null,environmentZh:[],evidence:[],warningsZh:["六壬起课器未返回可审计课体。"]};
 const b=BRANCH_BEARING[c.xuanwuBranch];const band=c.travelSignal==="near"?"near":c.travelSignal==="far"?"far":"unknown";
 const evidence=[tr("LR-ZW-001",{xuanwuBranch:c.xuanwuBranch,transmissions:c.transmissions?.join("/")??null,travelSignal:c.travelSignal??null},`玄武临${c.xuanwuBranch}，先保留其方位与远近层级，不借现实方向反推。`),tr("MOD-BRANCH-DEG-001",{branch:c.xuanwuBranch,normalizedBearing:b},`${c.xuanwuBranch}支在现代归一层记为${b}°。`)];if(c.environmentTags?.length)evidence.push(tr("LR-ZZ-002",{environmentTags:c.environmentTags.join("/")},`环境象：${c.environmentTags.join("、")}。`));
 return{system:"liuren",status:"ok",coverage:.82,direction:{centerDeg:b,sector:sector(b,15),labelZh:directionLabel(b)},distance:{normalizedBand:band,calibratedKm:null},motion:{state:"unknown"},environmentZh:c.environmentTags??[],evidence,warningsZh:["环境象不是现实地址；古法里数/近远层未校准前不转换公里。"]};
}


