import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RelationshipReportView from "./RelationshipReportView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "你的关系共振图谱 | 灵犀场 · Lingxi",
  robots: { index: false, follow: false },
};

export default function RelationshipFullPage({
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
              <span data-lang="zh">缺少报告编号</span>
              <span data-lang="en">Missing report ID</span>
            </p>
            <a
              href="/relationship"
              className="mt-8 inline-block border border-lattice/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone"
            >
              <span data-lang="zh">返回关系共振图谱</span>
              <span data-lang="en">Back to Relationship Resonance Map</span>
            </a>
          </div>
        ) : (
          <RelationshipReportView id={id} />
        )}
      </main>
      <Footer />
    </>
  );
}
