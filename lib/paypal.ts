function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

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

export async function getPaypalAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.token;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal 未配置：缺少 PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET");

  const res = await fetchWithTimeout(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(`PayPal 换取 access token 失败：${JSON.stringify(data)}`);
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3000) * 1000 };
  return data.access_token;
}

export async function createPaypalOrder(params: {
  amountUsd: number;
  description: string;
  referenceId: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approveUrl: string }> {
  const token = await getPaypalAccessToken();
  const res = await fetchWithTimeout(`${paypalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: params.referenceId,
        description: params.description.slice(0, 127),
        amount: { currency_code: "USD", value: params.amountUsd.toFixed(2) },
      }],
      application_context: {
        brand_name: "LINGXIFIELD 灵犀场",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) throw new Error(`PayPal 创建订单失败：${JSON.stringify(data)}`);
  const approveUrl = (data.links as { rel: string; href: string }[])?.find((l) => l.rel === "approve")?.href;
  if (!approveUrl) throw new Error("PayPal 返回里没找到 approve 链接");
  return { id: data.id, approveUrl };
}

function verifyMoney(amount: any, expectedAmountUsd: number) {
  const cents = Math.round(Number(amount?.value) * 100);
  const expectedCents = Math.round(expectedAmountUsd * 100);
  if (!amount || amount.currency_code !== "USD" || cents !== expectedCents) {
    throw new Error("PayPal amount or currency did not match the local order.");
  }
}

function verifyReference(unit: any, expectedReferenceId?: string) {
  if (expectedReferenceId && unit?.reference_id !== expectedReferenceId) {
    throw new Error("PayPal reference did not match the local order.");
  }
}

export async function capturePaypalOrder(
  orderId: string,
  expectedAmountUsd: number,
  expectedReferenceId?: string
): Promise<{ status: string; raw: any }> {
  const token = await getPaypalAccessToken();
  const res = await fetchWithTimeout(`${paypalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) {
    if (data?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED") return { status: "ALREADY_CAPTURED", raw: data };
    throw new Error(`PayPal 扣款失败：${JSON.stringify(data)}`);
  }

  const unit = data.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  if (data.status === "COMPLETED") {
    if (capture?.status !== "COMPLETED") throw new Error("PayPal order completed without a completed capture.");
    verifyMoney(capture?.amount, expectedAmountUsd);
    verifyReference(unit, expectedReferenceId);
  }
  return { status: String(data.status ?? "UNKNOWN"), raw: data };
}

export async function queryPaypalOrder(
  paypalOrderId: string,
  expectedAmountUsd: number,
  expectedReferenceId?: string
): Promise<{ status: string; raw: any }> {
  const token = await getPaypalAccessToken();
  const res = await fetchWithTimeout(
    `${paypalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
    { method: "GET", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal 查询订单失败：${JSON.stringify(data)}`);
  const unit = data.purchase_units?.[0];
  verifyMoney(unit?.amount, expectedAmountUsd);
  verifyReference(unit, expectedReferenceId);
  return { status: String(data.status ?? "UNKNOWN"), raw: data };
}

export async function verifyPaypalCompletedOrder(
  paypalOrderId: string,
  expectedAmountUsd: number,
  expectedReferenceId?: string
): Promise<{ captureId: string; raw: any }> {
  const queried = await queryPaypalOrder(paypalOrderId, expectedAmountUsd, expectedReferenceId);
  if (queried.status !== "COMPLETED") throw new Error("PayPal order is not completed.");

  const unit = queried.raw?.purchase_units?.[0];
  const captures = Array.isArray(unit?.payments?.captures) ? unit.payments.captures : [];
  const capture = captures.find((item: any) => item?.status === "COMPLETED");
  if (!capture?.id) throw new Error("PayPal completed capture not found.");

  verifyMoney(capture.amount, expectedAmountUsd);
  verifyReference(unit, expectedReferenceId);
  return { captureId: String(capture.id), raw: queried.raw };
}

export async function verifyPaypalWebhook(headers: Headers, rawBody: string): Promise<boolean> {
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
