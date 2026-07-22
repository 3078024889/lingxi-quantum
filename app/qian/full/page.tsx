import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import QianReport from "./QianReport";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "你的三支签 | 摇签 · Lingxi",
  robots: { index: false, follow: false },
};

export default function QianFullPage({
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
              href="/qian"
              className="mt-8 inline-block border border-lattice/40 px-8 py-3 font-display text-sm uppercase tracking-widest2 text-lattice transition hover:border-lattice hover:text-bone"
            >
              <span data-lang="zh">返回摇签</span>
              <span data-lang="en">Back to Sign Drawing</span>
            </a>
          </div>
        ) : (
          <QianReport id={id} />
        )}
      </main>
      <Footer />
    </>
  );
}
