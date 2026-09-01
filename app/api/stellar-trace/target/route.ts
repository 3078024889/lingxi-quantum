import { NextResponse } from "next/server";
import { getAccess, hasUnlock } from "@/lib/access";
import { calculateTargetTrace, type TargetTraceInput } from "@/lib/stellar-trace/targets";
import { REVIEW_MODE } from "@/lib/reviewMode";

export const runtime = "nodejs";

const text=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
const numberOrNull=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)?value:null;

export async function POST(req:Request){
  const access=await getAccess();
  if(!access.user)return NextResponse.json({error:"请先登录并开启星迹研究权益"},{status:401});
  if(!access.manifestActive&&!hasUnlock(access.unlocks,"stellar-trace"))return NextResponse.json({error:"星迹研究权益尚未开启"},{status:403});
  const body=await req.json().catch(()=>null) as Record<string,unknown>|null;
  if(!body||(body.targetKind!=="animal"&&body.targetKind!=="object"))return NextResponse.json({error:"目标类型无效"},{status:400});
  const targetName=text(body.targetName,80),lastKnownPlace=text(body.lastKnownPlace,160),qaTime=REVIEW_MODE?text(body.qaNow,40):"",queryTime=qaTime||text(body.queryTime,40)||new Date().toISOString();
  if(!targetName||!lastKnownPlace)return NextResponse.json({error:"请填写目标名称与最后确认位置"},{status:400});
  const lat=numberOrNull(body.lastKnownLat),lon=numberOrNull(body.lastKnownLon);
  const shared={targetKind:body.targetKind,targetName,queryTime,lastKnownPlace,lastKnownCoordinate:lat!=null&&lon!=null?{lat,lon,label:lastKnownPlace}:null,lastSeenAt:text(body.lastSeenAt,40)||null,reportedMovementBearing:numberOrNull(body.reportedMovementBearing),context:text(body.context,500)||null,liuyaoCast:null};
  const input:TargetTraceInput=body.targetKind==="animal"?{...shared,targetKind:"animal",animalKind:(["cat","dog","bird","livestock","other"].includes(String(body.animalKind))?body.animalKind:"other") as "cat"|"dog"|"bird"|"livestock"|"other",microchipped:typeof body.microchipped==="boolean"?body.microchipped:null,indoorOutdoor:(["indoor","outdoor","mixed","unknown"].includes(String(body.indoorOutdoor))?body.indoorOutdoor:"unknown") as "indoor"|"outdoor"|"mixed"|"unknown",temperament:(["timid","social","territorial","unknown"].includes(String(body.temperament))?body.temperament:"unknown") as "timid"|"social"|"territorial"|"unknown",escapeMode:"unknown"}:{...shared,targetKind:"object",objectKind:(["keys","phone","wallet","document","jewelry","bag","vehicle","other"].includes(String(body.objectKind))?body.objectKind:"other") as "keys"|"phone"|"wallet"|"document"|"jewelry"|"bag"|"vehicle"|"other",container:text(body.container,120)||null,lastHandledBy:text(body.lastHandledBy,80)||null,likelyTransport:(["carried","vehicle","mail","unknown"].includes(String(body.likelyTransport))?body.likelyTransport:"unknown") as "carried"|"vehicle"|"mail"|"unknown"};
  return NextResponse.json(await calculateTargetTrace(input),{headers:{"Cache-Control":"no-store"}});
}
