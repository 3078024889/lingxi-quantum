import {NextResponse} from "next/server";
export async function POST(){return NextResponse.json({error:"旧退款入口已停用，请前往余额提现，系统会退回原支付方式。",redirect:"/account/withdrawals"},{status:410});}
