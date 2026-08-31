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
  sourceKind:"astronomical-symbolic"|"reported-reality"; weight:number;
};
export type TracePriority = {
  status:"converged"|"clustered"|"exploratory"; statusZh:string; primaryBearing:number; primaryDirectionZh:string;
  primarySector:[number,number]; secondaryBearing:number|null; secondaryDirectionZh:string|null;
  basisZh:string; conflictsZh:string[]; verificationZh:string[];
};
export type StellarTraceResult = {
  version:"lingxifield-stellar-trace-v3"; generatedAt:string; lastKnown:{lat:number|null;lon:number|null}; snapshots:NineFieldSnapshot[];
  evidence:TraceEvidence[]; direction:CircularDirectionAnalysis; priority:TracePriority;
  distance:{status:"reported"|"reachability"|"uncalibrated";rangeKm:[number,number]|null;sourceZh:string;evidence:TraceEvidence["distanceTrace"][];explanationZh:string};
  candidateRegions:Array<{bearingRange:[number,number];distanceRangeKm:[number,number];areaKm2:number;basis:"reported-distance"|"reachability-envelope"}>; candidateCenter:{lat:number;lon:number;radiusKm:number}|null; environmentZh:string[]; artIndexes:[number,number]; modelBoundaryZh:string; safetyBoundaryZh:string;
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
function evidenceFrom(id:TraceEvidence["id"],labelZh:string,sourceFieldIds:string[],rawValues:number[],projectionBasisZh:string,sourceKind:TraceEvidence["sourceKind"]="astronomical-symbolic",weight=1):TraceEvidence{
  const analysis=analyzeCircularDirections(rawValues);const bearing=analysis.diagnosticMean??0;const amplitude=rawValues.reduce((sum,value)=>sum+Math.abs(value),0)/Math.max(1,rawValues.length);
  return{id,labelZh,bearing:round(bearing,1),sourceFieldIds,rawValues:rawValues.map(value=>round(value)),projectionRuleId:`${id}-angular-projection-v3`,projectionBasisZh,sourceKind,weight,...symbolicBand(amplitude)};
}
function priorityFrom(direction:CircularDirectionAnalysis,evidence:TraceEvidence[],input:StellarTraceInput):TracePriority{
  const strongestMode=direction.modes[0];const reality=evidence.find(item=>item.sourceKind==="reported-reality");const symbolic=evidence.filter(item=>item.sourceKind==="astronomical-symbolic");const aligned=reality?symbolic.filter(item=>Math.abs(signedDelta(item.bearing,reality.bearing))<=45).length:0;
  const primary=reality?.bearing??(direction.qualified
    ? direction.diagnosticMean!
    : strongestMode?.count>=2 ? strongestMode.center : direction.diagnosticMean??evidence[0]?.bearing??0);
  const status:TracePriority["status"]=reality?(aligned>=2?"converged":aligned>=1?"clustered":"exploratory"):direction.qualified?"converged":strongestMode?.count>=2?"clustered":"exploratory";
  const halfWidth=reality?(aligned>=2?22.5:aligned>=1?35:45):status==="converged"?30:status==="clustered"?45:67.5;
  const secondaryCandidates=direction.modes.map(mode=>mode.center).filter(value=>Math.abs(signedDelta(value,primary))>=45);
  const fallback=evidence.map(item=>item.bearing).sort((a,b)=>Math.abs(signedDelta(b,primary))-Math.abs(signedDelta(a,primary)))[0];
  const secondary=secondaryCandidates[0]??(fallback!=null&&Math.abs(signedDelta(fallback,primary))>=67.5?fallback:null);
  const hasRealityAnchor=!!reality;
  return{
    status,statusZh:hasRealityAnchor?(aligned>=2?"现实锚点与多证同向":aligned>=1?"现实锚点与局部证据同向":"现实锚点优先"):status==="converged"?"多证收敛":status==="clustered"?"局部成簇":"探索性排序",
    primaryBearing:round(primary,1),primaryDirectionZh:directionName(primary),primarySector:[round(normalizeBearing(primary-halfWidth),1),round(normalizeBearing(primary+halfWidth),1)],
    secondaryBearing:secondary==null?null:round(secondary,1),secondaryDirectionZh:secondary==null?null:directionName(secondary),
    basisZh:hasRealityAnchor?`主序由已知移动方向“${input.movementDirection}”直接建立；${aligned} 层独立时间投影落在其 ±45° 内。现实锚点不再与象征角度等权平均。`:`主序来自${direction.qualified?"全局圆周合度":strongestMode?.count>=2?"最大证据簇":"圆周诊断中心"}，只作为现实核验顺序，不作人员位置认定。`,
    conflictsZh:direction.qualified?[]:[`全局集中度 R=${round(direction.resultantLength)}，各证尚未完全同向。`,secondary==null?"未形成稳定次簇；主方位须以现实记录复核。":`另有${directionName(secondary)}向证据，与主簇并存。`],
    verificationZh:[`起点已定为“${input.lastKnownPlace||"最后可证地点"}”；先查该点向${directionName(primary)}的近域出口、道路与公共交通节点。`,hasRealityAnchor?`现实锚点为“${input.movementDirection}”：优先核对该方向沿线联系人、交通与依法可调取的时序记录。`:`第二层核验${directionName(primary)}向已有联系人、交通与公开可核验记录，不以天文角度替代事实。`,`若现实记录与${directionName(primary)}向相逆，立即舍弃该方向判断，以现实记录为准，并转查${secondary==null?"相邻扇区":directionName(secondary)+"向次序"}。`],
  };
}

function distanceClue(context:string|undefined){
  if(!context)return null;const unit=(value:number,label:string)=>label==="米"||label.toLowerCase()==="m"?value/1000:label==="里"?value*.5:value;
  const range=context.match(/(\d+(?:\.\d+)?)\s*(?:—|-|至|到)\s*(\d+(?:\.\d+)?)\s*(公里|千米|km|里|米|m)/i);if(range){const a=unit(Number(range[1]),range[3]),b=unit(Number(range[2]),range[3]);return[Math.min(a,b),Math.max(a,b)] as [number,number];}
  const single=context.match(/(?:约|大约|距|距离)?\s*(\d+(?:\.\d+)?)\s*(公里|千米|km|里|米|m)/i);if(single){const value=unit(Number(single[1]),single[2]);return[round(value*.8,1),round(value*1.2,1)] as [number,number];}return null;
}
function reachabilityBand(context:string|undefined,hours:number):{range:[number,number];mode:string}|null{
  const text=context??"";const profiles=[[/步行|徒步|走路/u,5,"步行"],[/自行车|骑行|电动车/u,18,"骑行"],[/高铁|动车|火车|铁路/u,220,"铁路"],[/飞机|航班|机场/u,750,"航空"],[/驾车|开车|出租车|网约车|公交|乘车|汽车/u,70,"道路交通"]] as const;const profile=profiles.find(item=>item[0].test(text));if(!profile)return null;const effective=Math.max(.25,Math.min(hours,12));return{range:[0,round(Math.min(profile[1]*effective,profile[1]*12),1)],mode:profile[2]};
}
function destination(lat:number,lon:number,bearing:number,distanceKm:number){const radius=6371;const delta=distanceKm/radius;const theta=bearing*Math.PI/180;const phi1=lat*Math.PI/180;const lambda1=lon*Math.PI/180;const phi2=Math.asin(Math.sin(phi1)*Math.cos(delta)+Math.cos(phi1)*Math.sin(delta)*Math.cos(theta));const lambda2=lambda1+Math.atan2(Math.sin(theta)*Math.sin(delta)*Math.cos(phi1),Math.cos(delta)-Math.sin(phi1)*Math.sin(phi2));return{lat:round(phi2*180/Math.PI,5),lon:round((((lambda2*180/Math.PI)+540)%360)-180,5)};}

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
  if(reportedMotion!=null)evidence.push(evidenceFrom("reported-motion","现实移动方向锚点",[],[reportedMotion],`用户提供的最后已知移动方向“${input.movementDirection}”，属于现实记录，不是天文投影。`,"reported-reality",4));
  const base=analyzeCircularDirections(evidence.map(item=>item.bearing));const seed=hashInt(`${input.name}|${birthMoment.toISOString()}|${lastContact.toISOString()}`);
  const direction:CircularDirectionAnalysis={...base,diagnosticMean:base.diagnosticMean===null?null:round(base.diagnosticMean,1),resultantLength:round(base.resultantLength),circularDispersion:round(base.circularDispersion),circularStdDegrees:base.circularStdDegrees===null?null:round(base.circularStdDegrees,1),sector:base.sector?[round(base.sector[0],1),round(base.sector[1],1)]:null,modes:base.modes.map(mode=>({...mode,center:round(mode.center,1),mass:round(mode.mass),resultantLength:round(mode.resultantLength),bearings:mode.bearings.map(value=>round(value,1))}))};
  const priority=priorityFrom(direction,evidence,input);
  const hours=Math.max(0,(now.getTime()-lastContact.getTime())/3600000);const reportedDistance=distanceClue(input.context);const reachable=reportedDistance?null:reachabilityBand(input.context,hours);const range=reportedDistance??reachable?.range??null;const distanceStatus=reportedDistance?"reported":reachable?"reachability":"uncalibrated";const halfWidth=((priority.primarySector[1]-priority.primarySector[0]+360)%360)/2;const midpoint=range?(range[0]+range[1])/2:0;const center=range&&input.lastKnownLat!=null&&input.lastKnownLon!=null?destination(input.lastKnownLat,input.lastKnownLon,priority.primaryBearing,midpoint):null;const radius=range?round(Math.max((range[1]-range[0])/2,midpoint*Math.sin(halfWidth*Math.PI/180)),1):0;const candidateCenter=center?{...center,radiusKm:radius}:null;const area=range?round(((halfWidth*2)/360)*Math.PI*(range[1]**2-range[0]**2),1):0;const candidateRegions=range?[{bearingRange:priority.primarySector,distanceRangeKm:range,areaKm2:area,basis:reportedDistance?"reported-distance" as const:"reachability-envelope" as const}]:[];
  return{version:"lingxifield-stellar-trace-v3",generatedAt:now.toISOString(),lastKnown:{lat:input.lastKnownLat==null?null:round(input.lastKnownLat,4),lon:input.lastKnownLon==null?null:round(input.lastKnownLon,4)},snapshots,evidence,direction,priority,
    distance:{status:distanceStatus,rangeKm:range,sourceZh:reportedDistance?"最后一次有效信息中的明确距离":reachable?`${reachable.mode}与行迹中断后首个十二小时的可达上界`:"尚无现实距离或交通方式证据",evidence:evidence.map(item=>item.distanceTrace),explanationZh:reportedDistance?`已从最后一次有效信息中读取明确距离，并以原单位换算为 ${range![0]}—${range![1]} km 的现实核验带。` : reachable?`依据“${reachable.mode}”线索形成 0—${range![1]} km 的首轮可达核验带；这是交通可达边界，不是人员所在概率。`:`天文角位移不换算为地表里程；未提供明确距离或交通方式时，模型停止生成距离与坐标。`},candidateRegions,candidateCenter,
    environmentZh:input.context?["现实线索已记录，尚未由模型自动解释"]:["尚无可核验的现实环境线索"],artIndexes:[seed%60,(seed*17+23)%60],
    modelBoundaryZh:"九域历算可复算；四层合参用于排列现实核验次序。主核验方向是本次计算结论，现实位置仍须由交通、通信与现场记录复核。",
    safetyBoundaryZh:"本结果不读取设备、通信、GPS 或实时行踪，不提供人员现实位置事实认定，也不得用于跟踪、骚扰或监控。涉及人员安全时，请立即使用警方、通信、交通与紧急救援等可核验渠道。"};
}
