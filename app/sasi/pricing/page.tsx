import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CREDIT_PACKS } from "@/lib/sasi/catalog";
import { sasiReadiness } from "@/lib/sasi/readiness";
import { sasiTopupProductEnabled } from "@/lib/sasi/payment-gate";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "SASI 产品与充值｜灵犀场 AI创作工作台",
  description: "从剧本、集数与时长开始，确认制作方案和预算，再启动创作。查看 SASI 产品、人民币余额充值、任务结算与交付说明。",
  alternates: { canonical: "/sasi/pricing" },
};

export default function SasiPricingPage() {
  const readiness = sasiReadiness();
  const packs = CREDIT_PACKS.filter(pack => sasiTopupProductEnabled(pack.id));
  return <><Nav /><main className="mx-auto max-w-6xl px-6 py-20">
    <p className="text-sm tracking-[.2em] text-lattice">灵犀场 · SASI</p>
    <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">让想法开始成为作品</h1>
    <p className="mt-6 max-w-3xl text-lg leading-8">带来一个故事、一份剧本，或一个产品目标。先看清要做什么、交付什么、需要多少预算，再决定开始。</p>
    <div className="mt-7 flex flex-wrap gap-4"><Link className="rounded-xl border px-5 py-3" href="/?view=director">带来我的剧本 →</Link><Link className="rounded-xl border px-5 py-3" href="/?view=billing#topup">进入余额与充值 →</Link></div>
    <section className="mt-12 grid gap-5 md:grid-cols-3" aria-label="产品与交付">
      {[
        ["苍玄 AI导演", "整理故事、角色、世界规则与镜头方案。在同一个项目中继续修改，保留创作目标。", "/?view=director"],
        ["AI短剧工坊", "输入剧本、集数与每集秒数，准备制作任务。可用制作通道会在执行前给出报价与交付规格。", "/?view=drama"],
        ["网站与应用构建", "整理页面、功能、实施步骤与验收标准。自动编程和部署仍在接入，不按已完成交付收费。", "/?view=build"],
      ].map(([title, text, href]) => <article key={title} className="rounded-2xl border p-6"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-4 leading-7">{text}</p><Link className="mt-5 inline-block text-lattice" href={href}>打开工作台 →</Link></article>)}
    </section>
    <section className="mt-12 rounded-3xl border p-7 sm:p-10">
      <h2 className="text-2xl font-semibold">从目标到交付，每一步都清楚</h2>
      <ol className="mt-6 grid gap-6 md:grid-cols-3">
        <li><b>01 · 描述作品</b><p className="mt-3 leading-7">提供剧本、集数、时长与期望画面；也可以从一句想法开始完善。</p></li>
        <li><b>02 · 确认方案与预算</b><p className="mt-3 leading-7">视频任务按秒核算，报价包含本次制作与工作流费用。不满意可以修改要求，确认后才执行。</p></li>
        <li><b>03 · 制作与交付</b><p className="mt-3 leading-7">以实际任务结果结算，未用的预留余额释放。超出已确认预算时暂停，重新征求你的决定。</p></li>
      </ol>
    </section>
    <section className="mt-12" id="recharge">
      <h2 className="text-2xl font-semibold">为下一次创作准备余额</h2>
      <p className="mt-4 leading-7">人民币余额用于 SASI 制作任务。充值金额不是一部短剧的固定价格，也不是会员周期；具体作品以你确认的报价为准。</p>
      <p role="status" className="mt-4 rounded-xl border p-4">{readiness.productionReady ? "制作充值已开放。登录后选择金额与可用支付方式，支付核验成功后到账。" : "目前可准备项目与制作需求。付费制作与充值尚未开放；开通后可在余额页使用，不会在此提前扣款。"}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{packs.map(pack => <Link href="/?view=billing#topup" key={pack.id} className="rounded-xl border p-5"><b className="text-2xl">¥{pack.priceRmb.toLocaleString("zh-CN")}</b><p className="mt-2 text-sm">人民币创作余额</p></Link>)}</div>
      <Link href="/?view=billing#topup" className="mt-6 inline-block rounded-xl border px-6 py-3">查看账户与充值状态 →</Link>
    </section>
    <section className="mt-12 space-y-4 border-t pt-8"><h2 className="text-xl font-semibold">购买前了解</h2><p className="leading-7">付费前可查看金额、制作规格和预算上限。作品保存在账户的作品库中。AI生成效果受素材和模型能力影响，不承诺播放量或爆款结果。</p><div className="flex flex-wrap gap-5"><Link href="/legal/sasi">SASI 创作规则</Link><Link href="/refunds">结算与退款说明</Link><Link href="/terms">服务协议</Link><Link href="/privacy">隐私政策</Link></div></section>
  </main><Footer /></>;
}
