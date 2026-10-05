import "server-only";
import {randomUUID}from"node:crypto";
import{createAdminClient}from"@/lib/supabase/admin";

export type TraceSpan={
 traceId:string;spanId:string;parentSpanId:string|null;name:string;
 startedAt:number;attributes:Record<string,unknown>;
};
export function startSpan(name:string,attributes:Record<string,unknown>={},traceId=randomUUID(),parentSpanId:string|null=null):TraceSpan{
 return {traceId,spanId:randomUUID(),parentSpanId,name,startedAt:Date.now(),attributes};
}
export async function endSpan(span:TraceSpan,status:"ok"|"error",extra:Record<string,unknown>={}){
 try{
  const admin=createAdminClient();
  await admin.from("sasi_ai_trace_spans").insert({
   trace_id:span.traceId,span_id:span.spanId,parent_span_id:span.parentSpanId,name:span.name,
   status,duration_ms:Math.max(0,Date.now()-span.startedAt),
   attributes:{...span.attributes,...extra}
  });
 }catch{}
}
