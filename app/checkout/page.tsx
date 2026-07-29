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

// v256：独立的付款页——之前是弹窗，这次照淘宝订单确认页那种样式做成
// 一整页：商品信息、金额、支付方式选择（微信支付可以真的用；支付宝
// 目前还没接，摆出来但标"即将上线"，不假装能用）、提交按钮。数字
// 内容不需要收货地址，这里直接跳过，不像电商那样问"寄到哪"。
//
// 复用的是跟WechatPayModal完全一样的后端接口（/api/pay/wechat/create、
// /api/pay/wechat/query），没有另外写一套支付逻辑——这次只是换了个
// 呈现方式（整页 vs 弹窗），核心的下单、轮询、解锁判断，都是同一套
// 已经在v253修过根因的代码，不是重新发明。

type PayStatus = "form" | "creating" | "waiting" | "success" | "error";

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const langEn = useLang();
  const t = (zh: string, en: string) => (langEn ? en : zh);

  const productId = params.get("productId") ?? "";
  const submissionId = params.get("submissionId") ?? undefined;
  const redirectTo = params.get("redirect") ?? "/account/orders";
  const product = getProduct(productId);

  const [status, setStatus] = useState<PayStatus>("form");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const [checkingNow, setCheckingNow] = useState(false);
  const orderIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

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

  const submitOrder = async () => {
    setStatus("creating");
    setError("");
    try {
      const res = await fetch("/api/pay/wechat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, submissionId }),
      });
      const rawText = await res.text();
      let data: { codeUrl?: string; orderId?: string; error?: string; detail?: string };
      try {
        data = JSON.parse(rawText);
      } catch {
        setStatus("error");
        setError(`场域连接超时或服务暂时不可用，请稍后再试。（状态码 ${res.status}）`);
        return;
      }
      if (!res.ok || !data.codeUrl) {
        setStatus("error");
        setError((data.error || "创建订单失败") + (data.detail ? ` (${data.detail})` : ""));
        return;
      }
      orderIdRef.current = data.orderId ?? null;
      const dataUrl = await QRCode.toDataURL(data.codeUrl, { width: 600, margin: 4, errorCorrectionLevel: "M" });
      setQrDataUrl(dataUrl);
      setStatus("waiting");
      pollRef.current = setInterval(() => { checkPaidOnce(); }, 3000);
    } catch {
      setStatus("error");
      setError(t("连接场域时出错，请稍后再试。", "Error connecting to the field — please try again."));
    }
  };

  // v257：照参考站点的样子——进页面就直接生成、展示二维码，不用先点
  // 一次"提交订单"再等二维码出来，少一步操作。只有productId真的能
  // 找到对应产品时才自动下单，避免productId传错的时候白白创建一笔
  // 没用的订单。
  const autoStarted = useRef(false);
  useEffect(() => {
    if (product && !autoStarted.current) {
      autoStarted.current = true;
      submitOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

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
        <Bi zh="确认订单" en="Confirm Order" />
      </h1>

      {/* 商品信息——照淘宝那种订单确认页的样式：商品名、数量、金额，
          数字内容不需要收货地址，直接跳过这一项。 */}
      <div className="mt-6 rounded-sm border border-white/10 bg-void-deep p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-lg text-bone"><Bi zh={product.name} en={product.nameEn} /></p>
            <p className="mt-1 text-xs text-bone-dim"><Bi zh={product.note} en={product.noteEn} /></p>
            <p className="mt-2 text-xs text-bone-dim/70">
              <Bi zh="数量" en="Qty" />：× 1
            </p>
          </div>
          <p className="shrink-0 font-display text-2xl text-amber">¥{product.priceRmb}</p>
        </div>
      </div>

      {status === "creating" && (
        <p className="mt-10 text-center text-sm text-bone-dim"><Bi zh="正在生成二维码……" en="Generating QR code…" /></p>
      )}

      {status === "waiting" && qrDataUrl && (
        <div className="mt-8">
          <p className="text-center text-xs uppercase tracking-widest2 text-bone-dim">
            <Bi zh="使用微信/支付宝扫码付款" en="Scan with WeChat or Alipay to Pay" />
          </p>
          {/* 两个码并排放，照参考图那样——微信是真的能扫的码；支付宝
              这一格没有真的二维码，是个占位说明，不会假装能扫。 */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="微信支付二维码" className="mx-auto h-48 w-48 rounded-sm bg-white p-2" />
              <p className="mt-2 text-xs text-lattice">
                <Bi zh="✓ 微信支付" en="✓ WeChat Pay" />
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-white/15 p-4">
              <p className="text-4xl text-bone-dim/20">支</p>
              <p className="mt-2 text-xs text-bone-dim/50">
                <Bi zh="支付宝 · 即将上线" en="Alipay · Coming Soon" />
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-bone-dim">
            <Bi zh="打开微信 · 扫一扫，完成支付后页面会自动跳转" en="Open WeChat and scan — the page will jump automatically once paid" />
          </p>
          <p className="mt-1 text-center text-xs text-bone-dim/70">
            <Bi
              zh="如果暂时不方便扫码，可以长按二维码保存到相册，之后用微信「扫一扫」右上角的相册图标识别"
              en="If you can't scan right now, long-press to save this QR code, then use WeChat's Scan feature and pick it from your album"
            />
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

      {status === "success" && (
        <div className="mt-10 text-center">
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
          <button
            onClick={submitOrder}
            className="mt-4 border border-lattice/40 px-6 py-2 text-xs uppercase tracking-widest2 text-lattice transition hover:border-lattice"
          >
            <Bi zh="重新生成二维码" en="Try Again" />
          </button>
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
