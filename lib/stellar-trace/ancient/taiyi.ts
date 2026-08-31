import {PALACE_BEARING,directionLabel,sector} from "./compass";
import {sourceRule} from "./sources";
import type {AncientProviders,AncientTraceResult,RuleTrace,StellarAncientInput,TaiyiChart} from "./types";
function tr(inputs:RuleTrace["inputs"],outputZh:string):RuleTrace{const r=sourceRule("TY-XR-001");return{ruleId:r.id,system:"taiyi",sourceTitle:r.sourceTitle,sourceChapter:r.sourceChapter,sourceUrl:r.sourceUrl,sourceNoteZh:r.sourceNoteZh,confidence:r.confidence,inputs,outputZh}}
export async function runTaiyi(input:StellarAncientInput,provider?:AncientProviders["taiyi"]):Promise<AncientTraceResult>{
 if(!provider)return{system:"taiyi",status:"unsupported",coverage:0,direction:null,distance:null,motion:null,environmentZh:[],evidence:[],warningsZh:["仓库尚未接入完整太乙局数/主客/文昌始击计算器；拒绝以九域行星角度冒充太乙方位。"]};
 const c:TaiyiChart|null=await provider(input);if(!c)return{system:"taiyi",status:"missing-input",coverage:0,direction:null,distance:null,motion:null,environmentZh:[],evidence:[],warningsZh:["太乙计算器未返回可审计局。"]};
 const b=PALACE_BEARING[c.directionPalace];const dir=b==null?null:{centerDeg:b,sector:sector(b,22.5),labelZh:directionLabel(b)};const band=c.travelSignal==="near"?"near":c.travelSignal==="medium"?"medium":c.travelSignal==="far"?"far":c.innerOuter==="inner"?"near":c.innerOuter==="outer"?"far":"unknown";
 return{system:"taiyi",status:dir?"ok":"partial",coverage:dir ? .78 : .45,direction:dir,distance:{normalizedBand:band,ancientUnit:c.innerOuter==="inner"?"内":c.innerOuter==="outer"?"外":undefined,calibratedKm:null},motion:{state:"unknown"},environmentZh:[],evidence:[tr({directionPalace:c.directionPalace,innerOuter:c.innerOuter,travelSignal:c.travelSignal??null},dir?`太乙层取得${dir.labelZh}方位，并保留“${c.innerOuter}”远近等级。`:"太乙落中位，只保留结构与远近，不造方位。")],warningsZh:["太乙内/外/近/远未校准前不换算公里。"]};
}
