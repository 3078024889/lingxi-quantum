import {NextRequest,NextResponse} from "next/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req)){
    return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  }
  return NextResponse.json(
    {error:"旧人工退款处理入口已停用。请使用余额提现的自动原路退款。",redirect:"/account/withdrawals"},
    {status:410}
  );
}
