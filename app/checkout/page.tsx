"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { getProduct } from "@/lib/plans";
import { useLang } from "@/lib/useLang";
import { createClient } from "@/lib/supabase/client";

// v259：二维码中间加一个小色块+文字，区分"这是哪家的码"——不是去用
// 微信/支付宝的官方图标（那是他们的注册商标，不能拿来用），是用
// 我们自己的文字徽标做视觉区分。徽标控制在二维码宽度的18%左右，
// 二维码本身用的是M级纠错（能容忍最多15%左右的图案遮挡仍可扫描），
// 加这么大一块徽标不会导致扫不出来。
async function addCenterBadge(qrDataUrl: string, label: string, bg: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(qrDataUrl); return; }
      ctx.drawImage(img, 0, 0);
      const badgeSize = img.width * 0.2;
      const cx = img.width / 2;
      const cy = img.height / 2;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(cx - badgeSize / 2 - 6, cy - badgeSize / 2 - 6, badgeSize + 12, badgeSize + 12, 8);
      ctx.fill();
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(cx - badgeSize / 2, cy - badgeSize / 2, badgeSize, badgeSize, 6);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.floor(badgeSize * 0.32)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, cx, cy + 1);
      resolve(canvas.toDataURL());
    };
    img.onerror = () => resolve(qrDataUrl);
    img.src = qrDataUrl;
  });
}

// v260：把天数换成人话——"365天"不如直接说"一年"，"30天"不如说
// "一个月"，付款前一眼就能看懂到期是多久，不用自己心算。
function describeDuration(days: number, langEn: boolean): string {
  if (langEn) {
    if (days === 1) return "1 day";
    if (days === 30) return "1 month";
    if (days === 365) return "1 year";
    return `${days} days`;
  }
  if (days === 1) return "1 天";
  if (days === 30) return "1 个月";
  if (days === 365) return "1 年";
  return `${days} 天`;
}

// v259：重新做了一遍流程，跟之前不一样的地方——之前是进页面直接弹
// 二维码，这次改成先有一个"订单确认"阶段：真实订单号、商品、数量、
// 金额、买家信息（登录邮箱）、支付方式选择，全部先摆出来，用户看清楚
// 之后点"立即支付"，这时候才展示二维码。订单本身在"订单确认"这个
// 阶段就已经真实创建好了（不是等点了"立即支付"才创建）——这样订单号
// 从一开始展示的就是真实、已经存在于数据库里的号码，不是占位符。
type PayStatus = "loading" | "review" | "waiting" | "success" | "error";

// 场域订单卡片用的缩略图——直接复用每个产品完整报告页已经在用的
// 封面图（page-0.png），不用额外生成新素材。关系共振按关系类型分了
// 三套图，这里统一用general这一套做订单卡缩略图（不影响报告本身
// 用的是哪一套，报告页自己会按relationshipType选对应的那套）。
const THUMB_BY_PRODUCT: Record<string, string> = {
  "life-map-report": "/images/lifemap/compass-poster.jpg",
  "relationship-resonance": "/images/relationship-full/general/page-0.png",
  "qian-reading": "/images/qian-full/page-0.png",
  "tarot-reading": "/images/tarot-full/page-0.png",
  "resilience-report": "/images/resilience-full/page-0.png",
  "romance-report": "/images/romance-full/page-0.png",
  "daily-tide-report": "/images/daily-tide-full/page-0.png",
  breath: "/images/practice/quantum-pause-chart.jpg",
  intuition: "/images/practice/intuition-chart.jpg",
  "heart-reset": "/images/practice/heart-reset-chart.jpg",
  "ascending-heart": "/images/practice/ascending-heart-chart.jpg",
};

function CheckoutInner() {
  const params = useSearchParams() ?? new URLSearchParams();
  const router = useRouter();
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);

  const productId = params.get("productId") ?? "";
  const submissionId = params.get("submissionId") ?? undefined;
  const contentName = params.get("name") ?? "";
  const redirectTo = params.get("redirect") ?? "/account/orders";
  const product = getProduct(productId);

  const [status, setStatus] = useState<PayStatus>("loading");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const [checkingNow, setCheckingNow] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const orderIdRef = useRef<string | null>(null);
  const codeUrlRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);
  const startedRef = useRef(false);

  // v262：微信内置浏览器场景——微信自己不允许在自己的浏览器里弹二维码
  // 让用户"自己扫自己"，这条路径必须走JSAPI（直接在当前页面里唤起
  // 微信原生收银台），不是Native扫码。isWechatBrowser只在浏览器端判断
  // （navigator只在客户端存在），SSR阶段先当作false，不影响首屏渲染。
  const isWechatBrowser =
    typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent);
  // 微信网页授权只使用已经备案、配置好的唯一主域。分享链接可能来自
  // .com、www.cn 或 www.com；不能把当前 host 原样交给 OAuth，否则
  // Cookie、授权 state 与回跳地址会分裂。客户端也做一次主域归一化，
  // 作为 CDN / 中间件缓存尚未更新时的第二道保护。
  const currentHostname = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  const isWechatCanonicalDomain = currentHostname === "lingxifield.cn";
  const cnSwitchUrl = typeof window !== "undefined" ? (() => {
    const canonical = new URL(window.location.href);
    canonical.protocol = "https:";
    canonical.hostname = "lingxifield.cn";
    canonical.port = "";
    return canonical.toString();
  })() : "";
  const jsapiParamsRef = useRef<{
    appId: string; timeStamp: string; nonceStr: string; package: string; signType: "RSA"; paySign: string;
  } | null>(null);
  const wechatCode = params.get("code") ?? undefined;
  const wechatState = params.get("state") ?? undefined;

  function invokeWeixinPay(
    jsapi: { appId: string; timeStamp: string; nonceStr: string; package: string; signType: string; paySign: string },
    onOk: () => void,
    onFail: (msg: string) => void
  ) {
    const w = window as unknown as {
      WeixinJSBridge?: { invoke: (event: string, params: unknown, cb: (res: { err_msg: string }) => void) => void };
    };
    const run = () => {
      w.WeixinJSBridge!.invoke("getBrandWCPayRequest", jsapi, (res) => {
        if (res.err_msg === "get_brand_wcpay_request:ok") onOk();
        else if (res.err_msg === "get_brand_wcpay_request:cancel") onFail(t("已取消支付", "Payment canceled"));
        else onFail(res.err_msg || t("支付调起失败", "Failed to open WeChat Pay"));
      });
    };
    if (typeof w.WeixinJSBridge === "undefined") {
      document.addEventListener("WeixinJSBridgeReady", run, false);
    } else {
      run();
    }
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setBuyerEmail(data.user?.email ?? "");
    });
  }, []);

  const checkPaidOnce = async (manual = false) => {
    if (!orderIdRef.current || doneRef.current) return;
    if (manual) setCheckingNow(true);
    try {
      const qRes = await fetch(`/api/pay/wechat/query?orderId=${orderIdRef.current}`);
      const qData = await qRes.json();
      if (qData.paid && !doneRef.current) {
        doneRef.current = true;
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus("success");
        setTimeout(() => { router.push(redirectTo); }, 1800);
      } else if (qData.unlockError) {
        setError(`支付已确认到账，但解锁时出现问题：${qData.unlockError}。请稍后在「场域入口 → 场域订单」里重试，不用重新付款。`);
      } else if (manual) {
        setError("");
      }
    } catch {
      // 单次查询失败不用管，下一次再试就行。
    } finally {
      if (manual) setCheckingNow(false);
    }
  };

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") checkPaidOnce();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // 第一步：创建真实订单——拿到真实订单号，但先不展示二维码，只展示
  // 订单信息本身，等用户看清楚了、主动点"立即支付"才进入下一步。
  const createOrder = async () => {
    setStatus("loading");
    setError("");

    // 微信内置浏览器 + 还没拿到code —— 先去做静默网页授权换code，
    // 换完微信会自动跳回这个页面（原有的productId等query会保留），
    // 到时候wechatCode就会有值，会走下面的JSAPI分支，不会再走这里。
    // 所有微信内入口先统一到备案主域；参数完整保留，用户不再遇到
    // "不允许的授权回跳地址"，OAuth 与登录 Cookie 也始终保持同源。
    if (isWechatBrowser && !isWechatCanonicalDomain) {
      window.location.replace(cnSwitchUrl);
      return;
    }

    if (isWechatBrowser && !wechatCode && isWechatCanonicalDomain) {
      try {
        const redirectUri = window.location.href.split("#")[0];
        const res = await fetch(`/api/pay/wechat/oauth-url?redirectUri=${encodeURIComponent(redirectUri)}`);
        const data = await res.json();
        if (!res.ok || !data.url) {
          setStatus("error");
          setError((data.error || "微信网页授权初始化失败"));
          return;
        }
        window.location.href = data.url;
        return; // 页面即将跳转，不用再往下走
      } catch {
        setStatus("error");
        setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
        return;
      }
    }

    try {
      const res = await fetch("/api/pay/wechat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, submissionId, ...(wechatCode ? { code: wechatCode, state: wechatState } : {}) }),
      });
      const rawText = await res.text();
      let data: {
        codeUrl?: string;
        orderId?: string;
        error?: string;
        detail?: string;
        jsapi?: { appId: string; timeStamp: string; nonceStr: string; package: string; signType: "RSA"; paySign: string };
      };
      try {
        data = JSON.parse(rawText);
      } catch {
        setStatus("error");
        setError(`场域连接超时或服务暂时不可用，请稍后再试。（状态码 ${res.status}）`);
        return;
      }
      if (!res.ok || !data.orderId || (!data.codeUrl && !data.jsapi)) {
        // 微信的code是一次性的——如果是重试导致的失败（用户点了"重试"，
        // 但code已经在第一次请求里用掉了），不要停在一个用户看不懂的
        // 报错上，直接把code从地址栏摘掉、重新走一次静默授权，对用户
        // 来说感觉不到中间这一步，只是稍微多等一下。
        // v267修复严重bug：这里原来只要"在微信里 && 有code"就无条件
        // 重新走一次授权，一旦下单本身持续失败（比如环境变量还没生效、
        // 商户配置有问题），就会变成 授权→失败→再授权→再失败 的死循环，
        // 用户看到的就是页面卡在"正在生成场域订单……"一直刷新、永远
        // 不出结果，而且完全看不到真正的报错原因。现在只允许自愈一次：
        // 地址栏里带上 lxretry 标记，第二次进来就不再重定向，直接把
        // 真实报错显示出来。
        const alreadyRetried = params.get("lxretry") === "1";
        if (isWechatBrowser && wechatCode && !alreadyRetried) {
          const clean = new URL(window.location.href);
          clean.searchParams.delete("code");
          clean.searchParams.delete("state");
          clean.searchParams.set("lxretry", "1");
          try {
            const redirectUri = clean.toString();
            const r2 = await fetch(`/api/pay/wechat/oauth-url?redirectUri=${encodeURIComponent(redirectUri)}`);
            const d2 = await r2.json();
            if (r2.ok && d2.url) { window.location.href = d2.url; return; }
          } catch { /* 掉到下面正常报错分支 */ }
        }
        setStatus("error");
        setError((data.error || "创建订单失败") + (data.detail ? ` (${data.detail})` : ""));
        return;
      }
      orderIdRef.current = data.orderId;
      if (data.jsapi) jsapiParamsRef.current = data.jsapi;
      if (data.codeUrl) codeUrlRef.current = data.codeUrl;
      setStatus("review");
    } catch {
      setStatus("error");
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
    }
  };

  // 第二步：用户点"立即支付"。微信内置浏览器场景走JSAPI——直接唤起
  // 微信原生收银台，不展示二维码（微信不允许在自己的浏览器里弹码给
  // 自己扫）；其它场景保持原来的Native扫码。
  const payNow = async () => {
    if (jsapiParamsRef.current) {
      setStatus("waiting");
      invokeWeixinPay(
        jsapiParamsRef.current,
        () => {
          checkPaidOnce();
          pollRef.current = setInterval(() => { checkPaidOnce(); }, 3000);
        },
        (msg) => { setStatus("review"); setError(msg); }
      );
      return;
    }
    if (!codeUrlRef.current) return;
    setStatus("waiting");
    const rawDataUrl = await QRCode.toDataURL(codeUrlRef.current, { width: 600, margin: 4, errorCorrectionLevel: "M" });
    const dataUrl = await addCenterBadge(rawDataUrl, "微信", "#07C160");
    setQrDataUrl(dataUrl);
    pollRef.current = setInterval(() => { checkPaidOnce(); }, 3000);
  };

  useEffect(() => {
    if (!product || startedRef.current) return;
    startedRef.current = true;

    const checkAccessBeforeOrdering = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: unlocks, error: unlockError } = await supabase
          .from("unlocks")
          .select("product_id, expires_at")
          .eq("user_id", user.id)
          .in("product_id", [productId, "everything"]);

        if (!unlockError && unlocks) {
          const now = Date.now();
          const hasAccess = unlocks.some((unlock: { expires_at: string | null }) =>
            !unlock.expires_at || new Date(unlock.expires_at).getTime() > now
          );
          if (hasAccess) {
            router.replace(redirectTo);
            return;
          }
        }
      }

      await createOrder();
    };

    void checkAccessBeforeOrdering();
    // createOrder intentionally remains tied to this one-shot checkout initialization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, productId, redirectTo, router]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-bone-dim"><Bi zh="找不到这个产品，请返回重试。" en="Product not found — please go back and try again." /></p>
        <Link href="/account/orders" className="mt-4 inline-block text-lattice hover:text-amber">
          <Bi zh="← 返回场域订单" en="← Back to Field Orders" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-2xl font-light text-bone">
        <Bi zh="场域订单" en="Field Order" />
      </h1>
      <p className="mt-1 text-xs text-bone-mute">
        <Bi zh="确认这次能量交换的内容，无误后再提交支付" en="Confirm this exchange before you submit payment" />
      </p>

      {status === "loading" && (
        // v274：等待态也要有框。之前这里是一段裸文字浮在极光背景上，
        // 跟前后都有玻璃面板的页面割裂，看起来像页面坏了。
        <div className="lx-glass mt-10 p-8 text-center">
          <p className="text-sm text-bone-soft"><Bi zh="正在确认访问权限……" en="Confirming your access…" /></p>
        </div>
      )}

      {(status === "review" || status === "waiting") && (
        <>
          {/* 场域订单卡——信息密度参照淘宝/天猫订单确认页（缩略图+
              标题+价格+买家信息+提交这几块一次性摆清楚，不用来回滑动
              才能看全），但措词全部换成灵犀场自己的语言："买家信息"
              换成"连接账号"，"数量"这种电商概念直接去掉（这里从来不是
              "买几件"，是"开启一次"），玻璃面板视觉延续全站风格，
              不套用淘宝的白底样式。 */}
          <div className="mt-6 overflow-hidden rounded-sm border border-white/10 bg-void-deep/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-3">
              <p className="text-[11px] uppercase tracking-widest2 text-bone-mute">
                <Bi zh="场域订单号" en="Field Order No." /> {orderIdRef.current}
              </p>
              <p className="text-[11px] uppercase tracking-widest2 text-lattice">
                <Bi zh="待支付" en="Pending" />
              </p>
            </div>

            <div className="flex items-start gap-4 px-5 py-4">
              {THUMB_BY_PRODUCT[productId] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={THUMB_BY_PRODUCT[productId]}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-sm border border-white/10 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg text-bone"><Bi zh={product.name} en={product.nameEn} /></p>
                {submissionId && (
                  <p className="mt-1 truncate text-xs text-bone-dim">
                    <Bi zh="对应内容" en="Linked to" />：{contentName || `#${submissionId.slice(0, 8)}`}
                  </p>
                )}
                {product.type === "subscription" && product.days && (
                  <p className="mt-1 text-xs text-amber/80">
                    <Bi
                      zh={`有效期：${describeDuration(product.days, false)}（从支付成功那一刻开始计算）`}
                      en={`Valid for: ${describeDuration(product.days, true)} (starting from the moment payment is confirmed)`}
                    />
                  </p>
                )}
                {product.type === "permanent" && (
                  <p className="mt-1 text-xs text-lattice">
                    <Bi zh="永久有效，不设到期时间" en="Permanent access, no expiry" />
                  </p>
                )}
              </div>
              <p className="shrink-0 font-display text-2xl text-amber">¥{product.priceRmb}</p>
            </div>

            {/* 权益说明——product.note本来就是"这次交换具体包含什么"的
                描述，这里单独用一个小标题把它摆出来，让它在付款前就是
                看得见的承诺，不是买完才知道。 */}
            <div className="border-t border-white/10 px-5 py-3">
              <p className="text-xs uppercase tracking-widest2 text-bone-mute">
                <Bi zh="本次交换包含" en="This Exchange Includes" />
              </p>
              <p className="mt-1.5 text-xs leading-6 text-bone-dim">
                <Bi zh={product.note} en={product.noteEn} />
              </p>
            </div>

            {buyerEmail && (
              <div className="border-t border-white/10 px-5 py-3">
                <p className="text-xs text-bone-dim">
                  <Bi zh="连接账号" en="Connected Account" />：{buyerEmail}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-5 py-3">
              <p className="text-xs text-bone-dim"><Bi zh="应付总额" en="Total Due" /></p>
              <p className="font-display text-xl text-amber">¥{product.priceRmb}</p>
            </div>
          </div>

          {/* 支付方式选择 */}
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest2 text-bone-dim"><Bi zh="支付方式" en="Payment Method" /></p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-sm border border-lattice bg-lattice/10 p-4 text-center text-lattice">
                <p className="font-display text-sm"><Bi zh="✓ 微信支付" en="✓ WeChat Pay" /></p>
              </div>
              <div className="cursor-not-allowed rounded-sm border border-white/10 p-4 text-center text-bone-mute">
                <p className="font-display text-sm"><Bi zh="支付宝" en="Alipay" /></p>
                <p className="mt-1 text-[10px] uppercase tracking-widest2"><Bi zh="即将上线" en="Coming Soon" /></p>
              </div>
            </div>
          </div>

          {status === "review" && (
            <button
              onClick={payNow}
              className="mt-8 w-full bg-lattice py-4 font-display text-sm uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
            >
              <Bi zh={`立即支付 · ¥${product.priceRmb}`} en={`Pay Now · ¥${product.priceRmb}`} />
            </button>
          )}

          {status === "waiting" && jsapiParamsRef.current && (
            <div className="lx-glass mt-8 p-6 text-center">
              <p className="text-sm leading-6 text-bone">
                <Bi zh="正在唤起微信支付……如果没有自动弹出，请稍等或返回重试" en="Opening WeChat Pay… if nothing pops up, please wait or try again" />
              </p>
              <button
                onClick={() => checkPaidOnce(true)}
                disabled={checkingNow}
                className="mt-4 w-full border border-lattice bg-void-deep py-3 text-xs uppercase tracking-widest2 text-lattice transition hover:bg-lattice hover:text-void-deep disabled:opacity-50"
              >
                {checkingNow ? <Bi zh="正在查询…" en="Checking…" /> : <Bi zh="我已完成支付，帮我确认一下 →" en="I've paid — check now →" />}
              </button>
              {error && <p className="mt-3 text-xs text-rose">{error}</p>}
            </div>
          )}

          {status === "waiting" && qrDataUrl && !jsapiParamsRef.current && (
            <div className="mt-8 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="微信支付二维码" className="mx-auto h-56 w-56 rounded-sm bg-white p-2" />
              <div className="mx-auto mt-4 max-w-sm rounded-sm border border-lattice/30 bg-lattice/5 p-4">
                <p className="text-sm leading-6 text-bone">
                  <Bi zh="打开微信 · 扫一扫，完成支付后页面会自动跳转" en="Open WeChat and scan — the page will jump automatically once paid" />
                </p>
                {/* v261：之前这里写的"存到相册再扫"，微信支付官方文档
                    明确写了不支持这条路径（为了防止二维码截图被盗用/
                    钓鱼，微信统一关闭了"从相册识别二维码完成支付"这个
                    功能），照着做只会看到微信弹出报错，不是真的能走通
                    的办法。这里换成更准确的说明。 */}
                <p className="mt-2 text-xs leading-6 text-bone-dim">
                  <Bi
                    zh="出于支付安全考虑，微信不支持保存二维码到相册后再扫描付款——如果当前设备不方便直接扫码，可以换一台手机、用它的微信直接扫这张二维码"
                    en="For payment security, WeChat doesn't support scanning a saved QR code from your photo album — if this device isn't convenient for scanning directly, use a different phone's WeChat to scan this code instead"
                  />
                </p>
              </div>
              <button
                onClick={() => checkPaidOnce(true)}
                disabled={checkingNow}
                className="mt-4 w-full border border-lattice bg-void-deep py-3 text-xs uppercase tracking-widest2 text-lattice transition hover:bg-lattice hover:text-void-deep disabled:opacity-50"
              >
                {checkingNow ? <Bi zh="正在查询…" en="Checking…" /> : <Bi zh="我已完成支付，帮我确认一下 →" en="I've paid — check now →" />}
              </button>
              {error && <p className="mt-3 text-xs text-rose">{error}</p>}
            </div>
          )}
        </>
      )}

      {status === "success" && (
        <div className="lx-glass mt-10 p-8 text-center">
          <p className="font-display text-2xl text-lattice">✓</p>
          <p className="mt-3 text-sm text-bone"><Bi zh="能量交换完成" en="Exchange complete" /></p>
          <p className="mt-3 text-xs leading-6 text-bone-dim">
            <Bi zh="正在带你去场域订单……" en="Taking you to Field Orders…" />
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-10 text-center">
          <p className="text-sm text-rose">{error}</p>
          {isWechatBrowser && !isWechatCanonicalDomain ? (
            <a
              href={cnSwitchUrl}
              className="mt-4 inline-block bg-lattice px-6 py-2 text-xs uppercase tracking-widest2 text-void-deep transition hover:bg-amber"
            >
              <Bi zh="切换到 lingxifield.cn 继续 →" en="Switch to lingxifield.cn →" />
            </a>
          ) : (
            <button
              onClick={createOrder}
              className="mt-4 border border-lattice/40 px-6 py-2 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice"
            >
              <Bi zh="重试" en="Try Again" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Nav />
      <main className="pt-24">
        <Suspense fallback={<div className="py-24 text-center text-bone-dim">…</div>}>
          <CheckoutInner />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
