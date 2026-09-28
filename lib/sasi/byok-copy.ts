export function taskLabel(state:string){return ({quoted:"等待你确认费用",submitting:"正在提交，请勿重复操作",queued:"排队中",running:"正在生成",succeeded:"已完成",failed:"未能完成",uncertain:"需要核对生成结果",expired:"已过期"} as Record<string,string>)[state]??"正在查询进度";}
export function byokError(code:unknown){
 const c=String(code??"");
 if(c==="AUTH_REQUIRED")return "请先登录，再继续创作。";
 if(/PRICE|ACCEPTANCE|EXECUTION_UNAVAILABLE/.test(c))return "这个生成服务暂时不能使用，尚未产生模型费用。请稍后再试。";
 if(/CONNECTION|MODEL_NOT_OPEN/.test(c))return "请到「连接生成服务」检查账户连接，并确认已开通所选模型。";
 if(/UNCERTAIN|RECONCILIATION|ALREADY_STARTED/.test(c))return "这次请求可能已被接收。请先到生成服务的账户核对记录，不要重复生成，以免再次收费。";
 if(/REQUOTE|CONTENT_CHANGED/.test(c))return "这份预算已失效，请重新查看费用后确认。";
 if(/REFERENCE/.test(c))return "参考图片暂不能使用，请检查图片格式、数量，或换一个支持参考图的模型。";
 if(/LIMIT|LENGTH|INVALID|SERIES/.test(c))return "请检查内容、镜头数量和时长，再试一次。";
 if(/BUDGET/.test(c))return "请先确认本次费用，再开始生成。";
 return "这一步暂时没有完成，请稍后查看记录。若已提交生成，请勿重复操作。";
}
