import {NextRequest,NextResponse} from "next/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"请求来源无效。"},{status:403});
 const body=await req.json().catch(()=>({}));const q=String(body.question||"").trim().slice(0,12000);
 if(!q)return NextResponse.json({error:"请先写下要处理的事情。"},{status:400});
 const tests=[
  {id:"短剧创作",re:/短剧|剧本|分镜|故事|小说|视频|shot|story|script|drama/i,answer:"这更适合进入短剧工作台。SASI 会先拆人物、场景、节拍和镜头，再形成时间线与字幕；基础视频初稿不要求连接外部模型。",next:[{label:"进入短剧工作台",href:"/sasi/drama"}]},
  {id:"资料与研究",re:/pdf|论文|资料|书|研究|学习|总结|知识|paper|research|book/i,answer:"这更适合建立可追溯资料库。先把文件加入书本、学习或科研 SASI，再从原文证据中检索、比较和整理。",next:[{label:"书本 SASI",href:"/ai-knowledge"},{label:"科研 SASI",href:"/ai-research"}]},
  {id:"文件与图片",re:/图片|照片|pdf|压缩|转换|二维码|excel|csv|文件|ocr|水印|image|file/i,answer:"这是确定性工具任务。优先直接使用实用工具，不需要为这类处理连接生成模型。",next:[{label:"打开实用工具",href:"/tools"}]},
  {id:"网站与代码",re:/网站|代码|程序|部署|网页|bug|报错|code|website|deploy/i,answer:"这是构建类任务。SASI 会先整理目标、输入、约束和验收条件，再进入构建工作台；能用规则、解析器和确定性工具完成的部分优先不用生成模型。",next:[{label:"进入 SASI",href:"/sasi"}]},
 ];
 const hit=tests.find(x=>x.re.test(q))||{id:"任务整理",answer:"我已经收到这件事。先把目标、已有材料、希望得到的结果和限制条件整理清楚，再选择最短的执行路径。你也可以直接上传相关文件，让 SASI 从材料开始。",next:[{label:"进入 SASI",href:"/sasi"}]};
 return NextResponse.json({intent:hit.id,answer:hit.answer,next:hit.next,execution:"autonomous"});
}
