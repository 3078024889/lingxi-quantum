import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSasiOperator} from "@/lib/sasi/operator/access";
import {loadSasiV5OperatorMetrics} from "@/lib/sasi-v5/operator-metrics";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const{data:{user}}=await createClient().auth.getUser();
 if(!user||!isSasiOperator(user.email))return NextResponse.json({error:"Not found."},{status:404});
 return NextResponse.json(await loadSasiV5OperatorMetrics(),{headers:{"Cache-Control":"no-store"}});
}
