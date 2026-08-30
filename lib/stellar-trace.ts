import * as Astronomy from "astronomy-engine";
import { createHash } from "node:crypto";
import { analyzeCircularDirections, normalizeBearing, type CircularDirectionAnalysis } from "@/lib/stellar-trace-math";

export type StellarTraceInput = { name:string; relationship?:string; birthDate:string; birthTime?:string; birthPlace?:string; lastContactAt:string; lastKnownPlace?:string; lastKnownLat:number; lastKnownLon:number; movementDirection?:string; context?:string };
type NineFieldPosition = { id:string; nameZh:string; longitude:number };
export type NineFieldSnapshot = { epoch:"birth"|"last-contact"|"current"; labelZh:string; observedAt:string; julianDay:number; fields:NineFieldPosition[] };
export type TraceEvidence = {
  id:"time-phase"|"inner-planet"|"outer-planet"|"contact-frame"; labelZh:string; bearing:number;
  sourceFieldIds:string[]; rawValues:number[]; projectionRuleId:string; projectionBasisZh:string;
  relativeRangeBand:"低迁移象"|"中迁移象"|"高迁移象";
  distanceTrace:{ rawSymbol:"low"|"medium"|"high"; normalizationRuleId:"symbolic-angular-amplitude-v1"; resultingRangeKm:null; calibrationStatus:"uncalibrated" };
};
export type StellarTraceResult = {
  version:"lingxifield-stellar-trace-v2"; generatedAt:string; lastKnown:{lat:number;lon:number}; snapshots:NineFieldSnapshot[];
  evidence:TraceEvidence[]; direction:CircularDirectionAnalysis;
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
function longitude(body:Astronomy.Body|undefined,at:Date){if(!body)return normalizeBearing(Astronomy.SunPosition(at).elon);const v=Astronomy.HelioVector(body,at);return normalizeBearing(Math.atan2(v.y,v.x)*180/Math.PI)}
function snapshot(epoch:NineFieldSnapshot["epoch"],labelZh:string,at:Date):NineFieldSnapshot{return{epoch,labelZh,observedAt:at.toISOString(),julianDay:round(Astronomy.MakeTime(at).ut+2451545,5),fields:bodies.map(item=>({id:item.id,nameZh:item.nameZh,longitude:round(longitude(item.body,at))}))}}
function field(s:NineFieldSnapshot,id:string){return s.fields.find(item=>item.id===id)?.longitude??0}
function signedDelta(to:number,from:number){return((to-from+540)%360)-180}
function symbolicBand(amplitude:number):Pick<TraceEvidence,"relativeRangeBand"|"distanceTrace">{const rawSymbol=amplitude<45?"low":amplitude<110?"medium":"high";return{relativeRangeBand:rawSymbol==="low"?"低迁移象":rawSymbol==="medium"?"中迁移象":"高迁移象",distanceTrace:{rawSymbol,normalizationRuleId:"symbolic-angular-amplitude-v1",resultingRangeKm:null,calibrationStatus:"uncalibrated"}}}
function evidenceFrom(id:TraceEvidence["id"],labelZh:string,sourceFieldIds:string[],rawValues:number[],projectionBasisZh:string):TraceEvidence{
  const analysis=analyzeCircularDirections(rawValues);const bearing=analysis.diagnosticMean??0;const amplitude=rawValues.reduce((sum,value)=>sum+Math.abs(value),0)/Math.max(1,rawValues.length);
  return{id,labelZh,bearing:round(bearing,1),sourceFieldIds,rawValues:rawValues.map(value=>round(value)),projectionRuleId:`${id}-angular-projection-v2`,projectionBasisZh,...symbolicBand(amplitude)};
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
  const base=analyzeCircularDirections(evidence.map(item=>item.bearing));const seed=hashInt(`${input.name}|${birthMoment.toISOString()}|${lastContact.toISOString()}`);
  const direction:CircularDirectionAnalysis={...base,diagnosticMean:base.diagnosticMean===null?null:round(base.diagnosticMean,1),resultantLength:round(base.resultantLength),circularDispersion:round(base.circularDispersion),circularStdDegrees:base.circularStdDegrees===null?null:round(base.circularStdDegrees,1),sector:base.sector?[round(base.sector[0],1),round(base.sector[1],1)]:null,modes:base.modes.map(mode=>({...mode,center:round(mode.center,1),mass:round(mode.mass),resultantLength:round(mode.resultantLength),bearings:mode.bearings.map(value=>round(value,1))}))};
  return{version:"lingxifield-stellar-trace-v2",generatedAt:now.toISOString(),lastKnown:{lat:round(input.lastKnownLat,4),lon:round(input.lastKnownLon,4)},snapshots,evidence,direction,
    distance:{status:"uncalibrated",rangeKm:null,evidence:evidence.map(item=>item.distanceTrace),explanationZh:"四层投影目前只能形成相对迁移象，尚无经过史料校核与盲测标定的公里映射规则。因此本版不输出公里距离。"},candidateRegions:[],candidateCenter:null,
    environmentZh:input.context?["现实线索已记录，尚未由模型自动解释"]:["尚无可核验的现实环境线索"],artIndexes:[seed%60,(seed*17+23)%60],
    modelBoundaryZh:"九域为可复算的天文事实层；四层为透明展示的象征投影层。二者之间尚未建立经过盲测验证的现实人员位置因果关系。",
    safetyBoundaryZh:"本结果不读取设备、通信、GPS 或实时行踪，不提供人员现实位置事实认定，也不得用于跟踪、骚扰或监控。涉及人员安全时，请立即使用警方、通信、交通与紧急救援等可核验渠道。"};
}
