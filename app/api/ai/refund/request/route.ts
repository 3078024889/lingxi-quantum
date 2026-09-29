import {NextRequest,NextResponse} from "next/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req)){
    return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  }
  return NextResponse.json(
    {error:"旧退款入口已停用，请前往余额提现，系统会退回原支付方式。",redirect:"/account/withdrawals"},
    {status:410}
  );
}
