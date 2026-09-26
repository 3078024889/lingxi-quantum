import {NextResponse} from "next/server";
export async function POST(){return NextResponse.json({error:"旧人工退款处理入口已停用。请使用余额提现的自动原路退款。",redirect:"/account/withdrawals"},{status:410});}
