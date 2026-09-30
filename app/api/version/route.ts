import {NextResponse} from "next/server";
import {LINGXIFIELD_RELEASE} from "@/lib/release/version";
export const dynamic="force-static";
export async function GET(){
 return NextResponse.json(LINGXIFIELD_RELEASE,{headers:{"Cache-Control":"public, max-age=300, stale-while-revalidate=3600"}});
}
