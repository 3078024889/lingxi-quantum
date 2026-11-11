/**
 * Public, versioned release notices shared by desktop, mobile and the mini-program
 * announcement channel. Append a new verified notice after each actual release.
 * Do not claim that pending payment/ToolPass features are production-ready.
 */
export type PublicNotice={
  id:string;createdAt:string;category:"operations"|"tools"|"mini";
  titleZh:string;titleEn:string;bodyZh:string;bodyEn:string;href:string;
};
export const PUBLIC_RELEASE_NOTICES:readonly PublicNotice[]=Object.freeze([
  {
    id:"20261108-cn-admin-recovery",createdAt:"2026-11-08T10:45:00+08:00",category:"operations",
    titleZh:"公告：国内站管理后台访问已恢复",
    titleEn:"Notice: China-site administrator access restored",
    bodyZh:"国内站已完成管理员服务密钥修复，并恢复管理菜单。全球 SIAI 排行榜与公开工具入口可以访问。微信、支付宝、PayPal 充值及支付后的余额交付仍在验收，暂不宣布支付恢复。",
    bodyEn:"The China site's administrator key and management menu have been restored. SIAI and public tool routes remain accessible. WeChat Pay, Alipay and PayPal funding and post-payment credit delivery are still undergoing verification.",
    href:"/account/notifications"
  },
  {
    id:"20261108-toolpass-readiness",createdAt:"2026-11-08T10:40:00+08:00",category:"tools",
    titleZh:"公告：实用工具每日额度及通用工具包正在联调",
    titleEn:"Notice: Daily tool quotas and shared passes in integration testing",
    bodyZh:"百余项工具入口已恢复访问；每日免费次数、账户/IP 双重计次与四档工具包正在进行生产验证。付款入口未正式开放，旧版工具可能暂未拦截第二次使用；上线验收完成后发布明确公告。",
    bodyEn:"Over 100 tool routes are accessible. Daily limits, account/IP accounting and the four shared passes are undergoing production validation. Paid passes are not open, and some legacy tools may not yet block repeated use.",
    href:"/tools/pass"
  },
  {
    id:"20261108-mini-status",createdAt:"2026-11-08T10:35:00+08:00",category:"mini",
    titleZh:"公告：小程序版本及支付服务进展",
    titleEn:"Notice: Mini-program release and payment status",
    bodyZh:"小程序版本记录目前为 4.8.6。后续新版本、审核结果及已验收的功能会同步发布到消息中心；小程序充值与支付服务只有完成商户验收后才公告开放。",
    bodyEn:"The currently recorded mini-program version is 4.8.6. Future verified releases and review results will appear in the notification centre. Mini-program payments will be announced only after merchant acceptance.",
    href:"/account/notifications"
  }
]);

export function publicNoticeItems(lang:string){
  const zh=lang==="zh";
  return PUBLIC_RELEASE_NOTICES.map(n=>({
    id:"notice:"+n.id,
    eventKey:"notice:"+n.id,
    kind:"announcement" as const,
    createdAt:n.createdAt,
    version:n.id,
    title:zh?n.titleZh:n.titleEn,
    body:zh?n.bodyZh:n.bodyEn,
    href:n.href,
    read:undefined as boolean|undefined
  }));
}
