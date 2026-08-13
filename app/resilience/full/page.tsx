import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ResilienceReportView from "./ResilienceReportView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "你的生命韧性档案 | 灵犀场 · Lingxi",
  robots: { index: false, follow: false },
};

export default function ResilienceFullPage({
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
            <p className="font-display text-2xl text-bone">
              <span data-lang="zh">缺少记录编号</span>
              <span data-lang="en">Missing submission ID</span>
            </p>
            <a
              href="/resilience"
              className="mt-8 inline-block border border-lattice/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone"
            >
              <span data-lang="zh">返回生命韧性指数</span>
              <span data-lang="en">Back to Life Resilience Index</span>
            </a>
          </div>
        ) : (
          <ResilienceReportView id={id} />
        )}
      </main>
      <Footer />
    </>
  );
}
