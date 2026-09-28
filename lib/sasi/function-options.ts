export type FunctionTask = "chat" | "director" | "book" | "website" | "image" | "video";
export const FUNCTION_OPTIONS = [
  {id:"continuity",label:"人物与场景一致",description:"延续人物、服装和场景细节",tasks:["director","image","video"]},
  {id:"shots",label:"镜头设计",description:"让动作、运镜与转场衔接自然",tasks:["director","video"]},
  {id:"dialogue",label:"对白润色",description:"贴合角色语气与片段时长",tasks:["director","video"]},
  {id:"image",label:"画面风格",description:"围绕你的参考与审美整理画面",tasks:["image","video"]},
  {id:"evidence",label:"原文溯源",description:"重要结论回到资料原文",tasks:["book","chat"]},
  {id:"teach",label:"讲解与练习",description:"用例子讲清概念，再用问题巩固",tasks:["book","chat"]},
  {id:"compare",label:"观点对照",description:"比较依据、分歧与尚未确定之处",tasks:["book","chat"]},
  {id:"website",label:"页面设计",description:"围绕访客需求组织内容与行动入口",tasks:["website"]},
  {id:"mobile",label:"手机适配",description:"让小屏浏览、阅读与操作更顺手",tasks:["website"]},
] as const;
export function functionOptions(task:FunctionTask){return FUNCTION_OPTIONS.filter(x=>(x.tasks as readonly string[]).includes(task))}
export function validateFunctionSelection(task:FunctionTask,input:unknown):string[]|undefined{
  if(input===undefined)return undefined;
  if(!Array.isArray(input)||input.length>8||input.some(x=>typeof x!=="string"))throw new Error("INVALID_FUNCTION_SELECTION");
  const allowed=new Set(functionOptions(task).map(x=>String(x.id)));
  if(input.some(x=>!allowed.has(x)))throw new Error("INVALID_FUNCTION_SELECTION");
  return [...new Set(input as string[])];
}
