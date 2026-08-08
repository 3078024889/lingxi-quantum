import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TarotReadingReport from "./TarotReadingReport";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "你的三重生命镜像解读 | 灵犀量子生命镜像 · Lingxi",
  robots: { index: false, follow: false },
};

export default function TarotReadingFullPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams?.id;

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24">
        {!id ? (
          <div className="mx-auto max-w-md px-6 py-24 text-center">
            <p className="font-display text-2xl text-bone">
              <span data-lang="zh">缺少记录编号</span>
              <span data-lang="en">Missing submission ID</span>
            </p>
            <a
              href="/mirror/reading"
              className="mt-8 inline-block border border-lattice/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone"
            >
              <span data-lang="zh">返回三张牌阵</span>
              <span data-lang="en">Back to the Three-Card Reading</span>
            </a>
          </div>
        ) : (
          <TarotReadingReport id={id} />
        )}
      </main>
      <Footer />
    </>
  );
}
