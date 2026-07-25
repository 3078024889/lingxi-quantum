import crypto from "crypto";

// ────────────────────────────────────────────────────────────────────
// 微信支付 APIv3 · Native扫码支付
// ────────────────────────────────────────────────────────────────────
// 需要在 Vercel 环境变量里配好这几个（都是在微信支付商户平台后台"API安全"
// 那一页生成/下载的，不是随便填的）：
//   WECHAT_APP_ID          —— 你的APPID（服务商/公众号/小程序任一个已关联的APPID）
//   WECHAT_MCH_ID           —— 商户号（在商户平台首页能看到）
//   WECHAT_API_V3_KEY       —— APIv3密钥（商户平台"账户中心-API安全-设置APIv3密钥"，
//                                自己设置的32位字符串，不是系统生成的，设置的时候
//                                自己选，记得存好，微信不会再显示第二次）
//   WECHAT_PRIVATE_KEY      —— 商户API私钥文件（apiclient_key.pem）的完整内容，
//                                包含 -----BEGIN PRIVATE KEY----- 这些头尾
//   WECHAT_CERT_SERIAL_NO   —— 商户API证书序列号（下载证书的时候能看到）
// 这五个都还没有的话，需要先在商户平台"账户中心-API安全"这一页申请/下载。

const APP_ID = process.env.WECHAT_APP_ID;
const MCH_ID = process.env.WECHAT_MCH_ID;
const API_V3_KEY = process.env.WECHAT_API_V3_KEY;
const PRIVATE_KEY = process.env.WECHAT_PRIVATE_KEY;
const CERT_SERIAL_NO = process.env.WECHAT_CERT_SERIAL_NO;
// 微信支付公钥模式——用来验证"这条支付结果通知真的是微信官方发的"，
// 不是随便谁伪造发过来的。之前 notify 那个接口的注释里老实说过这一步
// 没做完整，这次补上。公钥本身不敏感（是公开的），但公钥ID要对得上
// 微信推送通知时带的 Wechatpay-Serial 请求头，才能确认用的是哪一版。
const PLATFORM_PUBLIC_KEY = process.env.WECHAT_PLATFORM_PUBLIC_KEY;
const PLATFORM_PUBLIC_KEY_ID = process.env.WECHAT_PLATFORM_PUBLIC_KEY_ID;

export function wechatPayConfigured(): boolean {
  return !!(APP_ID && MCH_ID && API_V3_KEY && PRIVATE_KEY && CERT_SERIAL_NO);
}

// 具体缺了哪几个——之前那个 wechatPayConfigured() 只回答"配没配全"，
// 缺一个就整体报"没配置完整"，容易让人误以为已经配好的那几个也没
// 生效。这个函数明确列出到底缺哪几个，错误提示更有用。
export function wechatPayMissingVars(): string[] {
  const missing: string[] = [];
  if (!APP_ID) missing.push("WECHAT_APP_ID");
  if (!MCH_ID) missing.push("WECHAT_MCH_ID");
  if (!API_V3_KEY) missing.push("WECHAT_API_V3_KEY");
  if (!PRIVATE_KEY) missing.push("WECHAT_PRIVATE_KEY");
  if (!CERT_SERIAL_NO) missing.push("WECHAT_CERT_SERIAL_NO");
  return missing;
}

function sign(message: string): string {
  if (!PRIVATE_KEY) throw new Error("缺少 WECHAT_PRIVATE_KEY 环境变量");
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(message, "utf8");
  // 私钥内容如果是从环境变量里粘贴进来的，换行符经常会被转义成字面上的
  // "\n" 两个字符，这里统一转换回真正的换行符，不然Node的crypto模块
  // 解析不了这个私钥格式。
  const normalizedKey = PRIVATE_KEY.replace(/\\n/g, "\n");
  return signer.sign(normalizedKey, "base64");
}

function buildAuthHeader(method: string, url: string, body: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const urlObj = new URL(url);
  const canonicalUrl = urlObj.pathname + urlObj.search;
  const message = `${method}\n${canonicalUrl}\n${timestamp}\n${nonce}\n${body}\n`;
  const signature = sign(message);
  return `WECHATPAY2-SHA256-RSA2048 mchid="${MCH_ID}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${CERT_SERIAL_NO}",signature="${signature}"`;
}

async function wechatRequest(method: "GET" | "POST", path: string, body?: object) {
  const url = `https://api.mch.weixin.qq.com${path}`;
  const bodyStr = body ? JSON.stringify(body) : "";
  const authHeader = buildAuthHeader(method, url, bodyStr);
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? bodyStr : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`微信支付接口返回错误 ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

// 创建一笔Native扫码支付订单，返回一个 code_url——这不是给人直接打开的
// 网址，是要拿去生成二维码图片的原始数据，用户用微信扫这张二维码完成支付。
export async function createWechatNativeOrder(params: {
  outTradeNo: string; // 我们自己生成的订单号，不能跟历史订单重复
  description: string;
  amountFen: number; // 金额，单位是"分"，不是"元"——1元=100分，这是微信支付的强制要求
  notifyUrl: string;
}): Promise<{ codeUrl: string }> {
  if (!wechatPayConfigured()) {
    throw new Error("微信支付尚未配置完整的环境变量，无法创建订单");
  }
  const data = await wechatRequest("POST", "/v3/pay/transactions/native", {
    appid: APP_ID,
    mchid: MCH_ID,
    description: params.description,
    out_trade_no: params.outTradeNo,
    notify_url: params.notifyUrl,
    amount: { total: params.amountFen, currency: "CNY" },
  });
  if (!data.code_url) {
    throw new Error(`微信支付未返回code_url: ${JSON.stringify(data)}`);
  }
  return { codeUrl: data.code_url };
}

// 验证微信支付服务器推送过来的通知，签名是否真的对得上——传入
// 请求头里的 Wechatpay-Timestamp / Wechatpay-Nonce / 原始请求体，
// 拼出跟微信签名时同样格式的待验证字符串，用微信支付公钥验证
// Wechatpay-Signature 这个签名是否吻合。验证不通过，说明这条通知
// 不是微信官方发的（或者被篡改过），必须拒绝处理，不能只看到
// "收到了一条通知"就当成真的。
export function verifyWechatNotifySignature(params: {
  timestamp: string;
  nonce: string;
  body: string;
  signature: string;
  serial: string; // 微信在Wechatpay-Serial请求头里带的，标明用的是哪一版公钥
}): boolean {
  if (!PLATFORM_PUBLIC_KEY || !PLATFORM_PUBLIC_KEY_ID) {
    console.error("[wechatpay] 缺少 WECHAT_PLATFORM_PUBLIC_KEY / WECHAT_PLATFORM_PUBLIC_KEY_ID，无法验签");
    return false;
  }
  if (params.serial !== PLATFORM_PUBLIC_KEY_ID) {
    console.error("[wechatpay] 通知用的公钥ID对不上，可能是公钥已轮换，需要更新环境变量。收到的serial:", params.serial);
    return false;
  }
  const message = `${params.timestamp}\n${params.nonce}\n${params.body}\n`;
  const normalizedKey = PLATFORM_PUBLIC_KEY.replace(/\\n/g, "\n");
  try {
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(message, "utf8");
    return verifier.verify(normalizedKey, params.signature, "base64");
  } catch (e) {
    console.error("[wechatpay] 验签过程出错:", e);
    return false;
  }
}

// 主动查询一笔订单的支付状态——前端轮询用，用户扫码付款之后，页面每隔
// 几秒来问一次"付了没"，不完全依赖webhook（webhook可能因为网络原因
// 延迟或者丢失，主动查询是一层保险）。
export async function queryWechatOrder(outTradeNo: string): Promise<{ paid: boolean; raw: unknown }> {
  const data = await wechatRequest("GET", `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${MCH_ID}`);
  return { paid: data.trade_state === "SUCCESS", raw: data };
}

// 解密微信支付webhook回调里的资源密文——微信推送过来的支付结果通知，
// 核心数据是AES-256-GCM加密过的，要用APIv3密钥解开才能看到真实内容
// （比如到底是哪笔订单、有没有真的付款成功），不能只看外层有没有
// 收到通知就当成"付款成功"，必须解密+验证过了才算数。
export function decryptWechatNotifyResource(resource: {
  ciphertext: string;
  nonce: string;
  associated_data?: string;
}): { out_trade_no: string; trade_state: string; [key: string]: unknown } {
  if (!API_V3_KEY) throw new Error("缺少 WECHAT_API_V3_KEY 环境变量");
  const key = Buffer.from(API_V3_KEY, "utf8");
  const nonce = Buffer.from(resource.nonce, "utf8");
  const aad = Buffer.from(resource.associated_data ?? "", "utf8");
  const ciphertextBuf = Buffer.from(resource.ciphertext, "base64");
  const authTag = ciphertextBuf.subarray(ciphertextBuf.length - 16);
  const data = ciphertextBuf.subarray(0, ciphertextBuf.length - 16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(authTag);
  decipher.setAAD(aad);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
}
