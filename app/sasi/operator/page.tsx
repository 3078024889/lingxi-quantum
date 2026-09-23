import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { isSasiOperator } from "@/lib/sasi/operator/access";
import { loadSasiProductionHealth } from "@/lib/sasi/operator/production-health";
import { loadSasiOperatorEvidence } from "@/lib/sasi/operator/evidence";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "灵犀场 SASI · Operator",
  robots: { index: false, follow: false },
};

function State({
  ok,
  yes = "READY",
  no = "PENDING",
}: {
  ok: boolean;
  yes?: string;
  no?: string;
}) {
  return (
    <span className={ok ? "text-emerald-700" : "text-amber-700"}>
      {ok ? yes : no}
    </span>
  );
}

export default async function SasiOperatorPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSasiOperator(user.email)) notFound();

  const [health, evidence] = await Promise.all([
    loadSasiProductionHealth(),
    loadSasiOperatorEvidence(),
  ]);

  const streams = [
    ["Learning events", evidence.learningEvents],
    ["User feedback", evidence.feedback],
    ["External work", evidence.externalWork],
    ["Candidate competitions", evidence.candidateCompetitions],
    ["Promotions", evidence.promotions],
    ["Rollbacks", evidence.rollbacks],
  ] as const;

  return (
    <>
      <Nav />
      <main className="lx10-page">
        <div className="lx10-wrap">
          <p className="lx10-kicker">SASI · Operator</p>
          <h1 className="lx10-title">生产状态、学习证据与演化轨迹</h1>
          <p className="lx10-lead">
            这里不推断“已经上线”。页面只显示服务端当前能实际读取到的结构、模型配置与演化证据。
          </p>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="text-xs uppercase tracking-[.16em] text-slate-400">
                Cognitive schema
              </div>
              <div className="mt-2 text-xl font-semibold">
                <State ok={health.schemaReady} yes="READY" no="MIGRATIONS PENDING" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="text-xs uppercase tracking-[.16em] text-slate-400">
                Reasoner
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {health.reasoning.model}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {health.reasoning.apiKeyConfigured ? "API key configured" : "API key missing"}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="text-xs uppercase tracking-[.16em] text-slate-400">
                AI billing
              </div>
              <div className="mt-2 text-xl font-semibold">
                <State
                  ok={
                    health.billing.walletTableAvailable &&
                    health.billing.requestTableAvailable
                  }
                />
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-950">
              演化证据流
            </h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {streams.map(([label, stream]) => (
                <article
                  key={label}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
                    <State
                      ok={stream.available}
                      yes={`${stream.rows.length} recent`}
                      no="unavailable"
                    />
                  </div>
                  {stream.available && stream.rows.length > 0 ? (
                    <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">
                      {JSON.stringify(stream.rows.slice(0, 5), null, 2)}
                    </pre>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      {stream.available
                        ? "暂无记录。"
                        : "对应生产表尚不可读取，通常意味着 migration 尚未应用。"}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-950">关键表状态</h2>
            <div className="mt-4 grid gap-2">
              {health.criticalTables.map((table) => (
                <div
                  key={table.table}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3"
                >
                  <code className="break-all text-xs text-slate-700">{table.table}</code>
                  <span className="shrink-0 text-xs">
                    <State
                      ok={table.available}
                      yes={`${table.count ?? 0} rows`}
                      no="unavailable"
                    />
                  </span>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-5 text-xs text-slate-400">
            Checked {health.checkedAt}
          </p>
        </div>
      </main>
    </>
  );
}
