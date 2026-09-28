export const WEBSITE_CONTRACT=`本次任务生成可下载的静态网站，不部署服务器。不使用外部脚本、iframe、支付表单、登录表单、API 密钥、远程字体或外部图片。只用内嵌 CSS、语义化 HTML 和 CSS 图形。根据需求提供响应式布局、真实文案、可用的页内链接，不伪造提交成功、支付成功或后台能力。输出 JSON：{"title":"网站名","html":"<!doctype html>...完整 HTML..."}。不要输出 Markdown 围栏。`;
export function validateWebsiteArtifact(value:unknown){
  const p=value as {title?:unknown;html?:unknown};
  if(!p||typeof p.title!=="string"||!p.title.trim()||p.title.length>120||typeof p.html!=="string"||p.html.length>180000||!/<html[\s>]/i.test(p.html)||!/<\/html>/i.test(p.html))throw new Error("WEBSITE_ARTIFACT_INVALID");
  return{title:p.title,html:p.html};
}
