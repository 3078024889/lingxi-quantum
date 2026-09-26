import {NextRequest,NextResponse} from "next/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"请求来源无效。"},{status:403});
 const body=await req.json().catch(()=>({}));const mode=String(body.mode||"ask"),content=String(body.content||"").trim().slice(0,8000);
 if(!content)return NextResponse.json({error:"内容为空。"},{status:400});
 if(mode==="invite"){const stems=["此刻最值得看见的是什么？","如果不急着给答案，你最想继续问什么？","这件事真正影响你的部分在哪里？","哪些是事实，哪些只是担心？","你已经知道但还没行动的是什么？","如果只做一步，哪一步最有用？","还有什么重要信息没被放进来？","什么结果会让你确认方向是对的？","下一次回看时，你希望已经发生什么？"];return NextResponse.json({invites:stems})}
 const text=mode==="ask"
  ? `我看到了你的问题：“${content.slice(0,220)}”\n\n目前这条入口改为灵犀场自主任务整理，不再依赖外部生成服务。若这是资料问题，请把原文加入书本/学习/科研 SASI；若是文件、图片或视频处理，请直接进入实用工具；若是开放式创作，可以进入 SASI 创作工作台继续。`
  : `这项旧入口已经并入灵犀场新的 SASI 与实用工具体系。你写下的内容已收到；请从资料、创作或工具入口继续处理。`;
 return NextResponse.json({text,execution:"autonomous"});
}
