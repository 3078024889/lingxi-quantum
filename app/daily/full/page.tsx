import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DailyTideReportView from "./DailyTideReportView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "你的今日潮汐深度报告 | 灵犀场 · Lingxi",
  robots: { index: false, follow: false },
};

export default function DailyTideFullPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams?.id;

  return (
    <>
      <Nav />
    <main className="lx-report-main min-h-screen">
        {!id ? (
          <div className="mx-auto max-w-md px-6 py-24 text-center">
            <p className="font-display text-2xl text-[var(--lx-ink)]">
              <span data-lang="zh">缺少记录编号</span>
              <span data-lang="en">Missing submission ID</span>
            </p>
            <a
              href="/daily"
              className="mt-8 inline-block border border-[var(--lx-line-strong)] px-8 py-3 font-display text-sm uppercase tracking-widest2 text-[var(--lx-ink)] transition hover:border-[var(--lx-line-strong)] hover:text-[var(--lx-ink)]"
            >
              <span data-lang="zh">返回今日潮汐</span>
              <span data-lang="en">Back to Today’s Tide</span>
            </a>
          </div>
        ) : (
          <DailyTideReportView id={id} />
        )}
      </main>
      <Footer />
    </>
  );
}
