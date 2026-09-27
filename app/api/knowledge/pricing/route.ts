import {NextResponse} from "next/server";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 return NextResponse.json({
  billing:"free",
  tiers:{
   light:{factor:1,minimumRmb:0},
   standard:{factor:2,minimumRmb:0},
   high:{factor:5,minimumRmb:0},
  }
 },{headers:{"Cache-Control":"no-store"}});
}
