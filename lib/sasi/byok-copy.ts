export function taskLabel(state:string){return ({quoted:"等待确认",submitting:"正在提交，请勿重复操作",queued:"排队中",running:"正在生成",succeeded:"已完成",failed:"未能完成",uncertain:"需要核对生成结果",expired:"已过期"} as Record<string,string>)[state]??"正在查询进度";}
export function byokError(code:unknown){
 const c=String(code??"");
 if(c==="AUTH_REQUIRED")return "请先登录，再继续创作。";
 if(/PRICE|ACCEPTANCE|EXECUTION_UNAVAILABLE/.test(c))return "当前生成方式暂时不可用，请稍后再试。";
 if(/CONNECTION|MODEL_NOT_OPEN/.test(c))return "请到「连接我的智能服务」检查连接后再试。";
 if(/UNCERTAIN|RECONCILIATION|ALREADY_STARTED/.test(c))return "这次请求可能已经开始。请先回到项目查看结果，不要重复提交。";
 if(/REQUOTE|CONTENT_CHANGED/.test(c))return "内容已经变化，请重新确认后继续。";
 if(/REFERENCE/.test(c))return "参考图片暂不能使用，请检查图片格式和数量后再试。";
 if(/LIMIT|LENGTH|INVALID|SERIES/.test(c))return "请检查内容、镜头数量和时长，再试一次。";
 if(/BUDGET/.test(c))return "请先确认后再开始生成。";
 return "这一步暂时没有完成，请稍后查看记录。若已提交生成，请勿重复操作。";
}
