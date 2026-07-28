// PayPal REST API（Orders v2）封装。
//
// 需要在环境变量里配置：
//   PAYPAL_CLIENT_ID       —— PayPal 开发者后台 App 的 Client ID
//   PAYPAL_CLIENT_SECRET   —— 对应的 Secret
//   PAYPAL_ENV             —— "live"（正式收款）或 "sandbox"（测试），不填默认 live
//   PAYPAL_WEBHOOK_ID      —— 在 PayPal 后台给这个 App 配置 Webhook 后拿到的 Webhook ID，
//                             用来校验回调签名，防止有人伪造"已付款"请求
//
// 这几个都是敏感信息，不要写进代码仓库，只在部署环境（Vercel 项目设置 /
// .env.local，.env.local 已在 .gitignore 里）里配置。

function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

// v240：跟微信支付那边一样的加固——不给fetch设超时，一旦PayPal接口
// 响应慢，会一直挂到被平台自己的运行时长上限杀死，返回HTML错误页而
// 不是我们自己的JSON错误。这里包一层20秒超时。
async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("PayPal 接口响应超时（超过20秒），请稍后再试");
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

let cachedToken: { token: string; expiresAt: number } | null = null;

// OAuth2 client_credentials 换 access token，加了一层内存缓存（token 通常
// 9小时有效），避免每次下单/回调都重新换一次。
export async function getPaypalAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error("PayPal 未配置：缺少 PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET");
  }
  const res = await fetchWithTimeout(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`PayPal 换取 access token 失败：${JSON.stringify(data)}`);
  }
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3000) * 1000 };
  return data.access_token;
}

// 创建一笔订单，返回 { id, approveUrl }。approveUrl 就是要跳转给用户的付款页面，
// 用法跟之前 NOWPayments 的 invoice_url 一样——前端拿到直接 window.location.href。
export async function createPaypalOrder(params: {
  amountUsd: number;
  description: string;
  referenceId: string; // 我们自己 orders 表里的订单 id，回调时用来对应
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approveUrl: string }> {
  const token = await getPaypalAccessToken();
  const res = await fetchWithTimeout(`${paypalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId,
          description: params.description.slice(0, 127), // PayPal 限长127字符
          amount: { currency_code: "USD", value: params.amountUsd.toFixed(2) },
        },
      ],
      application_context: {
        brand_name: "Lingxi Field 灵犀场",
        user_action: "PAY_NOW",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(`PayPal 创建订单失败：${JSON.stringify(data)}`);
  }
  const approveUrl = (data.links as { rel: string; href: string }[])?.find((l) => l.rel === "approve")?.href;
  if (!approveUrl) {
    throw new Error("PayPal 返回里没找到 approve 链接");
  }
  return { id: data.id, approveUrl };
}

// 用户在 PayPal 页面点了"同意付款"、跳回我们网站之后，服务端调这个来真正扣款。
// 返回 "COMPLETED" 才算钱到账；PayPal 有可能返回其他状态（比如需要人工审核的
// PENDING），那种情况不应该当作已付款处理。
export async function capturePaypalOrder(orderId: string): Promise<{ status: string; raw: any }> {
  const token = await getPaypalAccessToken();
  const res = await fetchWithTimeout(`${paypalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) {
    // ORDER_ALREADY_CAPTURED 常见于："支付回调"和"用户跳转回来"两条路径同时
    // 想 capture 同一笔订单——不是错误，说明另一条路径已经先完成了，交给
    // 调用方按订单状态去查真实结果，而不是在这里直接报错中断。
    if (data?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED") {
      return { status: "ALREADY_CAPTURED", raw: data };
    }
    throw new Error(`PayPal 扣款失败：${JSON.stringify(data)}`);
  }
  return { status: data.status, raw: data };
}

// 校验 PayPal Webhook 回调确实来自 PayPal 本人，不是伪造的。需要在 PayPal 开发者
// 后台给这个 App 订阅 Webhook（事件类型至少要有 PAYMENT.CAPTURE.COMPLETED），
// 拿到 Webhook ID 配进 PAYPAL_WEBHOOK_ID。
export async function verifyPaypalWebhook(
  headers: Headers,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const token = await getPaypalAccessToken();
  const res = await fetchWithTimeout(`${paypalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_time: headers.get("paypal-transmission-time"),
      cert_url: headers.get("paypal-cert-url"),
      auth_algo: headers.get("paypal-auth-algo"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
