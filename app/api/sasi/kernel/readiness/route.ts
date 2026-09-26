import {NextResponse} from "next/server";
import {sasiKernelReadiness} from "@/lib/sasi-kernel/readiness";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({ok:true,readiness:sasiKernelReadiness()},{headers:{"Cache-Control":"no-store"}});}
