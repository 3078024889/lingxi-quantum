import * as Astronomy from "astronomy-engine";
import { createHash } from "node:crypto";
import { analyzeCircularDirections, normalizeBearing, type CircularDirectionAnalysis } from "@/lib/stellar-trace-math";

export type StellarTraceInput = { name:string; relationship?:string; birthDate:string; birthTime?:string; birthPlace?:string; lastContactAt:string; lastKnownPlace?:string; lastKnownLat:number|null; lastKnownLon:number|null; movementDirection?:string; context?:string };
type NineFieldPosition = { id:string; nameZh:string; longitude:number };
export type NineFieldSnapshot = { epoch:"birth"|"last-contact"|"current"; labelZh:string; observedAt:string; julianDay:number; fields:NineFieldPosition[] };
export type TraceEvidence = {
  id:"time-phase"|"inner-planet"|"outer-planet"|"contact-frame"|"reported-motion"; labelZh:string; bearing:number;
  sourceFieldIds:string[]; rawValues:number[]; projectionRuleId:string; projectionBasisZh:string;
  relativeRangeBand:"低迁移象"|"中迁移象"|"高迁移象";
  distanceTrace:{ rawSymbol:"low"|"medium"|"high"; normalizationRuleId:"symbolic-angular-amplitude-v1"; resultingRangeKm:null; calibrationStatus:"uncalibrated" };
};
export type TracePriority = {
  status:"converged"|"clustered"|"exploratory"; statusZh:string; primaryBearing:number; primaryDirectionZh:string;
  primarySector:[number,number]; secondaryBearing:number|null; secondaryDirectionZh:string|null;
  basisZh:string; conflictsZh:string[]; verificationZh:string[];
};
export type StellarTraceResult = {
  version:"lingxifield-stellar-trace-v3"; generatedAt:string; lastKnown:{lat:number|null;lon:number|null}; snapshots:NineFieldSnapshot[];
  evidence:TraceEvidence[]; direction:CircularDirectionAnalysis; priority:TracePriority;
  distance:{status:"uncalibrated";rangeKm:null;evidence:TraceEvidence["distanceTrace"][];explanationZh:string};
  candidateRegions:[]; candidateCenter:null; environmentZh:string[]; artIndexes:[number,number]; modelBoundaryZh:string; safetyBoundaryZh:string;
};

const bodies:Array<{id:string;nameZh:string;body?:Astronomy.Body}> = [
  {id:"sun",nameZh:"太阳"},{id:"mercury",nameZh:"水星",body:"Mercury" as Astronomy.Body},{id:"venus",nameZh:"金星",body:"Venus" as Astronomy.Body},
  {id:"earth",nameZh:"地球",body:"Earth" as Astronomy.Body},{id:"mars",nameZh:"火星",body:"Mars" as Astronomy.Body},{id:"jupiter",nameZh:"木星",body:"Jupiter" as Astronomy.Body},
  {id:"saturn",nameZh:"土星",body:"Saturn" as Astronomy.Body},{id:"uranus",nameZh:"天王星",body:"Uranus" as Astronomy.Body},{id:"neptune",nameZh:"海王星",body:"Neptune" as Astronomy.Body},
];
const round=(value:number,digits=3)=>Number(value.toFixed(digits));
const hashInt=(value:string)=>Number.parseInt(createHash("sha256").update(value).digest("hex").slice(0,12),16);
const movementBearings:Record<string,number>={"向北":0,"东北":45,"向东":90,"东南":135,"向南":180,"西南":225,"向西":270,"西北":315};
function directionName(bearing:number){return ["北","东北","东","东南","南","西南","西","西北"][Math.round(normalizeBearing(bearing)/45)%8]}
function longitude(body:Astronomy.Body|undefined,at:Date){if(!body)return normalizeBearing(Astronomy.SunPosition(at).elon);const v=Astronomy.HelioVector(body,at);return normalizeBearing(Math.atan2(v.y,v.x)*180/Math.PI)}
function snapshot(epoch:NineFieldSnapshot["epoch"],labelZh:string,at:Date):NineFieldSnapshot{return{epoch,labelZh,observedAt:at.toISOString(),julianDay:round(Astronomy.MakeTime(at).ut+2451545,5),fields:bodies.map(item=>({id:item.id,nameZh:item.nameZh,longitude:round(longitude(item.body,at))}))}}
function field(s:NineFieldSnapshot,id:string){return s.fields.find(item=>item.id===id)?.longitude??0}
function signedDelta(to:number,from:number){return((to-from+540)%360)-180}
function symbolicBand(amplitude:number):Pick<TraceEvidence,"relativeRangeBand"|"distanceTrace">{const rawSymbol=amplitude<45?"low":amplitude<110?"medium":"high";return{relativeRangeBand:rawSymbol==="low"?"低迁移象":rawSymbol==="medium"?"中迁移象":"高迁移象",distanceTrace:{rawSymbol,normalizationRuleId:"symbolic-angular-amplitude-v1",resultingRangeKm:null,calibrationStatus:"uncalibrated"}}}
function evidenceFrom(id:TraceEvidence["id"],labelZh:string,sourceFieldIds:string[],rawValues:number[],projectionBasisZh:string):TraceEvidence{
  const analysis=analyzeCircularDirections(rawValues);const bearing=analysis.diagnosticMean??0;const amplitude=rawValues.reduce((sum,value)=>sum+Math.abs(value),0)/Math.max(1,rawValues.length);
  return{id,labelZh,bearing:round(bearing,1),sourceFieldIds,rawValues:rawValues.map(value=>round(value)),projectionRuleId:`${id}-angular-projection-v2`,projectionBasisZh,...symbolicBand(amplitude)};
}
function priorityFrom(direction:CircularDirectionAnalysis,evidence:TraceEvidence[],input:StellarTraceInput):TracePriority{
  const strongestMode=direction.modes[0];
  const primary=direction.qualified
    ? direction.diagnosticMean!
    : strongestMode?.count>=2 ? strongestMode.center : direction.diagnosticMean??evidence[0]?.bearing??0;
  const status:TracePriority["status"]=direction.qualified?"converged":strongestMode?.count>=2?"clustered":"exploratory";
  const halfWidth=status==="converged"?30:status==="clustered"?45:67.5;
  const secondaryCandidates=direction.modes.map(mode=>mode.center).filter(value=>Math.abs(signedDelta(value,primary))>=45);
  const fallback=evidence.map(item=>item.bearing).sort((a,b)=>Math.abs(signedDelta(b,primary))-Math.abs(signedDelta(a,primary)))[0];
  const secondary=secondaryCandidates[0]??(fallback!=null&&Math.abs(signedDelta(fallback,primary))>=67.5?fallback:null);
  const hasRealityAnchor=input.movementDirection&&movementBearings[input.movementDirection]!=null;
  return{
    status,statusZh:status==="converged"?"多证收敛":status==="clustered"?"局部成簇":"探索性排序",
    primaryBearing:round(primary,1),primaryDirectionZh:directionName(primary),primarySector:[round(normalizeBearing(primary-halfWidth),1),round(normalizeBearing(primary+halfWidth),1)],
    secondaryBearing:secondary==null?null:round(secondary,1),secondaryDirectionZh:secondary==null?null:directionName(secondary),
    basisZh:hasRealityAnchor?`主序同时纳入已知移动方向“${input.movementDirection}”；现实证据优先于象征投影。`:`主序来自${direction.qualified?"全局圆周合度":strongestMode?.count>=2?"最大证据簇":"圆周诊断中心"}，只作为现实核验顺序，不作人员位置认定。`,
    conflictsZh:direction.qualified?[]:[`全局集中度 R=${round(direction.resultantLength)}，各证尚未完全同向。`,secondary==null?"未形成稳定次簇；主方位须以现实记录复核。":`另有${directionName(secondary)}向证据，与主簇并存。`],
    verificationZh:[`从“${input.lastKnownPlace||"最后可证地点"}”开始核验，不从推演方位替代事实起点。`,hasRealityAnchor?`先核对“${input.movementDirection}”沿线的交通、联系人与可依法调取的记录。`:`优先核对${directionName(primary)}向已有联系人、交通与公开可核验记录。`,`若现实记录与${directionName(primary)}向不符，立即以现实记录为准，并保留${secondary==null?"其他方向":"次序方向"}继续排查。`],
  };
}

export function calculateStellarTrace(input:StellarTraceInput,now=new Date()):StellarTraceResult{
  const birthMoment=new Date(`${input.birthDate}T${input.birthTime||"12:00"}:00+08:00`);
  const contactSource=/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(input.lastContactAt)
    ? `${input.lastContactAt.replace(" ","T")}:00+08:00`
    : input.lastContactAt;
  const lastContact=new Date(contactSource);
  if(!Number.isFinite(birthMoment.getTime())||!Number.isFinite(lastContact.getTime())||lastContact>now)throw new Error("invalid trace time");
  const snapshots=[snapshot("birth","生时九域",birthMoment),snapshot("last-contact","最后有效联系九域",lastContact),snapshot("current","当前九域",now)];const[birth,contact,current]=snapshots;
  const evidence:TraceEvidence[]=[
    evidenceFrom("time-phase","时间相位投影",["sun","earth"],[signedDelta(field(contact,"sun"),field(birth,"sun")),signedDelta(field(current,"earth"),field(contact,"earth"))],"比较生时、最后联系与当前纪元的日地角变化；它是象征方向投影，不是地理观测。"),
    evidenceFrom("inner-planet","内行星变化投影",["mercury","venus","mars"],["mercury","venus","mars"].map(id=>signedDelta(field(current,id),field(contact,id))),"读取水星、金星、火星自最后有效联系至今的角位移并作圆周合成。"),
    evidenceFrom("outer-planet","外行星变化投影",["jupiter","saturn","uranus","neptune"],["jupiter","saturn","uranus","neptune"].map(id=>signedDelta(field(current,id),field(contact,id))),"读取木星至海王星的慢周期角位移；只提供独立时间尺度，不代表现实位置。"),
    evidenceFrom("contact-frame","联系时刻框架投影",["sun","mars","saturn"],[field(contact,"sun"),field(contact,"mars"),field(contact,"saturn")],"以最后有效联系时刻的太阳、火星、土星经度组成审计用方向框架。"),
  ];
  const reportedMotion=movementBearings[input.movementDirection||""];
  if(reportedMotion!=null)evidence.push(evidenceFrom("reported-motion","现实移动方向锚点",[],[reportedMotion],`用户提供的最后已知移动方向“${input.movementDirection}”，属于现实记录，不是天文投影。`));
  const base=analyzeCircularDirections(evidence.map(item=>item.bearing));const seed=hashInt(`${input.name}|${birthMoment.toISOString()}|${lastContact.toISOString()}`);
  const direction:CircularDirectionAnalysis={...base,diagnosticMean:base.diagnosticMean===null?null:round(base.diagnosticMean,1),resultantLength:round(base.resultantLength),circularDispersion:round(base.circularDispersion),circularStdDegrees:base.circularStdDegrees===null?null:round(base.circularStdDegrees,1),sector:base.sector?[round(base.sector[0],1),round(base.sector[1],1)]:null,modes:base.modes.map(mode=>({...mode,center:round(mode.center,1),mass:round(mode.mass),resultantLength:round(mode.resultantLength),bearings:mode.bearings.map(value=>round(value,1))}))};
  const priority=priorityFrom(direction,evidence,input);
  return{version:"lingxifield-stellar-trace-v3",generatedAt:now.toISOString(),lastKnown:{lat:input.lastKnownLat==null?null:round(input.lastKnownLat,4),lon:input.lastKnownLon==null?null:round(input.lastKnownLon,4)},snapshots,evidence,direction,priority,
    distance:{status:"uncalibrated",rangeKm:null,evidence:evidence.map(item=>item.distanceTrace),explanationZh:"四层投影目前只能形成相对迁移象，尚无经过史料校核与盲测标定的公里映射规则。因此本版不输出公里距离。"},candidateRegions:[],candidateCenter:null,
    environmentZh:input.context?["现实线索已记录，尚未由模型自动解释"]:["尚无可核验的现实环境线索"],artIndexes:[seed%60,(seed*17+23)%60],
    modelBoundaryZh:"九域为可复算的天文事实层；四层为透明展示的象征投影层。二者之间尚未建立经过盲测验证的现实人员位置因果关系。",
    safetyBoundaryZh:"本结果不读取设备、通信、GPS 或实时行踪，不提供人员现实位置事实认定，也不得用于跟踪、骚扰或监控。涉及人员安全时，请立即使用警方、通信、交通与紧急救援等可核验渠道。"};
}
