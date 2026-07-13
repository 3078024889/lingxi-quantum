import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FullReportView from "./FullReportView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "你的完整生命图谱 | 灵犀 · Lingxi",
  robots: { index: false, follow: false },
};

export default function FullLifeMapPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams?.id;

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-16">
        {!id ? (
          <div className="mx-auto max-w-md px-6 py-24 text-center">
            <p className="font-display text-2xl text-lm2-text">
              <span data-lang="zh">缺少报告编号</span>
              <span data-lang="en">Missing report ID</span>
            </p>
            <a
              href="/life-map"
              className="mt-8 inline-block border border-lm2-violet/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lm2-violet transition hover:border-lm2-violet hover:text-lm2-text"
            >
              <span data-lang="zh">返回生命图谱</span>
              <span data-lang="en">Back to Life Map</span>
            </a>
          </div>
        ) : (
          <FullReportView id={id} />
        )}
      </main>
      <Footer />
    </>
  );
}
