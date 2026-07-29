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
  const [checkingNow, setCheckingNow] = useState(false);
  const orderIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  // v251：真实问题——之前只靠一个每3秒跑一次的setInterval去检测"付了
  // 没"，但手机浏览器对切到后台、离开太久的标签页，经常会暂停里面的
  // 定时器。v244那次为了解决扫码识别问题，专门加了"长按保存到相册、
  // 切到微信App扫一扫识别"这条路径——这恰好意味着用户会离开这个页面
  // 所在的标签页去完成支付，付完款切回来的时候，那个定时器可能已经
  // 被浏览器暂停了，没能及时发现支付成功。这里补一个"页面重新变为可见
  // 时，立刻主动查一次"的监听，不用等定时器自己恢复；另外加一个手动
  // 按钮兜底，万一自动检测两条路都没赶上，用户自己点一下也能确认。
  const checkPaidOnce = async (manual = false) => {
    if (!orderIdRef.current || doneRef.current) return;
    if (manual) setCheckingNow(true);
    try {
      const qRes = await fetch(`/api/pay/wechat/query?orderId=${orderIdRef.current}`);
      const qData = await qRes.json();
      if (qData.paid && !doneRef.current) {
        doneRef.current = true;
        if (pollRef.current) clearInterval(pollRef.current);
        onSuccess();
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
        // v244：之前 width:260, margin:1 ——分辨率偏低、二维码周围几乎
        // 没有留白（专业说法叫"静区"，扫码识别就是靠这圈留白来判断
        // 二维码的边界在哪）。这在屏幕上直接扫没问题，但保存到相册、
        // 微信压缩一遍、再从相册扫这条链路，图片质量和留白都会被进一步
        // 压缩，260px+几乎没有留白的二维码，大概率就识别不出来了——
        // 这不是微信支付网关的问题，是我们自己生成这张图的参数需要
        // 更保守一点。这里把分辨率提到600px、留白按标准给够、纠错级别
        // 调到M（能容忍最多15%的图像损坏仍然可读），专门是为了扛住
        // "保存-压缩-重新扫描"这条链路。
        const dataUrl = await QRCode.toDataURL(data.codeUrl, { width: 600, margin: 4, errorCorrectionLevel: "M" });
        setQrDataUrl(dataUrl);
        setStatus("waiting");

        pollRef.current = setInterval(() => { checkPaidOnce(); }, 3000);
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
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 px-6"
      onClick={() => {
        // v252：之前不管什么状态，点一下背景就直接关闭弹窗——等待
        // 支付确认的这个阶段（status==="waiting"），关掉弹窗会连带
        // 丢失这笔订单的追踪状态。用户如果没点准那个"我已完成支付"
        // 按钮、手滑碰到旁边的背景，弹窗就整个消失了，钱可能确实付了，
        // 页面却已经不知道该去查哪一笔。这里改成：只有不在等待支付
        // 这个状态时，点背景才会关闭；正在等待支付的时候，必须点右上
        // 角那个"✕"才能关，且点"✕"时会有一次确认，避免误触直接关掉。
        if (status !== "waiting") onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-sm border border-lattice/25 bg-void-deep p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            if (status === "waiting" && !window.confirm("确定要关闭吗？如果你已经完成支付，建议先点「我已完成支付，帮我确认一下」，确认成功之后再关闭。")) {
              return;
            }
            onClose();
          }}
          className="float-right text-bone-dim hover:text-bone"
        >
          ✕
        </button>
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
            <img src={qrDataUrl} alt="微信支付二维码" className="mx-auto mt-6 h-48 w-48 rounded-sm bg-white p-2" />
            <p className="mt-4 text-xs text-bone-dim">
              <Bi zh="打开微信 · 扫一扫，完成支付后页面会自动跳转" en="Open WeChat and scan — the page will jump automatically once paid" />
            </p>
            <p className="mt-1 text-xs text-bone-dim/70">
              <Bi
                zh="如果暂时不方便扫码，可以长按二维码保存到相册，之后用微信「扫一扫」右上角的相册图标识别"
                en="If you can't scan right now, long-press to save this QR code, then use WeChat's Scan feature and pick it from your album"
              />
            </p>
            <button
              onClick={() => checkPaidOnce(true)}
              disabled={checkingNow}
              className="sticky bottom-0 mt-4 w-full border border-lattice bg-void-deep py-3 text-xs uppercase tracking-widest2 text-lattice shadow-[0_-8px_16px_rgba(0,0,0,0.4)] transition hover:bg-lattice hover:text-void-deep disabled:opacity-50"
            >
              {checkingNow ? <Bi zh="正在查询…" en="Checking…" /> : <Bi zh="我已完成支付，帮我确认一下 →" en="I've paid — check now →" />}
            </button>
          </>
        )}

        {status === "error" && (
          <p className="mt-8 text-sm text-rose">{error}</p>
        )}
      </div>
    </div>
  );
}
