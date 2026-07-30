// ────────────────────────────────────────────────────────────────────
// 微信网页授权（用于 JSAPI 支付换取 openid）
// ────────────────────────────────────────────────────────────────────
// 这一步跟"微信支付商户平台"里配的东西是两码事，容易混淆，写清楚：
//   1. pay.weixin.qq.com 商户平台「JSAPI支付授权目录」——限制的是
//      "从哪个页面路径发起支付调用"，你已经配了 /checkout/，这个没问题。
//   2. mp.weixin.qq.com 公众号后台「网页授权域名」——限制的是
//      "OAuth静默授权（拿 code 换 openid）这一步，允许在哪个域名下跳转"，
//      这是另一个完全独立的配置项，在：
//        公众号后台 → 设置与开发 → 公众号设置 → 功能设置 → 网页授权域名
//      需要把 lingxifield.cn 加进去（同样要下载一个验证文件放到网站根目录）。
//      这一步如果没配，下面 getOAuthUrl() 跳转会直接报错
//      "redirect_uri 参数错误"，不是代码问题，是后台没加域名。
//
// 需要的环境变量（都在 mp.weixin.qq.com 公众号后台"基本配置"页）：
//   WECHAT_APP_ID      —— 跟支付用的是同一个（公众号的 AppID，已关联到商户号）
//   WECHAT_APP_SECRET  —— 公众号的 AppSecret（注意不是支付的 APIv3 密钥，是另一个）

const APP_ID = process.env.WECHAT_APP_ID;
const APP_SECRET = process.env.WECHAT_APP_SECRET;

export function wechatOauthConfigured(): boolean {
  return !!(APP_ID && APP_SECRET);
}

// 生成静默授权跳转链接——用户在微信内置浏览器打开这个链接，微信会（不弹
// 任何授权弹窗，因为scope=snsapi_base）直接跳回redirectUri，并带上
// ?code=xxx&state=xxx。redirectUri本身建议带上当时页面已有的query（
// productId/submissionId这些），因为微信只是在redirectUri后面追加
// code/state，原有的query会原样保留下来。
export function getWechatOAuthUrl(redirectUri: string, state: string): string {
  const encoded = encodeURIComponent(redirectUri);
  return (
    `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APP_ID}` +
    `&redirect_uri=${encoded}&response_type=code&scope=snsapi_base&state=${encodeURIComponent(state)}` +
    `#wechat_redirect`
  );
}

// 用code换openid——这一步在服务端做，code是一次性的，用过就失效，
// 不能给前端直接拿AppSecret自己换（AppSecret绝对不能出现在前端代码里）。
export async function exchangeCodeForOpenid(code: string): Promise<{ openid: string }> {
  if (!wechatOauthConfigured()) {
    throw new Error("微信网页授权尚未配置完整（缺 WECHAT_APP_ID 或 WECHAT_APP_SECRET），无法换取 openid");
  }
  const url =
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${APP_ID}` +
    `&secret=${APP_SECRET}&code=${encodeURIComponent(code)}&grant_type=authorization_code`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.errcode) {
    // 40029 = code无效/已过期或被用过一次； 48001 = 网页授权域名没配置。
    throw new Error(`微信网页授权失败（errcode ${data.errcode}）：${data.errmsg || "未知错误"}`);
  }
  if (!data.openid) {
    throw new Error(`微信网页授权没有返回openid：${JSON.stringify(data)}`);
  }
  return { openid: data.openid };
}
