"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import Bi from "./Bi";

// ────────────────────────────────────────────────────────────────────
// 微信支付扫码弹窗——通用组件，四个产品的"解锁"按钮共用同一套
// ────────────────────────────────────────────────────────────────────
// 流程：点解锁 → 调用后端创建订单 → 拿到code_url → 前端生成二维码图片
// → 用户拿手机微信扫码付款 → 页面每3秒轮询一次"付了没" → 付款确认后
// 触发 onSuccess（一般是跳转到解锁后的结果页）。
export default function WechatPayModal({
  productId,
  submissionId,
  priceRmb,
  productName,
  onClose,
  onSuccess,
}: {
  productId: string;
  submissionId?: string;
  priceRmb: number;
  productName: { zh: string; en: string };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [status, setStatus] = useState<"creating" | "waiting" | "error">("creating");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const orderIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const createOrder = async () => {
      try {
        const res = await fetch("/api/pay/wechat/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, submissionId }),
        });
        // v240：如果服务器函数被平台在返回JSON之前就中断（比如触发了
        // 运行时长上限），拿到的响应体会是一段HTML错误页，不是JSON——
        // 这里先按文本读一次、自己尝试解析，解析失败就给一个人能看懂
        // 的错误提示，而不是让"Unexpected token '<'"这种技术报错直接
        // 展示给用户。
        const rawText = await res.text();
        let data: { codeUrl?: string; orderId?: string; error?: string; detail?: string };
        try {
          data = JSON.parse(rawText);
        } catch {
          setStatus("error");
          setError(`场域连接超时或服务暂时不可用，请稍后再试。（服务器返回了非预期的内容，状态码 ${res.status}）`);
          return;
        }
        if (!res.ok || !data.codeUrl) {
          setStatus("error");
          setError((data.error || "创建订单失败") + (data.detail ? ` (${data.detail})` : ""));
          return;
        }
        orderIdRef.current = data.orderId ?? null;
        const dataUrl = await QRCode.toDataURL(data.codeUrl, { width: 260, margin: 1 });
        setQrDataUrl(dataUrl);
        setStatus("waiting");

        pollRef.current = setInterval(async () => {
          if (!orderIdRef.current) return;
          try {
            const qRes = await fetch(`/api/pay/wechat/query?orderId=${orderIdRef.current}`);
            const qData = await qRes.json();
            if (qData.paid) {
              if (pollRef.current) clearInterval(pollRef.current);
              onSuccess();
            }
          } catch {
            // 单次轮询失败不用管，下一次再试就行。
          }
        }, 3000);
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "连接场域时出错");
      }
    };
    createOrder();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 px-6" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-sm border border-lattice/25 bg-void-deep p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="float-right text-bone-dim hover:text-bone">✕</button>
        <p className="font-display text-sm uppercase tracking-widest2 text-lattice/80">
          <Bi zh="微信扫码支付" en="Scan with WeChat to Pay" />
        </p>
        <p className="mt-2 text-sm text-bone-dim">
          <Bi zh={productName.zh} en={productName.en} />
        </p>
        <p className="mt-1 font-display text-2xl text-amber">¥{priceRmb}</p>

        {status === "creating" && (
          <p className="mt-8 text-sm text-bone-dim"><Bi zh="正在生成二维码……" en="Generating QR code…" /></p>
        )}

        {status === "waiting" && qrDataUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="微信支付二维码" className="mx-auto mt-6 h-56 w-56 rounded-sm bg-white p-2" />
            <p className="mt-4 text-xs text-bone-dim">
              <Bi zh="打开微信 · 扫一扫，完成支付后页面会自动跳转" en="Open WeChat and scan — the page will jump automatically once paid" />
            </p>
          </>
        )}

        {status === "error" && (
          <p className="mt-8 text-sm text-rose">{error}</p>
        )}
      </div>
    </div>
  );
}
